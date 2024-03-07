import './Desktop.css'
import React, { useContext, useEffect, useState } from 'react'
import {  AiOutlineShoppingCart, AiFillCloseCircle } from 'react-icons/ai'
import {BiReceipt} from "react-icons/bi";
import { CgProfile } from 'react-icons/cg'
import { FiLogOut } from 'react-icons/fi'
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Badge, Button, Dialog, DialogActions, DialogContent, Menu, MenuItem, Slide, Tooltip, Typography } from '@mui/material';
import { ContextFunction } from '../Context/Context';
import { toast } from 'react-toastify';
import { getCart, handleLogOut, handleClickOpen, handleClose, Transition } from '../Constants/Constant'

const DesktopNavigation = () => {

  const { cart, setCart  } = useContext(ContextFunction)
  const [openAlert, setOpenAlert] = useState(false);
  const navigate = useNavigate()
  let authToken = localStorage.getItem('Authorization');
  let setProceed = authToken !== null ? true : false
  useEffect(() => {
    getCart(setProceed, setCart, authToken)
  }, [])


  return (
    <>
      <nav className='nav-desktop'>
        <div className="logo">
          <Link to='/'>
            <span >Drone Order</span>
          </Link>
        </div>
        <div className="nav-items">
          <ul className="nav-items">
            <li className="nav-links">
              <NavLink to='/'>
                <span className='nav-icon-span'>  Home</span>
              </NavLink>
            </li>
            <li className="nav-links">
              <Tooltip title='Cart'>
                <NavLink to="/cart">
                  <span className='nav-icon-span'>Cart    <Badge badgeContent={setProceed ? cart.length : 0}> <AiOutlineShoppingCart className='nav-icon' /></Badge></span>
                </NavLink>
              </Tooltip>
            </li>
            <li className="nav-links">
              <Tooltip title='My Order'>
                <NavLink to="/my-order">
                  <span className='nav-icon-span'>My Order  <BiReceipt className='nav-icon' /></span>
                </NavLink>
              </Tooltip>
            </li>
            {
              setProceed ?
                <>
                  <li className="nav-links">
                    <Tooltip title='Profile'>
                      <NavLink to='/update'>
                        <span className='nav-icon-span'>  <CgProfile style={{ fontSize: 29, marginTop: 7,marginRight:10 }} /></span>
                      </NavLink>
                    </Tooltip>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', justifyItems: 'center' }} onClick={() => handleClickOpen(setOpenAlert)}>
                    <Button variant='contained' className='nav-icon-span' sx={{ marginBottom: 1 }} endIcon={<FiLogOut />}>
                      <Typography variant='button'> Logout</Typography>
                    </Button>
                  </li>
                </>
                :
                <li className="nav-links">
                  <Tooltip title='Login'>
                    <NavLink to='/login'>
                      <span className='nav-icon-span'>   <CgProfile style={{ fontSize: 29, marginTop: 7 }} /></span>
                    </NavLink>
                  </Tooltip>
                </li>
            }
          </ul>
        </div>
      </nav >
      <Dialog
        open={openAlert}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent sx={{ width: { xs: 280, md: 350, xl: 400 }, display: 'flex', justifyContent: 'center' }}>
          <Typography variant='h6'>  Do You Want To Logout?</Typography>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
          <Link to="/">
            <Button variant='contained' endIcon={<FiLogOut />} color='primary' onClick={() => handleLogOut(setProceed, toast, navigate, setOpenAlert)}>Logout</Button></Link>
          <Button variant='contained' color='error' endIcon={<AiFillCloseCircle />} onClick={() => handleClose(setOpenAlert)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>

  )
}

export default DesktopNavigation
