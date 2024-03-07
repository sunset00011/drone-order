#!/usr/bin/env python3

import asyncio
import requests
from mavsdk import System
from mavsdk.mission import (MissionItem, MissionPlan)
import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate('drone-location-389204-firebase-adminsdk-aslmn-fa3d2f9355.json')
firebase_admin.initialize_app(cred, {'databaseURL': 'https://drone-location-389204-default-rtdb.asia-southeast1.firebasedatabase.app/'})
threshold = 0.0001 

ref = db.reference('/location')


async def run():

    drone = System(mavsdk_server_address="localhost", port=50051)
    await drone.connect(system_address="udp://:14540")


    print("Waiting for drone to connect...")
    async for state in drone.core.connection_state():
        if state.is_connected:
            print(f"-- Connected to drone!")
            break

    print("Getting Order receive location information...")

    api_url = "http://localhost:8080/api/order/drone/656ca0795ae2bbcfaecc9acf" 
    response = requests.get(api_url)
    orders = response.json()
    order = orders[0]
    receive_location = order.get("receiveLocation", {})
    receive_location_lat = receive_location.get("lat")
    receive_location_long = receive_location.get("long")
    print(receive_location_lat, " ",receive_location_long)

    print_mission_progress_task = asyncio.ensure_future(
        print_mission_progress(drone))

    running_tasks = [print_mission_progress_task]

    termination_task = asyncio.ensure_future(
        observe_is_in_air(drone, running_tasks))

    mission_items = []
    # mission_items.append(MissionItem(21.036844,
    #                                  105.782701,
    #                                  5,
    #                                  10,
    #                                  True,
    #                                  float('nan'),
    #                                  float('nan'),
    #                                  MissionItem.CameraAction.NONE,
    #                                  float('nan'),
    #                                  float('nan'),
    #                                  float('nan'),
    #                                  float('nan'),
    #                                  float('nan')))
    mission_items.append(MissionItem(receive_location_lat,
                                     receive_location_long,
                                     5,
                                     10,
                                     True,
                                     float('nan'),
                                     float('nan'),
                                     MissionItem.CameraAction.NONE,
                                     float('nan'),
                                     float('nan'),
                                     float('nan'),
                                     float('nan'),
                                     float('nan')))


    mission_plan = MissionPlan(mission_items)

    await drone.mission.set_return_to_launch_after_mission(True)

    print("-- Uploading mission")
    await drone.mission.upload_mission(mission_plan)

    print("Waiting for drone to have a global position estimate...")
    async for health in drone.telemetry.health():
        if health.is_global_position_ok and health.is_home_position_ok:
            print("-- Global position state is good enough for flying.")
            break

    print("Fetching amsl altitude at home location....")
    async for terrain_info in drone.telemetry.home():
        absolute_altitude = terrain_info.absolute_altitude_m
        break

    print("-- Arming")
    await drone.action.arm()

    print("-- Take off")
    await drone.action.takeoff()

    print("-- Starting mission")
    await drone.mission.start_mission()

    asyncio.ensure_future(
        print_position(
            drone, 
            receive_location_lat, 
            receive_location_long,
            "656ca0795ae2bbcfaecc9acf"))

    await termination_task
    
    



    while True:
        print("Press Ctrl + C to exist!")
        await asyncio.sleep(1)

async def print_position(drone, receiveLat, receiveLong,droneId):
    async for position in drone.telemetry.position():
        print(position.latitude_deg, " ", position.longitude_deg)
        ref.child(droneId).update({
            'lat': position.latitude_deg,
            'lng': position.longitude_deg
        })
        if (
            abs(position.latitude_deg - receiveLat) < threshold
            and
            abs(position.longitude_deg - receiveLong) < threshold
            ):
            return

       
async def print_mission_progress(drone):
    async for mission_progress in drone.mission.mission_progress():
        print(f"Mission progress: "
              f"{mission_progress.current}/"
              f"{mission_progress.total}")
        
async def observe_is_in_air(drone, running_tasks):
    """ Monitors whether the drone is flying or not and
    returns after landing """

    was_in_air = False

    async for is_in_air in drone.telemetry.in_air():
        if is_in_air:
            was_in_air = is_in_air

        if was_in_air and not is_in_air:
            for task in running_tasks:
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
            await asyncio.get_event_loop().shutdown_asyncgens()

            return

if __name__ == "__main__":
    # Run the asyncio loop
    asyncio.run(run())