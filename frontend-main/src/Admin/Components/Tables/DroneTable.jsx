
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {IconButton} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {Badge, Button, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "reactstrap";
import {useState, useEffect} from "react";

import axios from "axios";
import {toast} from "react-toastify";



const DroneTable = (props) => {

    const [modalAddDrone, setModalAddDrone] = useState(false);
    const [modalUpdateDrone, setModalUpdateDrone] = useState(false);

    const [drones, setDrones] = useState([]);

    const [newDrone, setNewDrone] = useState({
        name: '',
        maxSpeed: 0,
        payLoad: 0,
        image: '',
    });

    const [drone, setDrone] = useState({
        name: '',
        maxSpeed: 0,
        payLoad: 0,
        image: '',
        condition: ''
    });


    let authToken = localStorage.getItem("Authorization")

    const toggleAddDrone = () => {
        setModalAddDrone(!modalAddDrone)
    }

    const toggleUpdateDrone = (drone) => {
        setDrone(drone)
        setModalUpdateDrone(!modalUpdateDrone)
    }

    const getAllDrone = async () => {
        const { data } = await axios.get(`${process.env.REACT_APP_DRONE_API}`, {
            headers: {
                'Authorization': authToken
            }
        })
        setDrones(data)
    }

    const deleteDrone = async (drone) =>{
        const requested = window.confirm("Are you sure want to delete Drone " + drone.name);
        if ( requested) {
            try {
                const res = await axios.delete(`${process.env.REACT_APP_DRONE_API}/${drone._id}`, {
                    headers: {
                        'Authorization': authToken
                    }
                })
                console.log(res);
                await getAllDrone();
            }catch (e) {
                toast.error("Something went wrong!", { autoClose: 500, theme: "colored" })
            }
        }
    }

    const updateDrone = async () => {
        try {
            const res = await axios.put(`${process.env.REACT_APP_DRONE_API}/${drone._id}`, {
                name: drone.name,
                image: drone.image,
                maxSpeed: drone.maxSpeed,
                payLoad: drone.payLoad,
                condition: drone.condition

            },{
                headers: {
                    'Authorization': authToken
                }
            })

            console.log(res);
            setDrone({
                name: '',
                maxSpeed: 0,
                payLoad: 0,
                image: '',
                condition: ''
            })
            await getAllDrone();
            setModalUpdateDrone(false);

        }catch (e) {
            toast.error("Something went wrong!", { autoClose: 500, theme: "colored" })
        }
    }

    const addNewDrone = async () => {

        if( !newDrone.name || !newDrone.image || !newDrone.maxSpeed || !newDrone.payLoad ){
            toast.error("Please fill all fields", { autoClose: 500, theme: "colored" })
        }else {
            console.log(newDrone);
            try {

                const {data} = await axios.post(`${process.env.REACT_APP_DRONE_API}`,
                    {

                        name: newDrone.name,
                        image: newDrone.image,
                        maxSpeed: newDrone.maxSpeed,
                        payLoad: newDrone.payLoad

                    }, {
                        headers: {
                            'Authorization': authToken
                        }
                    })

                    console.log(data);
                    await getAllDrone();
                    setNewDrone({
                        name: '',
                        maxSpeed: 0,
                        payLoad: 0,
                        image: '',
                    })
                    setModalAddDrone(false);

            }catch (e){
                toast.error("Something went wrong!", { autoClose: 500, theme: "colored" })
            }
        }

    }

    useEffect(() => {
        getAllDrone()
    }, []);



    return (
        <>
            <Modal  centered  isOpen={modalUpdateDrone} toggle={toggleUpdateDrone}>
                <ModalHeader tag="h5">
                    <div>
                        Update drone information
                    </div>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col>
                            <Label>Drone name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={drone.name}
                                onChange={e => {
                                    setDrone({...drone, [e.target.name]: e.target.value})
                                }}
                            >
                            </Input>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Label>PayLoad (g)</Label>
                            <Input
                                id="payLoad"
                                name="payLoad"
                                type="number"
                                value={drone.payLoad}
                                onChange={e => {
                                    setDrone({...drone, [e.target.name]: e.target.value})
                                }}
                            >
                            </Input>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Label>Drone image URL</Label>
                            <Input
                                id="image"
                                name="image"
                                type="text"
                                value={drone.image}
                                onChange={e => {
                                    setDrone({...drone, [e.target.name]: e.target.value})
                                }}
                            >
                            </Input>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Label>Max speed (m/s)</Label>
                            <Input
                                id="speed"
                                name="maxSpeed"
                                type="number"
                                value={drone.maxSpeed}
                                onChange={e => {
                                    setDrone({...drone, [e.target.name]: e.target.value})
                                }}
                            >
                            </Input>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Label>Condition</Label>
                            <Input
                                id="condition"
                                name="condition"
                                type="select"
                                value={drone.condition}
                                onChange={e => {
                                    setDrone({...drone, [e.target.name]: e.target.value})
                                }}
                            >
                                <option value="Good">Good</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </Input>
                        </Col>
                    </Row>

                </ModalBody>
                <ModalFooter>
                    <Button onClick={toggleUpdateDrone} color="primary" className="m-3">Cancel</Button>
                    <Button onClick={updateDrone} color="primary" className="m-3">Update</Button>
                </ModalFooter>
            </Modal>

            <Modal  centered  isOpen={modalAddDrone} toggle={toggleAddDrone}>
                <ModalHeader tag="h5">
                    <div>
                        Add new drone
                    </div>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col>
                            <Label>Drone name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={newDrone.name}
                                onChange={e => {
                                    setNewDrone({...newDrone, [e.target.name]: e.target.value})
                                }}
                            >

                            </Input>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Label>PayLoad (g)</Label>
                            <Input
                                id="payLoad"
                                name="payLoad"
                                type="number"
                                value={newDrone.payLoad}
                                onChange={e => {
                                    setNewDrone({...newDrone, [e.target.name]: e.target.value})
                                }}
                            >

                            </Input>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Label>Drone image URL</Label>
                            <Input
                                id="image"
                                name="image"
                                type="text"
                                value={newDrone.image}
                                onChange={e => {
                                    setNewDrone({...newDrone, [e.target.name]: e.target.value})
                                }}
                            >

                            </Input>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Label>Max speed (m/s)</Label>
                            <Input
                                id="speed"
                                name="maxSpeed"
                                type="number"
                                value={newDrone.maxSpeed}
                                onChange={e => {
                                    setNewDrone({...newDrone, [e.target.name]: e.target.value})
                                }}
                            >

                            </Input>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={toggleAddDrone} color="primary" className="m-3">Cancel</Button>
                    <Button onClick={addNewDrone} color="primary" className="m-3">Add</Button>
                </ModalFooter>
            </Modal>

        <Button onClick={toggleAddDrone} color="primary" className="m-3">Add New Drone</Button>
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>Drone ID</TableCell>
                        <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>Model Name</TableCell>
                        <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>Image</TableCell>
                        <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>PayLoad</TableCell>
                        <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>Max Speed</TableCell>
                        <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>Condition</TableCell>
                        <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {drones.map((drone) => (
                        <TableRow
                            key={drone._id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {drone._id}
                            </TableCell>
                            <TableCell >{drone.name}</TableCell>
                            <TableCell>
                                <img src={drone.image} alt={drone.name} style={{ width: "100px", height: "100px", objectFit: "contain" }} />
                            </TableCell>
                            <TableCell >{drone.payLoad}g</TableCell>
                            <TableCell >{drone.maxSpeed}m/s</TableCell>
                            <TableCell >
                                {drone.condition === 'Good' ?
                                    <Badge color="success">
                                        {drone.condition}
                                    </Badge>
                                    :
                                    drone.condition === 'Medium' ?
                                        <Badge color="warning">
                                            {drone.condition}
                                        </Badge>:
                                        <Badge color="danger">
                                            {drone.condition}
                                        </Badge>
                                }
                            </TableCell>
                            <TableCell>
                                {drone.status === 'Available' ?
                                    <Badge color="success">
                                        {drone.status}
                                    </Badge>
                                    :
                                    <Badge color="info">
                                        {drone.status}
                                    </Badge>
                                }
                            </TableCell>
                            <TableCell>
                                <IconButton
                                    onClick={() => toggleUpdateDrone(drone)}
                                >
                                    {<EditIcon />}
                                </IconButton>
                                <IconButton
                                    onClick={() => deleteDrone(drone)}
                                >
                                    {<DeleteIcon />}
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        </>
    );
}

export default DroneTable;