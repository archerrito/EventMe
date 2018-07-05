import { combineReducers } from 'redux';
import { reducer as FormReducer } from 'redux-form';
import eventReducer from '../../features/event/eventReducer';
import modalsReducer from '../../features/modals/modalReducer';
import authReducer from '../../features/auth/authReducer';

const rootReducer = combineReducers({
    form: FormReducer,
    events: eventReducer,
    modals: modalsReducer,
    auth: authReducer
})

export default rootReducer;