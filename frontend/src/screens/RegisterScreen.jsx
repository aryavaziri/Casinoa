import { Link } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Form, Button } from 'react-bootstrap'
import FormContainer from '../components/FormContainer'
import { register } from '../actions/userActions'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { hostname } from "../constants/userConstants";

function RegisterScreen() {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [ConfirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')

    const location = useLocation()
    const navigate = useNavigate()
    const redir = location.search ? location.search.split('=')[1] : '/'

    const dispatch = useDispatch()
    const userRegister = useSelector(state => state.userLogin)
    const { userInfo, loading, error } = userRegister
    useEffect(() => {
        if (userInfo) {
            navigate(redir)
        }
    }, [navigate, redir, userInfo])
    // console.log(redirect)

    const submitHandler = (e) => {
        e.preventDefault()

        if (password != ConfirmPassword) {
            setMessage('Passwords do not match')
        } else {
            dispatch(register(name, email, password))
        }

    }
    return (
        <Row>
            <Col className='mx-auto' md={4}>
                <FormContainer>
                    {error && <Message variant='danger'>{error}</Message>}
                    {message && <Message variant='danger'>{message}</Message>}
                    {loading && <Loader />}

                    <h1>Register</h1>
                    <Form onSubmit={submitHandler}>
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                required
                                type="email"
                                autoComplete='off'
                                placeholder="Enter your Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                                />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                autoComplete='off'
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                autoComplete='new-password'
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="ConfrimPassword">
                            <Form.Label>Confirm password</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                autoComplete='new-password'
                                placeholder="Enter your password again"
                                value={ConfirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </Form.Group>
                        <Button variant="outline-light" type="submit" className='w-100 py-2 rounded-3 h2 sign-in'>
                                Register
                            </Button>
                    </Form>
                    <br />
                    <Row className='my-4'>
                            <Col className='col px-0'><hr /></Col>
                            <Col className='col-auto'>
                                Have an account?
                                <Link className='text-decoration-none' to={'/login'}>
                                    <span className='mx-2 h5 saeed-color'>Sign-in</span>
                                </Link>
                            </Col>
                            <Col className='col px-0'><hr /></Col>
                        </Row>

                </FormContainer >

            </Col>
        </Row>

    )
}

export default RegisterScreen