import {
    TABLE_LIST_REQUEST,
    TABLE_LIST_SUCCESS,
    TABLE_LIST_FAIL,

    TABLE_DETAILS_REQUEST,
    TABLE_DETAILS_SUCCESS,
    TABLE_DETAILS_FAIL,

} from '../constants/tableConstants'

export const tableListReducers = (state = { tables: [] }, action) => {
    switch (action.type) {
        case TABLE_LIST_REQUEST:
            return { loading: true, tables: [] }

        case TABLE_LIST_SUCCESS:
            return { loading: false, tables: action.payload }

        case TABLE_LIST_FAIL:
            return { loading: false, error: action.payload }

        default:
            return state
    }
}


export const tableDetailsReducers = (state = { table: { name: [],JSON_table:{online:[]} } }, action) => {
    switch (action.type) {
        case TABLE_DETAILS_REQUEST:
            return { loading: true, ...state }

        case TABLE_DETAILS_SUCCESS:
            return { loading: false, table: action.payload }

        case TABLE_DETAILS_FAIL:
            return { loading: false, error: action.payload }

        default:
            return state
    }
}