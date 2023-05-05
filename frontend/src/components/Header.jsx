import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useDispatch, useSelector } from 'react-redux'
import Button from 'react-bootstrap/Button';
import { LinkContainer } from 'react-router-bootstrap';
import { useLocation, useNavigate } from 'react-router'
import { useEffect, useState , useContext} from 'react'
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { NavDropdown } from 'react-bootstrap';
import { logout } from '../actions/userActions';
import { MyContext } from "../App.js"

function Header() {
  const context =useContext(MyContext)
  // console.log(context)
  const myDomain = context.hostname

  const userLogin = useSelector(state => state.userLogin)
  const { userInfo } = userLogin

  const userDetails = useSelector(state => state.userDetails)
  const { loading, error, user } = userDetails

  const location = useLocation()
  const dispatch = useDispatch()
  const logoutHandler = () => { dispatch(logout()) }

  return (
    < header >
      <Navbar className={((location.pathname == "/login") || (location.pathname.includes("/poker"))) ? "d-none" : "d-block"} bg="dark" variant="dark">
        {/* <Navbar bg="dark" variant="dark"> */}
        <Container>
          <LinkContainer to="/" className=''>
            <Navbar.Brand className=''>POKER - ONLINE</Navbar.Brand>
          </LinkContainer>

          <Nav className="basic-navbar-nav ms-auto" bg="dark" variant="dark">
            {userInfo ? (
              <>
                <LinkContainer to='/profile'>
                  <Nav.Link>
                    <div className='justify-content-center d-flex'>
                      {user[1] &&
                        <div className='border overflow-hidden rounded-circle' style={{ aspectRatio: "1/1", height: "30px" }}>
                          <img className='h-100 w-100 border' style={{ objectFit: "cover" }} src={window.location.protocol + "//" + myDomain + user[1].image} alt={user[1].nick_name} />
                        </div>}
                    </div>
                  </Nav.Link>
                </LinkContainer>

                <NavDropdown className='' align="end" title={userInfo.nick_name ? userInfo.nick_name : userInfo.email} id='username'>
                  <LinkContainer to='/profile'>
                    <NavDropdown.Item>
                      <i className='fas fa-user px-2'></i>
                      Profile
                    </NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item onClick={logoutHandler}>
                    <i className="fa-solid fa-arrow-right-from-bracket px-2"></i>
                    Log Out
                  </NavDropdown.Item>
                </NavDropdown>
                <Nav.Link onClick={logoutHandler}>
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                </Nav.Link>
              </>
            ) :
            <LinkContainer to='/login'>
              <Nav.Link >Login <i className="fa-solid fa-right-to-bracket"></i></Nav.Link>
              </LinkContainer>
            }
          </Nav>
        </Container>
      </Navbar>


    </header >

  );
}

export default Header;