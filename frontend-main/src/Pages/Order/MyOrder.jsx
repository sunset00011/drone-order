import {Box, Container, CssBaseline, Tab, Tabs, Typography, useMediaQuery} from "@mui/material";
import React from "react";
import CopyRight from "../../Components/CopyRight/CopyRight";


import OrderProcess from "./OrderProcess";
import PropTypes from "prop-types";

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}

        >
            {value === index && (
                <Box >
                    <Typography >{children} </Typography>

                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


const MyOrder = () => {

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const isSmallScreen = useMediaQuery('(max-width:600px)');


    return (
        <>
            <CssBaseline />
            <Container fixed maxWidth >
                <Box sx={{
                    width: '100%',
                    bgcolor: 'white',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' ,
                    borderRadius: '8px',
                }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        aria-label="basic tabs example"
                        variant={!isSmallScreen ? "fullWidth" : "scrollable"}
                        scrollButtons="auto"
                        allowScrollButtonsMobile

                         >
                        <Tab  sx={{ textTransform: "none" }} label={<div style={{fontWeight:'bold'}}>All</div>}  {...a11yProps(0)}  />
                        <Tab  sx={{ textTransform: "none" }} label={<div style={{fontWeight:'bold'}}>In Progress</div>} {...a11yProps(1)}  />
                        <Tab  sx={{ textTransform: "none" }} label={<div style={{fontWeight:'bold'}}>Waiting Delivery</div>} {...a11yProps(2)}  />
                        <Tab  sx={{ textTransform: "none" }} label={<div style={{fontWeight:'bold'}}>In Delivery</div>} {...a11yProps(3)}  />
                        <Tab  sx={{ textTransform: "none" }} label={<div style={{fontWeight:'bold'}}>Complete</div>} {...a11yProps(4)}  />
                        <Tab  sx={{ textTransform: "none" }} label={<div style={{fontWeight:'bold'}}>Canceled</div>} {...a11yProps(5)}  />
                        <Tab  sx={{ textTransform: "none" }} label={<div style={{fontWeight:'bold'}}>Return/Refund</div>} {...a11yProps(6)}  />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0} >
                    <OrderProcess status="All"/>
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <OrderProcess status="In Progress"/>
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <OrderProcess status="Waiting Delivery"/>
                </TabPanel>
                <TabPanel value={value} index={3}>
                    <OrderProcess status="In Delivery"/>
                </TabPanel>
                <TabPanel value={value} index={4}>
                    <OrderProcess status="Complete"/>
                </TabPanel>
                <TabPanel value={value} index={5}>
                    <OrderProcess status="Canceled"/>
                </TabPanel>
                <TabPanel value={value} index={6}>
                    <OrderProcess status="Return/Refund"/>
                </TabPanel>
            </Container>
            <CopyRight sx={{ mt: 8, mb: 10 }} />
        </>
    )
}

export default MyOrder
