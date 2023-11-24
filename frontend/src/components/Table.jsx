import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Ratio from 'react-bootstrap/Ratio';
import { gameDetails } from '../actions/pokerActions'
import { MyContext } from "../App.js"

import { hostname } from "../constants/userConstants";


function Table({ table }) {
    const types = [
        'Holdem-Texas',
        'Omaha',
    ]
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const myDomain = hostname

    const gameInfo = useSelector(state => state.gameDetails)
    const { info } = gameInfo
    useEffect(() => {
        dispatch(gameDetails)
    }, [])
    return (

        // Use this link to redirect to the tables page, otherwise use div for modal use in homescreen
        // <Link to={`/table/${table._id}`} className="text-decoration-none text-reset">
        <div className="text-decoration-none text-reset">
            <Card className='shadow my-3 p-0 rounded-4 overflow-hidden'>
                <img className='' style={{ height: "220px", objectFit: "cover" }} src={window.location.protocol + "//www.casinoa.nl/django_static" + table.img} alt={table.img} />
                <Card.Body className='row pt-3'>
                    <Card.Text className='text-end col-6 my-0 p-1'><strong>Type: </strong></Card.Text><Card.Text className='my-0 p-1 col-6'> <span>{types[table.type]}</span></Card.Text>
                    <Card.Text className='text-end col-6 my-0 p-1'><strong>S/B blinds: </strong></Card.Text><Card.Text className='my-0 p-1 col-6'> <span>{table.small}/{table.small * 2} €</span></Card.Text>
                    <Card.Text className='text-end col-6 my-0 p-1'><strong>Online: </strong></Card.Text><Card.Text className='my-0 p-1 col-6'> <span>{gameInfo.info && gameInfo.info.table == table._id ? info.online : table.JSON_table.online.length}</span></Card.Text>
                    <Button variant="dark" className='my-2 col-auto mx-auto p-4 py-1 shadow fw-bold rounded-pill'>Join</Button>
                </Card.Body>
            </Card >
        </div >






    )
}

export default Table