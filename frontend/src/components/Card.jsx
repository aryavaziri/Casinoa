import React from "react";
import './../media/css/card.css';
import Front from '../media/images/p.webp'
import Heart from '../media/images/hearts.svg'
import { useEffect, useState } from 'react'
import { Row, Col, Container } from 'react-bootstrap'


// function card(num) {
//   const n1 = ((num - 1) % 13) + 1
//   const suit = parseInt((num - 1) / 13)
//   switch (n1) {
//     case 11:
//       this.n = 'J'
//       break;
//     case 12:
//       this.n = 'Q'
//       break;
//     case 13:
//       this.n = 'K'
//       break;
//     case 1:
//       this.n = 'A'
//       break;
//     default:
//       this.n = n1
//       break;
//   }
//   switch (suit) {
//     case 0:
//       this.s = 'Spades'
//       break;
//     case 1:
//       this.s = 'Hearts'
//       break;
//     case 2:
//       this.s = 'Clubs'
//       break;
//     case 3:
//       this.s = 'Diamonds'
//       break;
//   }
// }



export default function Card({ num }) {
  const [flag, setFlag] = useState(false)
  const classLISTARYA = (num > 0 ? "show" : "hide") + " card_game"

  useEffect(() => {
    console.log(num)
  }, [])

  return (

    <>
      <div className={"card_game" + (num > 0 ? " show" : " hide")} style={{ height: "100%", width: "150px" }}>
        <Row className="flex-column justify-content-between m-0 d-flex h-100 w-100">
          <Col xs={4} className="align-self-start d-flex flex-column">
              <span className="text-right mx-auto">J</span>
              <img src={Heart} />
          </Col>
          <Col xs={8} className="align-self-center">
            <img src={Heart} />
          </Col>
          <Col xs={4} className="align-self-end d-flex flex-column" style={{transform: "rotateZ(180deg)"}}>
              <span className="text-right mx-auto">J</span>
              <img src={Heart} />
          </Col>
        </Row>
        <img src={Front} />
      </div>








    </>
  )

}