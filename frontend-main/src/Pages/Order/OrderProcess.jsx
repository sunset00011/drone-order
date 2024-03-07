import { FaSearch  } from "react-icons/fa";
import { styled } from '@mui/material/styles';
import {InputBase, IconButton,  useMediaQuery} from '@mui/material';
import {useEffect, useState} from "react";
import {Button, Card, CardBody, Col, Modal, ModalBody, Row} from "reactstrap";
import {
    useJsApiLoader,
    GoogleMap,
    Marker,
    Polyline,
} from "@react-google-maps/api";
import database from "../../firebase_setup/firebase";
import { ref, onValue } from "firebase/database";

import drone from './drone-device.png';
import warehouse from './warehouse-location-blue.png'
import axios from "axios";
import {toast} from "react-toastify";

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

const initDroneStationPosition = [
    {
        lat: 21.036844, lng: 105.782702
    },

]

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: '8px',
    backgroundColor: '#D4D4D4',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',


    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginTop: theme.spacing(2),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled(IconButton)(({ theme }) => ({
    marginLeft: '5px',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        paddingLeft: theme.spacing(1),
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));

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


const OrderProcess = (props) => {

    const orderStatus = props.status;

    let authToken = localStorage.getItem("Authorization")

    const [searchOrder, setSearchOrder] = useState("");

    const [modalTracking, setModalUpdate] = useState(false);

    const [trackingDroneId, setTrackingDroneId] = useState('656c9fe85ae2bbcfaecc9ac5')

    const [currentLocation,setCurrentLocation] = useState(center);
    const [flyingPathPositions, setFlyingPathPositions] = useState(initDroneStationPosition)

    const [orders, setOrders] = useState([]);

    const [selectTrackingOrder, setSelectTrackingOrder] = useState(initOrder)

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

    useEffect(() => {
        const getOrderByStatusAndUserId =  async () => {

            if(orderStatus === "All"){
                try {

                    const { data } = await axios.get(`${process.env.REACT_APP_GET_USER_DETAILS}`, {
                        headers: {
                            'Authorization': authToken
                        }
                    })

                    const userId = data._id

                    const res = await axios.get(`${process.env.REACT_APP_ORDER_API}/user/${userId}`,
                      {
                            headers: {
                                'Authorization': authToken
                            }
                        })

                    console.log(res);

                    setOrders(res.data);


                }catch (e) {
                    toast.error("Something went wrong", { autoClose: 500, theme: 'colored' })
                }
            }else{
                try {
                    const { data } = await axios.get(`${process.env.REACT_APP_GET_USER_DETAILS}`, {
                        headers: {
                            'Authorization': authToken
                        }
                    })

                    const userId = data._id

                    const res = await axios.post(`${process.env.REACT_APP_ORDER_API}/status-and-user`,
                        {
                            status: orderStatus,
                            userId: userId

                        }, {
                            headers: {
                                'Authorization': authToken
                            }
                        })

                    console.log(res);

                    setOrders(res.data);

                }catch (e){
                    toast.error("Something went wrong", { autoClose: 500, theme: 'colored' })
                }
            }



        }
        getOrderByStatusAndUserId()
    }, [orderStatus,authToken]);

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

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
    });

    const isSmallScreen = useMediaQuery('(max-width:500px)');

    const handleSearch = () => {
        console.log(searchOrder)
    }

    return (
        <>
            <Search>
                <SearchIconWrapper
                    onClick={handleSearch}
                >
                    <FaSearch/>
                </SearchIconWrapper>
                <StyledInputBase
                    placeholder="Search…"
                    inputProps={{ 'aria-label': 'search' }}
                    value={searchOrder}
                    onChange={(e) => {
                        setSearchOrder(e.target.value)
                    }}
                />
            </Search>

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

            <div className="mt-3" style={{fontSize: '24px', fontWeight: 'bold', color: '#1E73F3'}}>
                {orderStatus}
            </div>
            {
                orders ? orders.map((order,index) =>

                    <Card className="shadow mt-3 border-0">
                        <CardBody>
                            <Row>
                                <Col>
                                    <div style={{fontSize: 'small', color: '#7F7F7F'}}>Created Date: {order.createdAt}</div>
                                </Col>
                                <Col>
                                    <div style={{textAlign: !isSmallScreen ? 'right' : 'left', fontSize: 'small', color: '#7F7F7F'}}>Order ID: {order._id}</div>
                                </Col>
                            </Row>
                            <Row className="mt-1">
                                <Col lg={5}>
                                    <Row>
                                        <Col lg={4}>
                                            <div>
                                                <img src={order.product.image}
                                                     style={{width: "100%", maxWidth: "200px", borderRadius: "8px"}}
                                                     alt={order.product.name}
                                                />
                                            </div>
                                        </Col>
                                        <Col lg={8}>
                                            <h5 style={{fontWeight: 'bold', fontSize: '16px'}}>
                                                {order.product.name}
                                            </h5>
                                            <div>
                                                <div>
                                                    {order.product.description}
                                                </div>
                                                <div style={{
                                                    color: '#7F7F7F',
                                                    leadingTrim: 'both',
                                                    textEdge: 'cap',
                                                    fontSize: '14px',
                                                    fontStyle: 'normal',
                                                    fontWeight: '500',
                                                    lineHeight: 'normal'
                                                }}>
                                                    Quantity: { <span style={{color: '#1E73F3'}}>{order.quantity}</span> }
                                                </div>
                                                <div>type: {order.product.type}</div>
                                                <div>rating: {order.product.rating}</div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col lg={7}>
                                    <div style={{color: '#1E73F3', fontWeight: 'bold', textAlign: !isSmallScreen ? 'right' : 'left'}}>{order.quantity * order.product.price}đ</div>
                                    { orderStatus === "In Delivery" ?
                                        <div style={{textAlign: 'right'}}>
                                            <Button style={{margin: '5px'}} color="primary">Cancel Order</Button>
                                            <Button style={{margin: '5px'}} color="primary" onClick={() => toggleTracking(order)}>Tracking location</Button>
                                        </div> : <></> }
                                </Col>

                            </Row>
                        </CardBody>
                    </Card>


                ) : <></>
            }




        </>
    )
}

export default OrderProcess;
