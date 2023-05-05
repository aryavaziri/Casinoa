import { Link } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Form, Button } from 'react-bootstrap'
import Loader from '../components/Loader'
import Message from '../components/Message'
import FormContainer from '../components/FormContainer'
import { login } from '../actions/userActions'
// import Image from 'react-bootstrap/Image'
import loginIMG from '../media/images/login.jpg'
import Logo from '../media/images/logo.png'
import { LinkContainer } from 'react-router-bootstrap';

function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const location = useLocation()
    const navigate = useNavigate()
    const redir = location.search ? location.search.split('=')[1] : '/'

    const dispatch = useDispatch()
    const userLogin = useSelector(state => state.userLogin)
    const { error, loading, userInfo } = userLogin
    useEffect(() => {
        if (userInfo) {
            navigate(redir)
        }
    }, [navigate, redir, userInfo])

    const submitHandler = (e) => {
        e.preventDefault()
        dispatch(login(email, password))
    }
    return (
        <>
            <Row style={{ backgroundImage: "url(" + loginIMG + ")", backgroundSize: "auto 100%", backgroundColor: "black", backgroundRepeat: "no-repeat", minHeight: "100vh" }} className='m-0 p-0 justify-content-end'>
                <Col style={{ backgroundColor: "white" }} className='border' xs={12} md={4} >
                    <FormContainer>
                        <LinkContainer to='/'>
                            <Link className='text-decoration-none'>
                                <div className='mt-3 w-100 d-flex'><img className='mx-auto' alt='LOGO' style={{ height: "100px", backgraoundSize: "100%" }} src={Logo} /></div>
                                <h2 id={"logo"} className='w-auto mx-auto p-1 mb-2 text-center'>CASINOA</h2>
                                <h6 className='p-1 mb-2 text-muted text-center'>Welcome</h6>
                            </Link>
                        </LinkContainer>

                        <hr />
                        {error && <Message variant='danger'>{error}</Message>}
                        {loading && <Loader />}

                        <Form onSubmit={submitHandler}>
                            <Form.Group className="mb-3" controlId="email">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoFocus
                                    size="lg"
                                />
                            </Form.Group>

                            <Form.Group className="mb-2" controlId="password">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    size="lg"
                                />
                            </Form.Group>
                            <Row className='text-end mb-0'>
                                <Link className='text-decoration-none saeed-color' to="/">Forgot your password?</Link>
                            </Row>
                            <br />
                            <Button variant="outline-light" type="submit" className='w-100 py-2 rounded-3 h2 sign-in'>
                                Sign in
                            </Button>
                        </Form>
                        <Row className='my-4'>
                            <Col className='col px-0'><hr /></Col>
                            <Col className='col-auto'>
                                Do not have an account yet?
                                <Link className='text-decoration-none' to={redir ? `/register?redirect=${redir}` : '/register'}>
                                    <span className='mx-2 h5 saeed-color'>Sign-up</span>
                                </Link>
                            </Col>
                            <Col className='col px-0'><hr /></Col>
                        </Row>
                    </FormContainer >
                </Col>
            </Row>
        </>
    )
}

export default LoginScreen