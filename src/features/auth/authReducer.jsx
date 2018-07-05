import { LOGIN_USER, SIGN_OUT_USER } from './authConstants';
import { createReducer } from '../../app/common/util/reducerUtil';

const intialState = {
    currentUser: {}
}

export const loginUser = (state, payload) => {
    return {
        //want to return authenticated state
        //will be details of empty currentUser object
        ...state, 
        authenticated: true,
        currentUser:payload.creds.email
    }
}

export const signOutUser = (state, payload) => {
    return {
        //want to return authenticated state
        //will be details of empty currentUser object
        ...state, 
        authenticated: false,
        currentUser: {}
    }
}

export default createReducer(intialState, {
    [LOGIN_USER]: loginUser,
    [SIGN_OUT_USER]: signOutUser
})