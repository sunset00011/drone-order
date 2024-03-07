import React, {useEffect, useState} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Collapse,
    useMediaQuery, FormControl, Box, Select, MenuItem,
} from '@mui/material';
import { MdKeyboardArrowDown } from 'react-icons/md'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {Badge, Button, Col, Input, Label, Modal, ModalBody, Row} from "reactstrap";
import {GoogleMap, Marker, Polyline, useJsApiLoader} from "@react-google-maps/api";

import warehouse from "../../../Pages/Order/warehouse-location-blue.png";
import warehouseBlack from "../../../Pages/Order/warehouse-location-black.png";
import client from "../../../Pages/Order/icons8-client-48.png";
import axios from "axios";
import {toast} from "react-toastify";
import drone from "../../../Pages/Order/drone-device.png";
import {onValue, ref} from "firebase/database";
import database from "../../../firebase_setup/firebase";
import {BiFilterAlt} from "react-icons/bi";


const calculateDistance = (pointA, pointB) => {
    const R = 6371; // Radius of the Earth in kilometers

    const lat1Rad = toRadians(pointA.lat);
    const lon1Rad = toRadians(pointA.long);
    const lat2Rad = toRadians(pointB.lat);
    const lon2Rad = toRadians(pointB.long);

    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const resultDistance = R * c; // Distance in kilometers

    return resultDistance;
};

const toRadians = (angle) => {
    return angle * (Math.PI / 180);
};



const initOrder = {
    "_id": "",
    "user": {
        "_id": "",
        "firstName": "",
        "lastName": "",
        "phoneNumber": "",
        "email": "",
    },
    "product": {
        "_id": "",
        "name": "",
        "brand": "",
        "price": 0,
        "category": "",
        "image": "",
        "rating": 0,
        "type": "",
        "author": "",
        "description": "",
    },
    "receiveLocation": {
        "_id": "",
        "name": "",
        "image": "",
        "address": "",
        "lat": 21.036945,
        "long": 105.782503,
    },
    "drone": {
        "_id": "",
        "name": "",
        "image": "",
        "maxSpeed": 0,
        "payLoad": 0,
        "status": "",
        "condition": "",
    },
    "quantity": 0,
    "address": "",
    "city": "",
    "lat": 21.036844,
    "long": 105.782701,
}


const initDroneData = {
    _id: '',
    name: '',
    image: '',
    payLoad: 0,
    maxSpeed: 0,
    condition: '',
    "status": ""
}

const initDroneStationPosition = [
    {
        lat: 21.036844, lng: 105.782702
    },

]

const center = {
    lat: 21.036844,
    lng: 105.782701,
};

const optionsPolyline = {
    strokeColor: '#1E73F3',
    strokeOpacity: 0.8,
    strokeWeight: 3,
    fillColor: '#1E73F3',
    fillOpacity: 0.35,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: 30000,
    zIndex: 1
};

const OrderTable = () => {

    const [orders, setOrders] = useState([]);

    const [filterStatus, setFilterStatus] = useState("In Progress")
    const [title, setTitle] = useState("In Progress")

    let authToken = localStorage.getItem("Authorization")

    const [openOrderId, setOpenOrderId] = useState("");

    const [modalTracking, setModalUpdate] = useState(false);
    const [flyingPathPositions, setFlyingPathPositions] = useState(initDroneStationPosition)
    const [selectTrackingOrder, setSelectTrackingOrder] = useState(initOrder)
    const [currentLocation,setCurrentLocation] = useState(center);
    const [trackingDroneId, setTrackingDroneId] = useState('656c9fe85ae2bbcfaecc9ac5')

    const [droneData, setDroneData] = useState(initDroneData);
    const [drones, setDrones] = useState([]);
    const [modalSelectDrone, setModalSelectDrone] = useState(false);

    const [modalReceiveLocation, setModalReceiveLocation] = useState(false);
    const [receiveLocationId, setReceiveLocationId] = useState("");
    const [receiveLocation, setReceiveLocation] = useState({})
    const [receiveLocations, setReceiveLocations] = useState([]);

    const [modalSuccessful, setModalSuccessful] = useState(false);

    const [isLoadedMap, setIsLoadedMap] = useState(false);

    const [orderSelect, setOrderSelect] = useState(initOrder);

    console.log(process.env.GOOGLE_MAP_API_KEY)

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
    });

    useEffect(() => {
        console.log('This is id: ' + receiveLocationId)

    }, [receiveLocationId]);
    useEffect(() => {
        console.log(droneData)

    }, [droneData]);

    const fetchdata = async () => {
        const starCountRef = ref(database, `location/${trackingDroneId}`);
        onValue(starCountRef, (snapshot) => {
            const data = snapshot.val();
            setCurrentLocation(data);
            console.log(data);
        });
    };

    useEffect(() => {
        fetchdata();
        console.log(trackingDroneId);
    }, [trackingDroneId]);

    useEffect(() => {
        console.log(currentLocation)
    }, [currentLocation]);


    const getAllLocation = async () => {
        const { data } = await axios.get(`${process.env.REACT_APP_LOCATION_API}`, {
            headers: {
                'Authorization': authToken
            }
        })
        setReceiveLocations(data)
    }

    const getAllDrone = async () => {
        const { data } = await axios.get(`${process.env.REACT_APP_DRONE_API}`, {
            headers: {
                'Authorization': authToken
            }
        })
        setDrones(data)
    }

    const getAllOrder = async () => {
        const { data } = await axios.post(`${process.env.REACT_APP_ORDER_API}/status`, {
            status: filterStatus
        },{
            headers: {
                'Authorization': authToken
            }
        })
        setOrders(data)
    }

    useEffect(() => {
        getAllOrder()
        getAllDrone()
    }, [filterStatus]);

    useEffect(() => {
        getAllOrder()
        getAllDrone()
    }, []);

    const toggleTracking =  (order) => {
        setSelectTrackingOrder(order)
        setFlyingPathPositions([...flyingPathPositions, { lat: order.receiveLocation.lat, lng: order.receiveLocation.long}])
        setTrackingDroneId(order.drone._id)
        setModalUpdate(!modalTracking);
    }

    const cancelTracking = () =>{
        setSelectTrackingOrder(initOrder)
        setFlyingPathPositions(initDroneStationPosition)
        setModalUpdate(false);
    }

    const handleChange = (e) => {
        setFilterStatus(e.target.value)
        setTitle(e.target.value)
    }

    const completeDeliveryStatus = async (order) => {
        try {
            const res = await axios.put(`${process.env.REACT_APP_ORDER_API}/${order._id}`, {
                status: 'Complete',
            },{
                headers: {
                    'Authorization': authToken
                }
            })

            console.log(res);

            await getAllOrder();
            toast.success("Update successful!", { autoClose: 500, theme: "colored" })

        }catch (e) {
            toast.error("Something went wrong!", { autoClose: 500, theme: "colored" })
        }
    }

    const toggleReceiveLocation = async (order) => {
        await setOrderSelect(order);
        await getAllLocation()
        setModalReceiveLocation(!modalReceiveLocation);

    }

    const toggleCancel = () => {
        setOrderSelect(initOrder);
        setReceiveLocationId("");
        setModalReceiveLocation(false);
        setModalSelectDrone(false);
    }

    const toggleSelectDrone = async () => {
        if(receiveLocationId === ""){
            toast.error("Please choose one location!", { autoClose: 500, theme: "colored" })
        }else{
            // get location by Id
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_LOCATION_API}/${receiveLocationId}`, {
                    headers: {
                        'Authorization': authToken
                    }
                })
                setReceiveLocation(data)
                setModalReceiveLocation(false);
                setModalSelectDrone(true);

            }catch (e) {
                toast.error("Something wrong!", { autoClose: 500, theme: "colored" })
            }
        }

    }

    const submitSetupDelivery = async () => {

        if(droneData._id === ''){
            toast.error("Please choose one drone!", { autoClose: 500, theme: "colored" })
        }else{
            // save
            try {
                const { data } = await axios.put(`${process.env.REACT_APP_ORDER_API}/${orderSelect._id}`, {
                    "status":"In Delivery",
                    drone: droneData._id,
                    receiveLocation: receiveLocationId
                },{
                    headers: {
                        'Authorization': authToken
                    }
                })

                console.log(data)

                toggleSuccess();


            }catch (e) {
                toast.error("Something wrong!", { autoClose: 500, theme: "colored" })
            }
        }

    }

    const toggleSuccess = async () => {
        setModalSelectDrone(false);
        setOrderSelect(initOrder);
        setReceiveLocationId("");
        setDroneData(initDroneData);
        await getAllOrder();
        setModalSuccessful(!modalSuccessful);
    }

    const isSmallScreen = useMediaQuery('(max-width:500px)');


    const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <>

            <Modal centered  isOpen={modalSuccessful} toggle={toggleSuccess}>
                <ModalBody>
                    <Row>
                        <Col>
                            <div style={{textAlign:'center'}}>
                                <CheckCircleIcon fontSize="large" color='success'/>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div style={{fontWeight: 'bold', fontSize: 'large', textAlign:'center'}}>
                                Delivery setup succeed!
                            </div>
                            <div style={{textAlign:'center'}}>
                                Please take product to drone position for delivery
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>

            <Modal size="xl" fullscreen="xl" centered  isOpen={modalSelectDrone} toggle={toggleSelectDrone}>
                <ModalBody>
                    <Row>
                        <Col>
                            <Row className="mt-2">
                                <div style={{ fontSize: 'large', color: '#1E73F3', fontWeight: '500'}}>Setup Drone</div>
                            </Row>

                            {/*Order section*/}

                            <Row className="mt-2">
                                <Col>
                                    <div style={{fontSize: 'medium', fontWeight: 'bold'}}>Order detail:</div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium', fontWeight: 'bold'}}>
                                        ID: {orderSelect._id}
                                    </div>
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col>
                                    <div style={{fontSize: 'medium'}}>Total Value:</div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium'}}>
                                        {orderSelect.product.price * orderSelect.quantity}đ
                                    </div>
                                </Col>
                            </Row>

                            {/*Delivery section*/}

                            <Row className="mt-3">
                                <Col style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                    Delivery point information:
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col>
                                    <div style={{fontSize: 'small',  color: '#7F7F7F'}}>
                                        Name:
                                    </div>
                                    <div style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                        {receiveLocation.name}
                                    </div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'small', color: '#7F7F7F'}}>
                                        Address:
                                    </div>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium', fontWeight: 'bold'}}>
                                        {receiveLocation.address}
                                    </div>
                                </Col>
                            </Row>

                            {/*Drone List section*/}
                            <Row className="mt-3">
                                <Col style={{fontSize: 'large', fontWeight: 'bold'}}>
                                    Drone list:
                                </Col>
                            </Row>
                            <Row>
                                <Label>Choose drone:</Label>
                                <Input
                                    bsSize="lg"
                                    type="select"
                                    name="drone"
                                    id = "drone"
                                    onChange={ async (e) =>{
                                        try {
                                            const { data } = await axios.get(`${process.env.REACT_APP_DRONE_API}/${e.target.value}`, {
                                                headers: {
                                                    'Authorization': authToken
                                                }
                                            })
                                            setDroneData(data);
                                        }catch (e){
                                            toast.error("Something wrong!", { autoClose: 500, theme: "colored" })
                                        }
                                    }}

                                >
                                    <option value=""></option>
                                    {
                                        drones ? drones.map(drone =>
                                            (drone.status === "Available" ?
                                            <option value={drone._id}>{drone.name} - {drone.status}
                                            </option> : <></>)
                                        ) : <></>
                                    }
                                </Input>
                            </Row>
                            <Row className="mt-3">
                                <Col style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                    Drone information:
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col>
                                    <div style={{fontSize: 'small',  color: '#7F7F7F'}}>
                                        Model:
                                    </div>
                                    <div style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                        {droneData.name}
                                    </div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'small', color: '#7F7F7F'}}>
                                        ID:
                                    </div>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium', fontWeight: 'bold'}}>
                                        {droneData._id}
                                    </div>
                                </Col>
                            </Row>
                            <Row >
                                <Col>
                                    <div style={{fontSize: 'small',  color: '#7F7F7F'}}>
                                        Max speed:
                                    </div>
                                    <div style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                        {droneData.maxSpeed} m/s
                                    </div>
                                    <div style={{fontSize: 'small',  color: '#7F7F7F'}}>
                                        PayLoad:
                                    </div>
                                    <div style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                        {droneData.payLoad} g
                                    </div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'small', color: '#7F7F7F'}}>
                                        Condition:
                                    </div>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium', fontWeight: 'bold'}}>
                                        {droneData.condition}
                                    </div>
                                </Col>
                            </Row>

                        </Col>
                        <Col>
                            <Row>
                                <img
                                    style={{width: "100%", borderRadius: "8px"}}
                                    alt={droneData.name}
                                    src={droneData.image}
                                />
                            </Row>


                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>
                            <div style={{textAlign:'right'}}>
                                <Button style={{margin: '5px' }} color="primary" onClick={toggleCancel}>Cancel</Button>
                                <Button style={{margin: '5px'}} color="primary" onClick={submitSetupDelivery}>Confirm and Save</Button>
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>

            <Modal size="xl" fullscreen="xl" centered  isOpen={modalReceiveLocation} toggle={toggleReceiveLocation}>
                <ModalBody>
                    <Row>
                        <Col>
                            <Row className="mt-2">
                                <div style={{ fontSize: 'large', color: '#1E73F3', fontWeight: '500'}}>Setup Order Deliver</div>
                            </Row>

                            {/*Order section*/}

                            <Row className="mt-2">
                                <Col>
                                    <div style={{fontSize: 'medium', fontWeight: 'bold'}}>Order detail:</div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium', fontWeight: 'bold'}}>
                                        ID: {orderSelect._id}
                                    </div>
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col>
                                    <div style={{fontSize: 'small',  color: '#7F7F7F'}}>
                                        Product
                                    </div>
                                    <div style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                        {orderSelect.product.name}
                                    </div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'small', color: '#7F7F7F'}}>
                                        Quantity
                                    </div>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium', fontWeight: 'bold'}}>
                                        {orderSelect.quantity}
                                    </div>
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col>
                                    <div style={{fontSize: 'medium'}}>Total Value:</div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium'}}>
                                        {orderSelect.product.price * orderSelect.quantity}đ
                                    </div>
                                </Col>
                            </Row>

                            {/*Client section*/}

                            <Row className="mt-3">
                                <Col style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                    Client's detail:
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col>
                                    <div style={{fontSize: 'small',  color: '#7F7F7F'}}>
                                        Name:
                                    </div>
                                    <div style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                        {`${orderSelect.user.firstName} ${orderSelect.user.lastName}`}
                                    </div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'small', color: '#7F7F7F'}}>
                                        Address:
                                    </div>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium', fontWeight: 'bold'}}>
                                        {orderSelect.address}
                                    </div>
                                </Col>
                            </Row>
                            <Row >
                                <Col>
                                    <div style={{fontSize: 'small',  color: '#7F7F7F'}}>
                                        Phone number:
                                    </div>
                                    <div style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                        {orderSelect.user.phoneNumber}
                                    </div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'small', color: '#7F7F7F'}}>
                                        Email:
                                    </div>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium', fontWeight: 'bold'}}>
                                        {orderSelect.user.email}
                                    </div>
                                </Col>
                            </Row>

                            {/*Delivery point section*/}

                            <Row className="mt-3">
                                <Col style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                    Nearby Delivery Point:
                                </Col>
                            </Row>
                            <Row>
                                <Label>Address</Label>
                                <Input
                                    bsSize="lg"
                                    type="select"
                                    name="address"
                                    id = "address"

                                    onChange={ async (e) =>{


                                        setReceiveLocationId(e.target.value);

                                    }}

                                >
                                    <option value=""></option>
                                    {
                                        receiveLocations ? receiveLocations.map(location =>
                                            <option value={location._id}>{location.name} - {calculateDistance(location,orderSelect).toFixed(2)} km</option>
                                        ) : <></>
                                    }
                                </Input>
                            </Row>
                            <Row>
                                <div style={{height:"25vh"}}>

                                </div>
                            </Row>
                            <Row>
                                <Col>
                                    <div style={{textAlign:'center'}}>
                                        <Button style={{margin: '5px', textAlign: 'center'}} color="primary" onClick={toggleCancel}>Cancel</Button>
                                        <Button style={{margin: '5px', textAlign: 'center'}} color="primary" onClick={toggleSelectDrone}>Continue</Button>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col>
                            { isLoaded ? (
                                <GoogleMap
                                    center={{lat: orderSelect.lat, lng: orderSelect.long}}
                                    zoom={18}
                                    mapContainerStyle={{ width: "100%", height: "100%" }}
                                    options={{
                                        zoomControl: true,
                                        streetViewControl: false,
                                        mapTypeControl: false,
                                        fullscreenControl: false,
                                    }}>

                                    {/*client location*/}
                                    <Marker
                                        key={orderSelect.user._id}
                                        icon={{
                                            url: client,
                                            scaledSize: new window.google.maps.Size(30, 30),

                                        }}
                                        position={{lat: orderSelect.lat, lng: orderSelect.long}}

                                    >
                                    </Marker>

                                    {
                                        receiveLocations ? receiveLocations.map((location,index) =>

                                            <Marker
                                                key={index}
                                                icon={{
                                                    url: location._id === receiveLocationId ? warehouse : warehouseBlack,
                                                    scaledSize: new window.google.maps.Size(40, 40),
                                                }}
                                                position={{lat: location.lat, lng:location.long}}>

                                            </Marker>
                                        ) : <></>
                                    }


                                </GoogleMap>) : <></>}
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>

            <Modal size="xl" fullscreen="xl" centered  isOpen={modalTracking} toggle={toggleTracking}>
                <ModalBody>
                    <Row>
                        <Col>
                            <Row className="mt-2">
                                <div style={{ fontSize: 'large', color: '#1E73F3', fontWeight: '500'}}>Tracking Order Deliver</div>
                            </Row>

                            {/*Order section*/}

                            <Row className="mt-2">
                                <Col>
                                    <div style={{fontSize: 'medium', fontWeight: 'bold'}}>Order detail:</div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium', fontWeight: 'bold'}}>
                                        ID: {selectTrackingOrder._id}
                                    </div>
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col>
                                    <div style={{fontSize: 'small',  color: '#7F7F7F'}}>
                                        Product
                                    </div>
                                    <div style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                        {selectTrackingOrder.product.name}
                                    </div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'small', color: '#7F7F7F'}}>
                                        Quantity
                                    </div>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium', fontWeight: 'bold'}}>
                                        {selectTrackingOrder.quantity}
                                    </div>
                                </Col>
                            </Row>

                            {/*Client section*/}

                            <Row className="mt-3">
                                <Col style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                    Client's detail:
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col>
                                    <div style={{fontSize: 'small',  color: '#7F7F7F'}}>
                                        Name:
                                    </div>
                                    <div style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                        {`${selectTrackingOrder.user.firstName} ${selectTrackingOrder.user.lastName}`}
                                    </div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'small', color: '#7F7F7F'}}>
                                        Address:
                                    </div>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium', fontWeight: 'bold'}}>
                                        {selectTrackingOrder.address}
                                    </div>
                                </Col>
                            </Row>
                            <Row >
                                <Col>
                                    <div style={{fontSize: 'small',  color: '#7F7F7F'}}>
                                        Phone number:
                                    </div>
                                    <div style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                        {selectTrackingOrder.user.phoneNumber}
                                    </div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'small', color: '#7F7F7F'}}>
                                        Email:
                                    </div>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium', fontWeight: 'bold'}}>
                                        {selectTrackingOrder.user.email}
                                    </div>
                                </Col>
                            </Row>

                            {/*Drone section*/}

                            <Row className="mt-3">
                                <Col style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                    Drone information:
                                </Col>
                            </Row>
                            <Row>
                                <Col lg={8}>
                                    <Row className="mt-2">
                                        <Col>
                                            <div style={{fontSize: 'small',  color: '#7F7F7F'}}>
                                                Model:
                                            </div>
                                            <div style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                                {selectTrackingOrder.drone.name}
                                            </div>
                                        </Col>
                                        <Col>
                                            <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'small', color: '#7F7F7F'}}>
                                                ID:
                                            </div>
                                            <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium', fontWeight: 'bold'}}>
                                                {selectTrackingOrder.drone._id}
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row >
                                        <Col>
                                            <div style={{fontSize: 'small',  color: '#7F7F7F'}}>
                                                Max speed:
                                            </div>
                                            <div style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                                {selectTrackingOrder.drone.maxSpeed}m/s
                                            </div>
                                        </Col>
                                        <Col>
                                            <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'small', color: '#7F7F7F'}}>
                                                PayLoad:
                                            </div>
                                            <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium', fontWeight: 'bold'}}>
                                                {selectTrackingOrder.drone.payLoad}g
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col lg={4}>
                                    <img src={selectTrackingOrder.drone.image}
                                         style={{width: "100%", maxWidth: "200px", borderRadius: "8px"}}
                                         alt={selectTrackingOrder.drone.name}
                                    />
                                </Col>
                            </Row>

                            {/*Recevie point*/}

                            <Row className="mt-3">
                                <Col style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                    Recevie location:
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div style={{fontSize: 'small',  color: '#7F7F7F'}}>
                                        Name
                                    </div>
                                    <div style={{fontSize: 'medium', fontWeight: 'bold'}}>
                                        {selectTrackingOrder.receiveLocation.name}
                                    </div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'small', color: '#7F7F7F'}}>
                                        Address
                                    </div>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'medium', fontWeight: 'bold'}}>
                                        {selectTrackingOrder.receiveLocation.address}
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <div style={{height:"25vh"}}>

                                </div>
                            </Row>
                            <Row>
                                <Col>
                                    <div style={{textAlign:'center'}}>
                                        <Button style={{margin: '5px', textAlign: 'center'}} color="primary" onClick={cancelTracking}>Close Tracking</Button>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col>
                            { isLoaded ? (
                                <GoogleMap
                                    center={
                                        {
                                            lat: selectTrackingOrder.receiveLocation.lat,
                                            lng: selectTrackingOrder.receiveLocation.long
                                        }
                                    }
                                    zoom={18}
                                    mapContainerStyle={{ width: "100%", height: "100%" }}
                                    options={{
                                        zoomControl: true,
                                        streetViewControl: false,
                                        mapTypeControl: false,
                                        fullscreenControl: false,
                                    }}>

                                    {/*Drone current location*/}

                                    <Marker position={currentLocation}
                                            icon={{
                                                url: drone,
                                                scaledSize: new window.google.maps.Size(50, 50),
                                            }}
                                            title={selectTrackingOrder.drone.name}
                                            shape={{
                                                type: 'circle'
                                            }}

                                    >
                                    </Marker>

                                    {/*client location*/}
                                    <Marker
                                        key={selectTrackingOrder.user._id}
                                        icon={{
                                            url: client,
                                            scaledSize: new window.google.maps.Size(30, 30),

                                        }}
                                        position={{lat: selectTrackingOrder.lat, lng: selectTrackingOrder.long}}

                                    >
                                    </Marker>

                                    {/*receive point*/}
                                    <Marker position={
                                        {
                                            lat: selectTrackingOrder.receiveLocation.lat,
                                            lng: selectTrackingOrder.receiveLocation.long
                                        }
                                    }
                                            icon={{
                                                url: warehouse,
                                                scaledSize: new window.google.maps.Size(50, 50),
                                            }}

                                    >
                                    </Marker>


                                    {/*generate point to each path   */}

                                    {
                                        flyingPathPositions ? flyingPathPositions.map((position,index) =>

                                            <Marker
                                                key={index}
                                                icon={{
                                                    path: window.google.maps.SymbolPath.CIRCLE,
                                                    fillColor: '#1E73F3',
                                                    fillOpacity: 1,
                                                    strokeColor: '#1E73F3',
                                                    strokeWeight: 3,
                                                    scale: 5
                                                }}
                                                position={
                                                    position
                                                }>

                                            </Marker>
                                        ) : <></>
                                    }

                                    {/*Drone path*/}

                                    <Polyline
                                        path={flyingPathPositions}
                                        options={optionsPolyline}
                                    />

                                </GoogleMap>) : <></>}
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>

            < Box sx={{ minWidth: 140 }} className="mb-2">
                <FormControl sx={{ width: 140 }}>
                    <Box sx={{ display: 'flex', gap: 1, width: "80vw" }}>
                        <Button color="primary" endIcon={<BiFilterAlt />}>Filters</Button>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={title}
                            sx={{ width: 200 }}
                            onChange={(e) => handleChange(e)}
                        >
                            <MenuItem key="In Progress" value="In Progress">In Progress</MenuItem>
                            <MenuItem key="In Delivery" value="In Delivery">In Delivery</MenuItem>
                            <MenuItem key="Complete" value="Complete">Complete</MenuItem>
                        </Select>
                    </Box>
                </FormControl>
            </Box>
            <Paper
                style={{
                    overflow: "auto",
                    maxHeight: "500px"
                }}
            >
                <TableContainer sx={{ maxHeight: '500px' }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead sx={{ position: 'sticky', top: 0 }}>
                            <TableRow>
                                <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>Address</TableCell>
                                <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>Client Name</TableCell>
                                <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>OrderID</TableCell>
                                <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>Total Cost</TableCell>
                                <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>Created Date</TableCell>
                                <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell/>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedOrders.map((order) => (
                                <React.Fragment key={order._id}>
                                    <TableRow>
                                        <TableCell >
                                            {`${order.address}`}
                                        </TableCell>
                                        <TableCell >
                                            {`${order.user.firstName} ${order.user.lastName}` }
                                        </TableCell>
                                        <TableCell >
                                            {`${order._id}`}
                                        </TableCell>
                                        <TableCell>
                                            {order.product.price * order.quantity}đ
                                        </TableCell>
                                        <TableCell>{order.createdAt}</TableCell>
                                        <TableCell>
                                            {order.status === 'In Progress' ?
                                                <Badge color="warning">
                                                    {order.status}
                                                </Badge>
                                                :
                                                order.status === 'In Delivery' ?
                                                <Badge color="info">
                                                    {order.status}
                                                </Badge>
                                                :
                                                <Badge color="success">
                                                    {order.status}
                                                </Badge>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                aria-label="expand row"
                                                size="small"
                                                onClick={() => setOpenOrderId(openOrderId === order._id ? "" : order._id)}

                                            >
                                                {<MdKeyboardArrowDown />}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                                            <Collapse in={openOrderId === order._id} timeout="auto" unmountOnExit>
                                                <div>
                                                    <Table size="small" aria-label="purchases">
                                                        <TableHead>
                                                            <TableRow>

                                                                <TableCell align="left" sx={{ color: "#1976d2", fontWeight: 'bold' }}>Product Name</TableCell>
                                                                <TableCell align="left" sx={{ color: "#1976d2", fontWeight: 'bold' }}>Image</TableCell>
                                                                <TableCell align="left" sx={{ color: "#1976d2", fontWeight: 'bold' }}>Price</TableCell>
                                                                <TableCell align="left" sx={{ color: "#1976d2", fontWeight: 'bold' }}>Quantity</TableCell>
                                                                <TableCell align="left" sx={{ color: "#1976d2", fontWeight: 'bold' }}>Type</TableCell>

                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                                <TableRow key={order.product._id}>
                                                                    <TableCell>
                                                                        {order.product.name}
                                                                    </TableCell>
                                                                    <TableCell >
                                                                        <img src={order.product.image} alt={order.product.name} style={{ width: "100px", height: "100px", objectFit: "contain" }} />
                                                                    </TableCell>
                                                                    <TableCell >
                                                                            {order.product.price}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                            {order.quantity}
                                                                    </TableCell>
                                                                    <TableCell >
                                                                        {order.product.type}
                                                                    </TableCell>

                                                                </TableRow>
                                                                {order.status === "In Progress" ?
                                                                <Button onClick={() => toggleReceiveLocation(order)} color="primary" className="mt-2 mb-2">
                                                                    Setup Delivery
                                                                </Button>
                                                                    :
                                                                <>
                                                                    {order.status !== "Complete" ?
                                                                        <>
                                                                            <Button onClick={() => toggleTracking(order)} color="primary" className="mt-2 mb-2">
                                                                                Tracking location
                                                                            </Button>
                                                                            <Button onClick={() => completeDeliveryStatus(order)} color="primary"
                                                                                    style={{marginLeft:'5px'}}
                                                                                    className="mt-2 mb-2">
                                                                                Complete
                                                                            </Button>
                                                                        </> : <></> }
                                                                </>
                                                                }
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </>

    );
};

export default OrderTable;
