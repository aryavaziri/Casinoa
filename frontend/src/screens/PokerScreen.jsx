import { Link } from "react-router-dom";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

// import Sonnet from '../../components/Sonnet';
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Form, Button } from "react-bootstrap";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Player from "../components/Player";
import FormContainer from "../components/FormContainer";
import { getUserDetails } from "../actions/userActions";
import {
  gameDetails,
  gameEnter,
  gameLeave,
  gameAction,
} from "../actions/pokerActions";
import { listTableDetails } from "../actions/tableActions";
import Image from "react-bootstrap/Image";
import loginIMG from "../media/images/login.jpg";
import Logo from "../media/images/logo.png";
import Card2 from "../components/Card2";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Modal from "react-bootstrap/Modal";
import { MyContext } from "../App.js";
import { hostname } from "../constants/userConstants";

// let url = `ws://${window.location.hostname}:8000/ws/poker/${id}/`
// let url = `ws://${window.location.hostname}:8000/ws/poker`
// const pokerSocket = new WebSocket(url)

const useSocket = (id, access_token, depo) => {
  const [socket, setSocket] = useState();
  useEffect(() => {
    if (!id || !access_token) return;
    // create socket
    try {
      setSocket(
        new WebSocket(
          `ws://${hostname}/ws/poker/${id}/?token=${access_token}&deposite=${depo}`
        )
      );
    } catch {
      return;
    }
  }, [id]);
  return socket;
};
let count = 0;

function PokerScreen() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { id } = useParams();
  const [key, setKey] = useState("game");
  const [message, setMessage] = useState("");
  const [bet, setBet] = useState(0);
  const location = useLocation();
  const dispatch = useDispatch();
  const { table } = useSelector((state) => state.tableDetails);
  const gameInfo = useSelector((state) => state.gameDetails);
  // const gameEnter = useSelector(state => state.gameEnter)
  const userLogin = useSelector((state) => state.userLogin);
  const { error, loading, userInfo } = userLogin;
  const context = useContext(MyContext);

  // console.log(context[0])
  const socketHeader = userInfo ? userInfo.access : "";
  const socket = useSocket(id, socketHeader, context.dep);

  const { info, infoLoading } = gameInfo;
  const ground = [];
  const orderL = [];
  const orderR = [];
  const orderT = [];
  const order = [];

  let temp;
  let ended = info && info.isFinished;

  const title = (title) =>{
    console.log(title)
    switch (title) {
      case 1:
          return 'High Card'
          break
      case 2:
          return 'Pair'
          break
      case 3:
          return 'Two pair'
          break
      case 4:
          return 'Set'
          break
      case 5:
          return 'Straight'
          break
      case 6:
          return 'Flush'
          break
      case 7:
          return 'FullHouse'
          break
      case 8:
          return 'Four of a kind'
          break
      case 9:
          return 'Straight flush'
          break
      case 10:
          return 'Royal flush'
          break
      default:
          return ''
          break
  }

  }

  useEffect(() => {
    if (socketHeader == "") {
      navigate("/");
    }
    if (!socket) return;
    socket.onmessage = (e) => {
      let data = JSON.parse(e.data);
      console.log("Data:", data);
      document.querySelector("#chat-box").scrollTop =
        document.querySelector("#chat-box").scrollHeight;
      if (data.type == "disp") {
        dispatch(listTableDetails(id));
        dispatch(gameDetails(id));
      }

      if (data && data.type == "finish") {
        // temp = ''
        // if(data.message[0].length == 1){
        //     temp = data.message[0]+" is winner with " + data.message[1]
        // }else{
        //     temp = data.message[0]+" are winners with " + data.message[1]
        // }
        // document.querySelector("#chat-box").value +=
        //   temp + "\n";
        document.querySelector("#chat-box").value += data.message[0]+" is "+ title(data.message[1]) +" and won "+data.message[2]+"€ with " + data.message[3] +"\n"

      }
      if (data && data.type == "chat") {
        document.querySelector("#chat-box").value +=
          data.time + " " + data.sender + "> " + data.message + "\n";
      }

      if (data && data.type == "chat" && document.getElementById("log")) {
        document.getElementById("log").innerHTML += "<br>Data: " + data.message;
      }
      if (
        data &&
        data.type &&
        (data.type == "connected" || data.type == "disconnected")
      ) {
        document.querySelector("#chat-box").value +=
          data.time + " " + data.user + data.message + "\n";
      }
    };
  }, [socket, userInfo, info, dispatch, infoLoading]);

  const sendMessage = (e) => {
    e.preventDefault();
    socket.send(
      JSON.stringify({
        message: message,
      })
    );
    document.querySelector("#message-box").value = "";

  };

  const leave = () => {
    socket.close();
    dispatch(gameAction(id, 0, "leave"));
    navigate("/");
  };
  const fold = () => {
    dispatch(gameAction(id, 0, "fold"));
  };
  const check = () => {
    dispatch(gameAction(id, 0, "check"));
  };
  const call = () => {
    dispatch(gameAction(id, 0, "call"));
  };
  const raise = () => {
    dispatch(gameAction(id, bet, "raise"));
  };
  const allin = () => {
    dispatch(gameAction(id, 0, "allin"));
  };
  const end = () => {
    dispatch(gameAction(id, 0, "end"));
  };
  const newGame = () => {
    dispatch(gameAction(id, 0, "newGame"));
  };
  let gameDBExist = false;
  if (gameInfo && info && info.JSON_ground) {
    gameDBExist = true;
  }

  if (gameDBExist) {
    for (let i = 0; i < 5; i++) {
      ground[i] = info.JSON_ground.ground[i];
    }
    for (let i = 0; i < info.JSON_data.orders.length; i++) {
      order[i] = info.JSON_data.orders[i];
    }
    if (order.includes(userInfo.id)) {
      while (order[0] != userInfo.id) {
        temp = order.shift();
        order.push(temp);
      }
    }
  }
  if (order.length > 0) {
    if (order.length == 2) {
      orderT.push(order[1]);
    } else {
      if (order.length >= 4) {
        if (order.length % 2 != 0) {
          orderT.push(order[(order.length - 1) / 2]);
          orderT.push(order[(order.length + 1) / 2]);
        } else {
          orderT.push(order[order.length / 2]);
        }
      }
      orderL.push(order[1]);
      orderR.push(order[order.length - 1]);
      if (order.length > 5) {
        orderL.push(order[2]);
        orderR.push(order[order.length - 2]);
      }
      if (order.length > 7) {
        orderL.push(order[3]);
        orderR.push(order[order.length - 3]);
      }
    }
  }
  // const action_turn = gameDBExist && (info.turn != userInfo.id)
  const action_turn =
    process.env.NODE_ENV == "development"
      ? false
      : gameDBExist && info.turn != userInfo.id;

  return (
    <>
      <div
        className="fluid m-0 bg-success pt-4 position-relative "
        style={{ height: "75vh" }}
      >
        {gameDBExist && (
          <div className="position-absolute ground d-flex flex-column">
            <div className="col-6 d-flex" style={{ height: "20vh" }}>
              <div className="h-100 col m-0 p-1">
                <Card2 num={ground[0]} />
              </div>
              <div className="h-100 col m-0 p-1">
                <Card2 num={ground[1]} />
              </div>
              <div className="h-100 col m-0 p-1">
                <Card2 num={ground[2]} />
              </div>
              <div className="h-100 col m-0 p-1">
                <Card2 num={ground[3]} />
              </div>
              <div className="h-100 col m-0 p-1">
                <Card2 num={ground[4]} />
              </div>
            </div>
            <div className="col-6 d-flex" style={{ height: "15vh" }}>
              {/* <div className='w-50 m-0 p-1'>Players: <pre> {JSON.stringify(info.player)}</pre></div> */}
              <div
                style={{ fontSize: "13px" }}
                className="w-25 d-flex flex-column m-0 p-1"
              >
                <span>Round: {JSON.stringify(info.round)}</span>
                <span>Pot: {JSON.stringify(info.pot)}</span>
                <span>Online: {JSON.stringify(info.online)}</span>
                <span>Stage: {JSON.stringify(info.stage)}</span>
                <span>Bet: {JSON.stringify(info.bet)}</span>
              </div>
              <div
                style={{ fontSize: "13px" }}
                className="w-25 d-flex flex-column m-0 p-1"
              >
                <span>turn: {JSON.stringify(info.turn)}</span>
                <span>small_blind: {JSON.stringify(info.small_blind)}</span>
                <span>isPlayed: {JSON.stringify(info.isPlayed)}</span>
                <span>isFinished: {JSON.stringify(info.isFinished)}</span>
              </div>
              <div
                style={{ fontSize: "13px" }}
                className="w-25 d-flex flex-column m-0 p-1"
              >
                <span>bets: {JSON.stringify(info.JSON_data.bets)}</span>
                <span>actions: {JSON.stringify(info.JSON_data.actions)}</span>
                <span>order: {JSON.stringify(info.JSON_data.orders)}</span>
                <span>online: {JSON.stringify(table.JSON_table.online)}</span>
              </div>
              <div
                style={{ fontSize: "13px" }}
                className="w-25 d-flex flex-column m-0 p-1"
              >
                <span>
                  allin pots: {JSON.stringify(info.JSON_data.allin_pots)}
                </span>
                <span>
                  card winner: {JSON.stringify(info.JSON_data.card_winner)}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="p-0 m-0 arrange d-flex">
          <div className="l d-flex align-items-center flex-column-reverse justify-content-around">
            {gameDBExist &&
              orderL.map((val) => {
                return info.player.map((v) => {
                  if (v.user == val && v.user != userInfo.id) {
                    return <Player key={v.user} options={v} ended={ended} />;
                  }
                });
              })}
          </div>
          <div className="t d-flex justify-content-around">
            {gameDBExist &&
              orderT.map((val) => {
                return info.player.map((v) => {
                  if (v.user == val && v.id != userInfo.id) {
                    return <Player key={v.user} options={v} ended={ended} />;
                  }
                });
              })}
          </div>
          <div className="r d-flex align-items-center flex-column-reverse justify-content-around">
            {gameDBExist &&
              orderR.map((val) => {
                return info.player.map((v) => {
                  if (v.user == val && v.user != userInfo.id) {
                    return <Player key={v.user} options={v} ended={ended} />;
                  }
                });
              })}
          </div>
        </div>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header className="bg-dark text-light" closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body className=" bg-info">
          <div className="fluid p-2 m-0 bg-info position-relative" style={{}}>
            <ul className="pt-3">
              {table.JSON_table.online.length > 0
                ? table.JSON_table.online.map((v, i) => {
                    return (
                      <li key={i}>
                        <p>
                          {v[0]} - {v[1]}{" "}
                        </p>
                      </li>
                    );
                  })
                : null}
            </ul>
            <div id="log"></div>
          </div>
        </Modal.Body>
      </Modal>

      <div className="row m-0 bg-dark p-0" style={{ height: "25vh" }}>
        <div className="col-5 d-flex justify-content-evenly py-0 flex-wrap">
          <Button
            variant="danger"
            className=" m-1 h-25 "
            onClick={() => leave()}
          >
            Sit out
          </Button>
          <Button
            disabled={action_turn}
            className=" my-1 h-25 "
            onClick={() => fold()}
          >
            Fold
          </Button>
          <Button
            disabled={action_turn}
            className=" my-1 h-25 "
            onClick={() => check()}
          >
            Check
          </Button>
          <Button
            disabled={action_turn}
            className=" my-1 h-25 "
            onClick={() => call()}
          >
            Call
          </Button>
          <Button
            disabled={action_turn}
            className=" my-1 h-25 "
            onClick={() => raise()}
          >
            Raise
          </Button>
          <Button
            disabled={action_turn}
            className=" my-1 h-25 "
            onClick={() => allin()}
          >
            All-in
          </Button>
          <Button
            disabled={action_turn}
            className=" my-1 h-25 "
            onClick={() => end()}
          >
            End
          </Button>
          <Button variant="warning" className=" m-1 h-25 " onClick={handleShow}>
            LOG
          </Button>
          <Button
            variant="warning"
            disabled={
              process.env.NODE_ENV == "development"
                ? false
                : gameDBExist && !info.isFinished
            }
            className=" my-1 h-25"
            onClick={() => newGame()}
          >
            New-game
          </Button>
          {/* {gameDBExist && <span className='text-light'>POT:{gameInfo.info.pot}/ BET:{gameInfo.info.bet}/ STAGE:{gameInfo.info.stage}</span>} */}
          <FloatingLabel controlId="bet" label="Bet" className="">
            <Form.Control
              className="bg-light"
              type="number"
              value={bet}
              onChange={(e) => setBet(e.target.value)}
              autoFocus
            />
          </FloatingLabel>
        </div>
        <div
          id="me"
          className="col-4 d-flex justify-content-center h-100 py-0 own"
        >
          {gameDBExist &&
            info.own &&
            info.player.map((value) => {
              if (value.user == userInfo.id) {
                return (
                  <Player key={value.user} options={info.own} ended={ended} />
                );
              }
            })}
        </div>
        <div className="col-3 row d-flex p-2 py-1 m-0 pb-3">
          <Form.Control
            readOnly
            className="h-75 my-1 text-light"
            style={{ fontSize: "12px" }}
            as="textarea"
            id="chat-box"
          />
          <form className="row m-0 p-0 d-flex" onSubmit={(e) => sendMessage(e)}>
            <Form.Control
              id="message-box"
              className="bg-light"
              type="text"
              autoFocus
              style={{ width: "73%", marginRight: "2%" }}
              onChange={(e) => setMessage(e.target.value)}
              autoComplete="off"
            />
            <Button className="px-2 col-3" onClick={(e) => sendMessage(e)}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

export default PokerScreen;
