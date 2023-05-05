import React from "react";
import './../media/css/card2.css';
import Front from '../media/images/p2.webp'
import Hearts from '../media/images/hearts.svg'
import Clubs from '../media/images/clubs.svg'
import Diamonds from '../media/images/diamonds.svg'
import Spades from '../media/images/spades.svg'
import { useEffect, useState } from 'react'
import { Row, Col, Container } from 'react-bootstrap'





export default function Card2({ num }) {
  const n1 = parseInt(((parseInt(num) - 1) % 13) + 1)
  const suit = parseInt((parseInt(num) - 1) / 13)
  let n = ''
  let s = ''

  switch (n1) {
    case 11:
      n = 'J'
      break;
    case 12:
      n = 'Q'
      break;
    case 13:
      n = 'K'
      break;
    case 1:
      n = 'A'
      break;
    default:
      n = n1
      break;
  }
  switch (suit) {
    case 0:
      s = Spades
      break;
    case 1:
      s = Hearts
      break;
    case 2:
      s = Clubs
      break;
    case 3:
      s = Diamonds
      break;
  }
  // const [card, setFlag] = useState(num)
  // const classLISTARYA = (num > 0 ? "show" : "hide") + " card_game"

  // useEffect(() => {
  //   console.log(num)
  // }, [])

  return (

      <div className='card2' style={{ maxHeight: "100%", width: "100%" }}>
        {(num)?
        <div>
          <span style={{color:(((suit==0)||(suit==2))?'black':'red')}}>{n}</span>
          <span><img src={s} alt="" /> </span>
        </div>
          :<img src={Front} />
        
      }
      </div>
  )

}