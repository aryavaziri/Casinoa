import { Link } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router'
import { useEffect, useState, useRef, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Form, Button } from 'react-bootstrap'
import FormContainer from '../components/FormContainer'
import { getUserDetails, updateUserProfile } from '../actions/userActions'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants'
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { MyContext } from "../App.js"
import { hostname } from "../constants/userConstants";

function ProfileScreen() {

    const [filUpload, setFileUpload] = useState(false)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [img, setImg] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [flag, setFlag] = useState(false)

    const navigate = useNavigate()

    const dispatch = useDispatch()

    const userDetails = useSelector(state => state.userDetails)
    const { loading, error, user } = userDetails

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const userUpdateProfile = useSelector(state => state.userUpdateProfile)
    const { success } = userUpdateProfile

    // const context =useContext(MyContext)
    const myDomain = hostname






    useEffect(() => {
        if (!userInfo) {
            navigate("/login")
        } else {
            // if (!user[0] || !user[1].nick_name || success) {
            if (!user[0] || success) {
                dispatch({ type: USER_UPDATE_PROFILE_RESET })
                dispatch(getUserDetails('profile'))
            } else {
                { user[1].nick_name && setName(user[1].nick_name) }
                setEmail(user[0].email)
            }
        }
        if (success) { setFlag(true) }
    }, [userInfo, dispatch, user, navigate, success])
    useEffect(() => {
        if (!success) {
            setTimeout(() => {
                setFlag(false)
            }, 3000);
        }
    }, [success])

    const submitHandler = (e) => {
        e.preventDefault()

        if (password && (password != confirmPassword)) {
            setMessage('Passwords do not match')
        } else {
            dispatch(updateUserProfile({ 'id': user[0].id, 'name': name, 'email': email, 'password': password, 'img': img }, img))
        }
    }
    const ref = useRef()
    const imgClick = (e) => {
        ref.current.click()
        setFileUpload(true)
    }
    return (
        <>
            <Row className='container mx-auto'>
                <Col md={"4"} className="my-3 p-3">
                    <FormContainer>
                        {error && <Message variant='danger'>{error}</Message>}
                        {message && <Message variant='danger'>{message}</Message>}
                        {flag && <Message variant='success'>Your profile has been updated successfully.</Message>}
                        {loading && <Loader />}
                        <Form onSubmit={submitHandler}>
                            <div className='justify-content-center d-flex'>
                                <Form.Group controlId="formFile" className="mb-3" >
                                    <Form.Control className="d-none"
                                        type="file"
                                        ref={ref}
                                        onChange={(e) => setImg(e.target.files[0])}
                                    />
                                    {user[1] ?
                                        (img == "") ?
                                            <div className='border overflow-hidden rounded-circle mb-3' onClick={imgClick} style={{ aspectRatio: "1/1", height: "150px" }}>
                                                <img className='h-100 w-100 border mb-3' style={{ objectFit: "cover" }} src={window.location.protocol + "//" + myDomain + "/django_static" + user[1].image} alt={user[1].nick_name} />
                                            </div>
                                            : <div className='border overflow-hidden rounded-circle mb-3' onClick={imgClick} style={{ aspectRatio: "1/1", height: "150px" }}>
                                                <img className='h-100 w-100 border mb-3' style={{ objectFit: "cover" }} src={URL.createObjectURL(img)} alt={user[1].nick_name} />
                                            </div>
                                        : <div>Upload an image Please</div>}

                                </Form.Group>
                            </div>

                            <FloatingLabel controlId="email" label="Email" className="mb-3" >
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoFocus
                                />
                            </FloatingLabel>


                            <FloatingLabel controlId="name" label="Nick name" className="mb-3" >
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />

                            </FloatingLabel>


                            <FloatingLabel controlId="password" label="Password" className="mb-3" >
                                <Form.Control
                                    className=''
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                            </FloatingLabel>


                            <FloatingLabel controlId="confirmPassword" label="Confirm Password" className="mb-3" >
                                <Form.Control
                                    type="password"
                                    placeholder="Enter your password again"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />

                            </FloatingLabel>
                            <Button variant="outline-dark" type="submit" className='w-100 py-3 rounded-3 my-1 h2'>
                                Update
                            </Button>
                        </Form>
                    </FormContainer >
                </Col>

                <Col md={4} className='my-3 ms-auto p-3'>
                    <h1>Account</h1>
                    <div className='row'>
                        <div className='col'>Total credit {user[1] ? user[1].credit_total : null}</div>
                        {/* <div className='col'>€ {user.credit?user.credit:null}</div> */}
                        {/* <FloatingLabel controlId="name" label="Amount" className="mb-3" >
                            <Form.Control
                                type="number"
                                placeholder="Amount"
                                // value={name}
                            />
                        </FloatingLabel> */}

                    </div>

                </Col>
            </Row>
        </>
    )
}

export default ProfileScreen