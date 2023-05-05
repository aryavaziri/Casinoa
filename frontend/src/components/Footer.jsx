import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'

function Footer() {
  const location = useLocation()

  return (
    <footer>
      <Container className={((location.pathname == "/login")||(location.pathname.includes("/poker")))?"d-none":"d-block"} >
        <hr />
        <Row>
          <Col className='text-center py-3'>Copyright &copy; AryaCasino</Col>
        </Row>
      </Container>
    </footer>



  )
}

export default Footer