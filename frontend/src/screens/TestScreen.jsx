// import React, { useState, useEffect } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Container, Modal } from 'react-bootstrap'
import { listTables } from '../actions/tableActions'
import Table from '../components/Table'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Buyin from '../components/Buyin'
import { useState ,useContext} from 'react'


function TestScreen() {

    return (
        <Container>
            <h1>Test</h1>
            <ul>
                
            </ul>
        </Container>
    )
}

export default TestScreen