import {
    TABLE_LIST_REQUEST,
    TABLE_LIST_SUCCESS,
    TABLE_LIST_FAIL,

    TABLE_DETAILS_REQUEST,
    TABLE_DETAILS_SUCCESS,
    TABLE_DETAILS_FAIL,

} from '../constants/tableConstants'

export const orderPaymentReducers = (state = {  }, action) => {
    switch (action.type) {
        case TABLE_LIST_REQUEST:
            return { loading: true, tables: [] }
        default:
            return state
    }
}