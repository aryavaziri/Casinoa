import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { listTableDetails } from '../actions/tableActions'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { hostname } from "../constants/userConstants";

function TableScreen() {
    let { id } = useParams();
    const dispatch = useDispatch()

    //selecting which reducer's state you want
    const { table, loading, error } = useSelector(state => state.tableDetails)
    // const tableDetails = useSelector(state => state.tableDetails)
    // const { loading, error, table } = tableDetails


    useEffect(() => {
        dispatch(listTableDetails(id))
    }, [dispatch,id])

    return (
        <div>
            <Link to='/' className='btn btn-light my-4'>Go Back</Link>
            {
                loading ? <Loader />
                    : error
                        ? <Message variant='danger'>{error}</Message>
                        : (
                            <Row>
                                <h3>{table.name}</h3>
                                <h4>{table.type}</h4>
                            </Row>
                        )
            }
        </div>
    )
}

export default TableScreen