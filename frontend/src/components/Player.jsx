import React from 'react'
import { useEffect, useState, useContext } from 'react'
import Ratio from 'react-bootstrap/Ratio';
import Card2 from './Card2'
import './../media/css/player.css'
import Star from './../media/images/star.gif'
import './../media/css/poker-actions.css'
import { gameDetails } from '../actions/pokerActions';
import { hostname } from "../constants/userConstants";

function Player({ options, ended }) {
    const myDomain = hostname
    const [status, setStatus] = useState('')
    const [title, settitle] = useState('')
    useEffect(() => {
        switch (options.title) {
            case 1:
                settitle('High Card');
                break
            case 2:
                settitle('Pair');
                break
            case 3:
                settitle('Two pair');
                break
            case 4:
                settitle('Set');
                break
            case 5:
                settitle('Straight');
                break
            case 6:
                settitle('Flush');
                break
            case 7:
                settitle('FullHouse');
                break
            case 8:
                settitle('Four of a kind');
                break
            case 9:
                settitle('Straight flush');
                break
            case 10:
                settitle('Royal flush');
                break
            default:
                settitle('');
                break
        }
        if (options.status==1) {
            setStatus('fold')
        }
        else 
        {if (ended) {
            setStatus(title)
        }
        else {
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
        }}

    }, [options, status, gameDetails, ended])


    return (
        <>
            <div className={' p-0 m-2 poker-player ' + status} >
                {(options.turn) ?
                    <div className={'turn-blink'} >
                    </div> :
                    null}

                <div className=' rounded-pill '>
                    <img src={window.location.protocol +
                        "//" +
                        myDomain +
                        `${options.image}`} />
                    <div>
                        <div></div>
                        <div>
                            <div><span><i className="fa-solid fa-coins"></i></span> <span>{options.balance}€</span></div>
                            {/* <div>{options.nick_name} - {title} </div> */}
                            <div>{options.user} - {options.nick_name}</div>
                            <div>
                                {((options.turn) && !(options.winner)) ?
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
                <div className={((options.dealer) ? ' dealer' : ' d-none')} ><span>D</span></div>
                <div className={((options.small) ? ' blind' : ' d-none')} ><span>S</span></div>
                <div className={((options.big) ? ' blind' : ' d-none')} ><span>B</span></div>
                <Winner options={options} />
            </div>

        </>
    )
}


function Winner({ options }) {
    return (
        <div className={((options.winner) ? ' winner' : ' d-none')} >
            <img src={Star} alt="Winner animation" />
            <span>+{options.win_amount}€</span>
        </div>
    )
}


export default Player