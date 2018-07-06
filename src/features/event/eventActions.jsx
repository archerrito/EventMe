import { CREATE_EVENT, DELETE_EVENT, UPDATE_EVENT, FETCH_EVENTS } from './eventConstants';
import { asyncActionStart, asyncActionFinish, asyncActionError} from '../async/asyncActions';
import { fetchSampleData } from '../../app/data/mockApi';


export const fetchEvents = (events) => {
    return {
        type: FETCH_EVENTS,
        payload: events
    }
}

export const createEvent = (event) => {
    return {
        type: CREATE_EVENT,
        //pass in to reducer
        payload: {
            event
        }
    }
}

export const updateEvent = (event) => {
    return {
        type: UPDATE_EVENT,
        //pass in to reducer
        payload: {
            event
        }
    }
}

export const deleteEvent = (eventId) => {
    return {
        type: DELETE_EVENT,
        //pass in to reducer
        payload: {
            eventId
        }
    }
}

export const loadEvents = () => {
    return async dispatch => {
        try {
            //
            dispatch(asyncActionStart())
            //hold array of events
            let events = await fetchSampleData();
            dispatch(fetchEvents(events))
            dispatch()
        } catch (error) {
            dispatch(asyncActionError())
        }
    }
}