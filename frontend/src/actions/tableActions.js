import axios from "axios";
import {
  TABLE_LIST_REQUEST,
  TABLE_LIST_SUCCESS,
  TABLE_LIST_FAIL,
  TABLE_DETAILS_REQUEST,
  TABLE_DETAILS_SUCCESS,
  TABLE_DETAILS_FAIL,
} from "../constants/tableConstants";
import { hostname} from "../constants/userConstants";

// import { useContext } from 'react'
// import { MyContext } from "../App.js"


//  () => async (a) => a({ type: TABLE_LIST_REQUEST })
export const listTables = () => async (dispatch3) => {
  const myDomain = hostname
  try {
    dispatch3({ type: TABLE_LIST_REQUEST });
    const { data } = await axios.get(
      window.location.protocol +
        "//" +
        myDomain+
        "/api/tables/"
    );
    dispatch3({ type: TABLE_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch3({
      type: TABLE_LIST_FAIL,
      payload:
      error.response && error.response.data.detail
      ? error.response.data.detail
      : error.message,
    });
  }
};

export const listTableDetails = (id) => async (dispatch) => {
  const myDomain = hostname
  try {
    dispatch({ type: TABLE_DETAILS_REQUEST });
    
    const { data } = await axios.get(
      window.location.protocol +
        "//" +
        myDomain+
        `/api/tables/${id}`
    );
    // const { data2 } = await axios.get(
    //   window.location.protocol +
    //     "//" +
    //     window.location.hostname +
    //     `:8000/api/poker/${id}`
    // );
    


    dispatch({ type: TABLE_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: TABLE_DETAILS_FAIL,
      payload:
        error.response && error.response.data.detail
          ? error.response.data.detail
          : error.message,
    });
  }
};
