import React from 'react'
import { useEffect, useState, useContext } from 'react'
import Ratio from 'react-bootstrap/Ratio';
import Card2 from './Card2'
import './../media/css/player.css'
import './../media/css/poker-actions.css'
import { gameDetails } from '../actions/pokerActions';
import { MyContext } from "../App.js"
import { hostname } from "../constants/userConstants";

function Player({ options }) {
    const myDomain = hostname
    const [status, setStatus] = useState('')
    useEffect(() => {
        // console.log(options.image)
        switch (options.status) {
            case 1:
                setStatus('fold');
                break
            case 2:
                setStatus('check');
                break
            case 3:
                setStatus('call');
                break
            case 4:
                setStatus('raise');
                break
            case 5:
                setStatus('allin');
                break
            default:
                setStatus('');
                break
        }
    }, [status, gameDetails, options.status])


    return (
        <>
            <div className={' p-0 m-2 poker-player ' + status} >
                {(options.turn) ?
                    <div className={'turn-blink'} >
                    </div> :
                    null}

                <div className=' rounded-pill '>
                    {/* <img src={require("../media/images" + options.image)} /> */}
                    <img src={window.location.protocol +
                        "//" +
                        myDomain +
                        `${options.image}`} />
                    <div>
                        <div></div>
                        <div>
                            <div><span><i className="fa-solid fa-coins"></i></span> <span>{options.balance}€</span></div>
                            <div>{options.user} - {options.nick_name}</div>
                            <div>
                                {(options.turn) ?
                                    <div className={'turn'} >
                                        <div></div>
                                    </div> :
                                    status}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={((options.bet > 0) ? ' bet' : ' d-none')} >
                    <span>
                        {options.bet}€
                    </span>
                </div>
                <div className="game-card" >
                    <span>
                        <span><Card2 num={options.card1} /></span>
                        <span><Card2 num={options.card2} /></span>
                    </span>
                </div>
                {/* <div className={((options.turn) ? ' turn' : ' d-none')} >
                    <div></div>
                </div> */}
                <div className={((options.dealer) ? ' dealer' : ' d-none')} ><span>D</span></div>
                <div className={((options.small) ? ' blind' : ' d-none')} ><span>S</span></div>
                <div className={((options.big) ? ' blind' : ' d-none')} ><span>B</span></div>
            </div>

        </>
    )
}

export default Player