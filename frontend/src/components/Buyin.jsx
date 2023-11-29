import React from 'react'
import { useContext } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Ratio from 'react-bootstrap/Ratio';
import Modal from 'react-bootstrap/Modal';
import { gameDetails, gameEnter } from '../actions/pokerActions'
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../actions/userActions'
// import { payOrder } from '../actions/orderActions'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Test2 from './Test2';
import { MyContext } from "../App.js"
// import {DepositeContext} from "../App.js"
import { hostname } from "../constants/userConstants";

function Buyin({ table }) {

    const navigate = useNavigate()

    const gameInfo = useSelector(state => state.gameDetails)
    const { info } = gameInfo

    const userDetails = useSelector(state => state.userDetails)
    const { user } = userDetails

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const dispatch = useDispatch()
    const [deposite, setDeposite] = useState(100);
    const [aip, setaip] = useState(0);


    const context = useContext(MyContext)
    const myDomain = hostname
    const [dd, setdd] = [context.dep, context.setdep]

    useEffect(() => {
        console.log(!Object.keys(user).length)
        if (!userInfo) {
            navigate("/login")
        } else {
            if (!Object.keys(user).length) {
                dispatch(getUserDetails('profile'))
            }
            else {
                dispatch(gameDetails(table._id))
            }
        }
    }, [userInfo, dispatch, user, navigate])



    const submitHandler = (e) => {
        // console.log(table._id)
        e.preventDefault()
        dispatch(gameDetails(table._id))
        setdd(deposite)
        navigate(`/poker/${table._id}`)

    }

    const types = [
        'Holdem-Texas',
        'Omaha',
    ]
    const maxs = [
        (0, 3),
        (1, 6),
        (2, 9),
    ]


    return (
        <Card className='shadow m-0 p-0 rounded overflow-hidden border-none'>
            <img className='' style={{ height: "260px", objectFit: "cover" }} src={window.location.protocol + "//" + myDomain + "/django_static" + table.img} alt={table.img} />
            <Card.Body className='row pt-3'>
                <div className='col-6 d-flex flex-column'>
                    <Card.Text className='text-start col-12 my-0 p-2'><strong>Type: </strong>{types[table.type]}</Card.Text>
                    <Card.Text className='text-start col-12 my-0 p-2'><strong>S/B blinds: </strong>{table.small}/{table.small * 2} €</Card.Text>
                    <Card.Text className='text-start col-12 my-0 p-2'><strong>Minimum Buy-in: </strong>{table.min}</Card.Text>
                    <Card.Text className='text-start col-12 mt-auto p-2'><strong>Credit: </strong> € {user[1] ? user[1].credit_total : null}</Card.Text>
                </div>
                <div className='col-6'>
                    <Card.Subtitle className='text-start col-12 my-0 p-2 d-flex flex-column justify-content-center'>
                        <strong className='w-100 text-center'>Players <span className='text-muted fw-light'>({gameInfo.info ? info.online : table.JSON_table.online.length}/{maxs[table.max]})</span> </strong>
                        <ul className='list-group px-4 list-group-flush'>
                            {(((gameInfo != null) && (gameInfo.info)) && (gameInfo.info.table)) && info.player.map(i => {
                                return (
                                    <li className='list-group-item d-flex justify-content-between' key={i.user}>
                                        <span>{i.nick_name}</span>
                                        <span>€{i.balance}</span>
                                    </li>
                                )
                            })}
                        </ul>
                    </Card.Subtitle>
                </div>
            </Card.Body>
            <Modal.Footer className='row'>
                {/* <Form.Label className='col-3'>Deposit:</Form.Label> */}
                <span className='col-auto pr-0 mr-0'>Deposite:</span>
                <Form id='deposite' className='col' onSubmit={submitHandler}>
                    <Form.Group className="" controlId="email">
                        <Form.Control
                            className=''
                            defaultValue={100}
                            autoComplete='off'
                            type="num"
                            placeholder="Amount"
                            onChange={(e) => (e.target.value == '') ? setDeposite(0) : setDeposite(parseInt(e.target.value))}
                            autoFocus
                        // size="lg"
                        />
                    </Form.Group>
                </Form>
                <Button type='submit' form='deposite' disabled={((deposite > table.min) && (deposite <= user[1].credit_total) && (table.isAvailable)) ? false : true} className='col-3 ' variant="dark" onClick={() => submitHandler}>
                    Join table
                </Button>

            </Modal.Footer>
        </Card >
    )
}

export default Buyin