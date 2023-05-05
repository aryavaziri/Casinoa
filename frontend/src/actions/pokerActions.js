import axios from "axios";
import { hostname } from "../constants/userConstants";
import {
  GAME_DETAILS_REQUEST,
  GAME_DETAILS_SUCCESS,
  GAME_DETAILS_FAIL,
  GAME_ENTER_REQUEST,
  GAME_ENTER_SUCCESS,
  GAME_ENTER_FAIL,
  GAME_NEXT_ROUND_REQUEST,
  GAME_NEXT_ROUND_SUCCESS,
  GAME_NEXT_ROUND_FAIL,
  GAME_LEAVE_REQUEST,
  GAME_LEAVE_SUCCESS,
  GAME_LEAVE_FAIL,
  GAME_ACTION_REQUEST,
  GAME_ACTION_SUCCESS,
  GAME_ACTION_FAIL,
} from "../constants/pokerConstants";
// import { useContext } from 'react'
// import { MyContext } from "../App.js"

export const gameDetails = (id) => async (dispatch, getState) => {
  // const {hostname} =useContext(MyContext)
  const myDomain = hostname;
  try {
    dispatch({ type: GAME_DETAILS_REQUEST });
    const {
      userLogin: { userInfo },
    } = getState();
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${userInfo.access}`,
      },
    };

    const { data } = await axios.get(
      window.location.protocol + "//" + myDomain + `/api/poker/${id}`,
      config
    );

    dispatch({ type: GAME_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GAME_DETAILS_FAIL,
      payload:
        error.response && error.response.data.detail
          ? error.response.data.detail
          : error.message,
    });
  }
};

export const gameEnter = (id, deposite) => async (dispatch, getState) => {
  // const {hostname} =useContext(MyContext)
  const myDomain = hostname;
  try {
    dispatch({ type: GAME_ENTER_REQUEST });
    const {
      userLogin: { userInfo },
    } = getState();
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${userInfo.access}`,
      },
    };

    const { data } = await axios.put(
      window.location.protocol + "//" + myDomain + `/api/poker/${id}/enter/`,
      deposite,
      config
    );
    dispatch({ type: GAME_DETAILS_SUCCESS, payload: data });
    dispatch({ type: GAME_ENTER_SUCCESS });
  } catch (error) {
    dispatch({
      type: GAME_ENTER_FAIL,
      payload:
        error.response && error.response.data.detail
          ? error.response.data.detail
          : error.message,
    });
  }
};


export const gameAction = 
  (id, bet, actionType) => async (dispatch, getState) => {
    // const {hostname} =useContext(MyContext)
    const myDomain = hostname;
    try {
      dispatch({ type: GAME_ACTION_REQUEST });
      const {
        userLogin: { userInfo },
      } = getState();
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${userInfo.access}`,
        },
      };
      let actSwitch;
      let act = "";
      let act2 = { act, bet };
      switch (actionType) {
        case "fold":
          actSwitch = "fold";
          break;
        case "check":
          actSwitch = "check";
          break;
        case "call":
          actSwitch = "call";
          break;
        case "leave":
          actSwitch = "leave";
          break;
        case "raise":
          actSwitch = "raise";
          break;
        case "allin":
          actSwitch = "allin";
          break;
        case "newGame":
          actSwitch = "NewGame";
          break;
      }
      act2.act = actSwitch;
      act2.bet = bet;
      const { data } = await axios.put(
        window.location.protocol + "//" + myDomain + `/api/poker/${id}/action/`,
        act2,
        config
      );
      dispatch({ type: GAME_DETAILS_SUCCESS, payload: data });
      dispatch({ type: GAME_ACTION_SUCCESS });
    } catch (error) {
      dispatch({
        type: GAME_ACTION_FAIL,
        payload:
          error.response && error.response.data.detail
            ? error.response.data.detail
            : error.message,
      });
    }
  };
