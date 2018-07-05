import { combineReducers } from 'redux';
import { reducer as FormReducer } from 'redux-form';
import eventReducer from '../../features/event/eventReducer';
import modalsReducer from '../../features/modals/modalReducer';

const rootReducer = combineReducers({
    form: FormReducer,
    events: eventReducer,
    modals: modalsReducer
})

export default rootReducer;