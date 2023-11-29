// import React, { useState, useEffect } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Container, Modal } from 'react-bootstrap'
import { listTables } from '../actions/tableActions'
import { getUserDetails } from '../actions/userActions'
import Table from '../components/Table'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Buyin from '../components/Buyin'
import { useState, useContext } from 'react'


function HomeScreen() {
    const dispatch = useDispatch()
    //selecting which reducer's state you want
    const tableList = useSelector(state => state.tableList)
    const { tables, loading, error } = tableList

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);

    const [selectedTable, setSelectedTable] = useState('');
    const modalHandler = (i) => {
        setShow(true)
        setSelectedTable(i)
    }
    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    useEffect(() => {
        dispatch(listTables())
        if (userInfo) {
            dispatch(getUserDetails('profile'))
        }
    }, [dispatch])

    return (
        <Container>
            <Modal show={show} onHide={handleClose} className=''>
                {tables.length != 0 ? <Buyin table={selectedTable} /> : ''}
            </Modal>
            <div>
                {/* <h1 className='my-3'>Available tables</h1> */}
                {loading ? <Loader />
                    : error ? <Message variant='danger'>{error}</Message>
                        :
                        <Row className='mt-4'>
                            {tables.map(i => {
                                return (
                                    < Col onClick={() => modalHandler(i)} sm={12} md={6} lg={4} key={i._id} >
                                        <Table table={i} />
                                    </Col>
                                )
                            })}
                        </Row>
                }
            </div>
        </Container>
    )
}

export default HomeScreen