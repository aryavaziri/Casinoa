export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST'
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS'
export const USER_LOGIN_FAIL = 'USER_LOGIN_FAIL'

export const USER_LOGOUT = 'USER_LOGOUT'
let x
if(process.env.NODE_ENV == "development"){
    x = window.location.hostname + ":8000"
} else {x = window.location.host}
export const hostname = x

export const USER_REGISTER_REQUEST = 'USER_REGISTER_REQUEST'
export const USER_REGISTER_SUCCESS = 'USER_REGISTER_SUCCESS'
export const USER_REGISTER_FAIL = 'USER_REGISTER_FAIL'


export const USER_DETAIL_REQUEST = 'USER_DETAIL_REQUEST'
export const USER_DETAIL_SUCCESS = 'USER_DETAIL_SUCCESS'
export const USER_DETAIL_FAIL = 'USER_DETAIL_FAIL'
export const USER_DETAIL_RESET = 'USER_DETAIL_RESET'

export const USER_UPDATE_REQUEST = 'USER_UPDATE_REQUEST'
export const USER_UPDATE_SUCCESS = 'USER_UPDATE_SUCCESS'
export const USER_UPDATE_FAIL = 'USER_UPDATE_FAIL'

export const USER_UPDATE_PROFILE_REQUEST = 'USER_UPDATE_PROFILE_REQUEST'
export const USER_UPDATE_PROFILE_SUCCESS = 'USER_UPDATE_PROFILE_SUCCESS'
export const USER_UPDATE_PROFILE_FAIL = 'USER_UPDATE_PROFILE_FAIL'
export const USER_UPDATE_PROFILE_RESET = 'USER_UPDATE_PROFILE_RESET'

