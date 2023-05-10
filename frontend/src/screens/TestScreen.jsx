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
import Player from '../components/Player'


function TestScreen() {
    const gameInfo = useSelector(state => state.gameDetails)
    const { info } = gameInfo

    return (
        <Player key={info.player[0].user} options={info.player[0]}/>
    )
}

export default TestScreen