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
import {Button, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "reactstrap";
import {useState, useEffect} from "react";
import {toast} from "react-toastify";
import axios from "axios";



const LocationTable = (props) => {
    const [modalAddLocation, setModalAddLocation] = useState(false);

    const [modalUpdateLocation, setModalUpdateLocation] = useState(false);

    const [selectedUpdateLocation, setSelectedUpdateLocation] = useState({
        _id: '',
        name: "",
        image: '',
        address: "",
        lat: 21.037846, long: 105.783104
    })

    const [locations, setLocations] = useState([])

    const [newLocation, setNewLocation] = useState({
        name: "",
        image: '',
        address: "",
        lat: 21.037846, long: 105.783104
    })

    let authToken = localStorage.getItem("Authorization")

    const toggleAddLocation = () => {
        setModalAddLocation(!modalAddLocation)
    }

    const toggleUpdateLocation = (location) => {
        setSelectedUpdateLocation(location)
        setModalUpdateLocation(!modalUpdateLocation)
    }

    const getAllLocation = async () => {
        const { data } = await axios.get(`${process.env.REACT_APP_LOCATION_API}`, {
            headers: {
                'Authorization': authToken
            }
        })
        setLocations(data)
    }

    const deleteLocation = async (location) =>{
        const requested = window.confirm("Are you sure want to delete location " + location.name);
        if ( requested) {
            try {
                const res = await axios.delete(`${process.env.REACT_APP_LOCATION_API}/${location._id}`, {
                    headers: {
                        'Authorization': authToken
                    }
                })
                console.log(res);
                await getAllLocation();
            }catch (e) {
                toast.error("Something went wrong!", { autoClose: 500, theme: "colored" })
            }
        }
    }

    useEffect(() => {
        getAllLocation()
    }, []);

    const addNewLocation = async () => {

        if( !newLocation.name || !newLocation.image || !newLocation.address || !newLocation.lat || !newLocation.long ){
            toast.error("Please fill all fields", { autoClose: 500, theme: "colored" })
        }else {
            console.log(newLocation);
            try {

                const {data} = await axios.post(`${process.env.REACT_APP_LOCATION_API}`,
                    {

                        name: newLocation.name,
                        address: newLocation.address,
                        image: newLocation.image,
                        lat: newLocation.lat,
                        long: newLocation.long

                    }, {
                        headers: {
                            'Authorization': authToken
                        }
                    })

                console.log(data);

                await getAllLocation();

                setNewLocation({
                    name: "",
                    image: '',
                    address: "",
                    lat: 21.037846, long: 105.783104
                })
                setModalAddLocation(false);

            }catch (e){
                toast.error("Something went wrong!", { autoClose: 500, theme: "colored" })
            }
        }
    }

    const updateLocation = async () => {
        try {
            const res = await axios.put(`${process.env.REACT_APP_LOCATION_API}/${selectedUpdateLocation._id}`, {
                name: selectedUpdateLocation.name,
                image: selectedUpdateLocation.image,
                address: selectedUpdateLocation.address,
                lat: selectedUpdateLocation.lat, long: selectedUpdateLocation.long

            },{
                headers: {
                    'Authorization': authToken
                }
            })

            console.log(res);
            setSelectedUpdateLocation({
                name: "",
                image: '',
                address: "",
                lat: 21.037846, long: 105.783104
            })
            await getAllLocation();
            setModalUpdateLocation(false);

        }catch (e) {
            toast.error("Something went wrong!", { autoClose: 500, theme: "colored" })
        }
    }

    return (
        <>

            <Modal  centered  isOpen={modalAddLocation} toggle={toggleAddLocation}>
                <ModalHeader tag="h5">
                    <div>
                        Add new location
                    </div>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col>
                            <Label>Location name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={newLocation.name}
                                onChange={e => {
                                    setNewLocation({...newLocation, [e.target.name]: e.target.value})
                                }}
                            >

                            </Input>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Label>Location address</Label>
                            <Input
                                id="address"
                                name="address"
                                type="textarea"
                                value={newLocation.address}
                                onChange={e => {
                                    setNewLocation({...newLocation, [e.target.name]: e.target.value})
                                }}
                            >

                            </Input>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Label>Location image URL</Label>
                            <Input
                                id="image"
                                name="image"
                                type="text"
                                value={newLocation.image}
                                onChange={e => {
                                    setNewLocation({...newLocation, [e.target.name]: e.target.value})
                                }}
                            >

                            </Input>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Label>Lat</Label>
                            <Input
                                id="lat"
                                name="lat"
                                type="number"
                                value={newLocation.lat}
                                onChange={e => {
                                    setNewLocation({...newLocation, [e.target.name]: e.target.value})
                                }}
                            >

                            </Input>
                        </Col>
                        <Col>
                            <Label>Long</Label>
                            <Input
                                id="long"
                                name="long"
                                type="number"
                                value={newLocation.long}
                                onChange={e => {
                                    setNewLocation({...newLocation, [e.target.name]: e.target.value})
                                }}
                            >
                            </Input>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={toggleAddLocation} color="primary" className="m-3">Cancel</Button>
                    <Button onClick={addNewLocation} color="primary" className="m-3">Add</Button>
                </ModalFooter>
            </Modal>

            <Modal  centered  isOpen={modalUpdateLocation} toggle={toggleUpdateLocation}>
                <ModalHeader tag="h5">
                    <div>
                        Update location
                    </div>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col>
                            <Label>Location name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={selectedUpdateLocation.name}
                                onChange={e => {
                                    setSelectedUpdateLocation({...selectedUpdateLocation, [e.target.name]: e.target.value})
                                }}
                            >

                            </Input>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Label>Location address</Label>
                            <Input
                                id="address"
                                name="address"
                                type="textarea"
                                value={selectedUpdateLocation.address}
                                onChange={e => {
                                    setSelectedUpdateLocation({...selectedUpdateLocation, [e.target.name]: e.target.value})
                                }}
                            >

                            </Input>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Label>Location image URL</Label>
                            <Input
                                id="image"
                                name="image"
                                type="text"
                                value={selectedUpdateLocation.image}
                                onChange={e => {
                                    setSelectedUpdateLocation({...selectedUpdateLocation, [e.target.name]: e.target.value})
                                }}
                            >

                            </Input>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Label>Lat</Label>
                            <Input
                                id="lat"
                                name="lat"
                                type="number"
                                value={selectedUpdateLocation.lat}
                                onChange={e => {
                                    setSelectedUpdateLocation({...selectedUpdateLocation, [e.target.name]: e.target.value})
                                }}
                            >

                            </Input>
                        </Col>
                        <Col>
                            <Label>Long</Label>
                            <Input
                                id="long"
                                name="long"
                                type="number"
                                value={selectedUpdateLocation.long}
                                onChange={e => {
                                    setSelectedUpdateLocation({...selectedUpdateLocation, [e.target.name]: e.target.value})
                                }}
                            >
                            </Input>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={toggleUpdateLocation} color="primary" className="m-3">Cancel</Button>
                    <Button onClick={updateLocation} color="primary" className="m-3">Save</Button>
                </ModalFooter>
            </Modal>

            <Button onClick={toggleAddLocation} color="primary" className="m-3">Add New location</Button>
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>Location ID</TableCell>
                        <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>Location Name</TableCell>
                        <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>Image</TableCell>
                        <TableCell sx={{ color: "#1976d2", fontWeight: 'bold' }}>Address</TableCell>
                        <TableCell/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {locations.map((location) => (
                        <TableRow
                            key={location._id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {location._id}
                            </TableCell>
                            <TableCell >{location.name}</TableCell>
                            <TableCell>
                                <img src={location.image} alt={location.name} style={{ width: "100px", height: "100px", objectFit: "contain" }} />
                            </TableCell>
                            <TableCell >{location.address}g</TableCell>
                            <TableCell>
                                <IconButton
                                    onClick={() => toggleUpdateLocation(location)}
                                >
                                    {<EditIcon />}
                                </IconButton>
                                <IconButton
                                    onClick={() => deleteLocation(location)}
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

export default LocationTable;