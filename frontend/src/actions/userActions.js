import axios from "axios";
import {
  USER_LOGOUT,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_DETAIL_REQUEST,
  USER_DETAIL_SUCCESS,
  USER_DETAIL_FAIL,
  USER_DETAIL_RESET,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_UPDATE_PROFILE_FAIL,
  USER_UPDATE_PROFILE_RESET,
  hostname
} from "../constants/userConstants";
// import { useContext } from 'react'
// import { MyContext } from "../App.js"


export const login = (email, password) => async (dispatch) => {
  // const {hostname} =useContext(MyContext)
  try {
    dispatch({ type: USER_LOGIN_REQUEST });
    const config = {
      headers: {
        "Content-type": "application/json",
      },
    };
    const { data } = await axios.post(
      window.location.protocol +
        "//" +
        hostname+
        "/api/users/login/",
      { email: email, password: password },
      config
      );
      dispatch({ type: USER_LOGIN_SUCCESS, payload: data });
      localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (error) {
      dispatch({
        type: USER_LOGIN_FAIL,
        payload:
        error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message,
    });
  }
};

export const logout = () => (dispatch) => {
  // const {hostname} =useContext(MyContext)
  localStorage.removeItem("userInfo");
  dispatch({ type: USER_LOGOUT });
  dispatch({ type: USER_DETAIL_RESET });
};

export const register = (name, email, password) => async (dispatch) => {
  // const {hostname} =useContext(MyContext)
  try {
    dispatch({ type: USER_REGISTER_REQUEST });
    const config = {
      headers: {
        "Content-type": "application/json",
      },
    };
    const { data } = await axios.post(
      window.location.protocol +
      "//" +
      hostname+
      "/api/users/register/",
      { name: name, email: email, password: password },
      config
      );
      dispatch({ type: USER_REGISTER_SUCCESS, payload: data });
      dispatch({ type: USER_LOGIN_SUCCESS, payload: data });
      localStorage.setItem("userInfo", JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: USER_REGISTER_FAIL,
      payload:
      error.response && error.response.data.detail
      ? error.response.data.detail
      : error.message,
    });
  }
};

export const getUserDetails = (id) => async (dispatch, getState) => {
  // const {hostname} =useContext(MyContext)
  try {
    dispatch({ type: USER_DETAIL_REQUEST });
    const {
      userLogin: { userInfo },
    } = getState();
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${userInfo.access}`,
      },};
    // const { data } = await axios.get(window.location.protocol + "//" + hostname+ `/api/users/${id}/`,config);
    const { data } = await axios.get(window.location.protocol + "//" + hostname+ `/api/users/profile/`,config);
    dispatch({ type: USER_DETAIL_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: USER_DETAIL_FAIL,
      payload:
        error.response && error.response.data.detail
          ? error.response.data.detail
          : error.message,
    });
  }
};

export const updateUserProfile = (user, img) => async (dispatch, getState) => {
  // const {hostname} =useContext(MyContext)
  try {
    dispatch({ type: USER_UPDATE_PROFILE_REQUEST });
    const {
      userLogin: { userInfo },
    } = getState();
    
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${userInfo.access}`,
      },
    };

    const config2 = {
      headers: {
        "Content-type": "multipart/form-data",
        Authorization: `Bearer ${userInfo.access}`,
      },
    };

    // await axios.post(
    //   window.location.protocol +
    //     "//" +
    //     hostname+
    //     `/api/users/profile/upload/`,
    //   img,
    //   config2
    // );
    const {data} = await axios.put(
      window.location.protocol +
        "//" +
        hostname+
        `/api/users/profile/update/`,
      user,
      config2
    );
    // console.log(data)
    // data[0].access = userInfo.access
    // console.log(data)
    dispatch({ type: USER_UPDATE_PROFILE_SUCCESS, payload: data });
    
    localStorage.setItem("userInfo", JSON.stringify(data[0]));

  } catch (error) {
    dispatch({
      type: USER_UPDATE_PROFILE_FAIL,
      payload:
      error.response && error.response.data.detail
      ? error.response.data.detail
      : error.message,
    });
  }
};
