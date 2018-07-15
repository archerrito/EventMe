import { toastr } from 'react-redux-toastr';
import { FETCH_EVENTS } from './eventConstants';
import { asyncActionStart, asyncActionFinish, asyncActionError} from '../async/asyncActions';
import { createNewEvent } from '../../app/common/util/helpers';
import moment from 'moment';
import firebase from '../../app/config/firebase';
import compareAsc from 'date-fns/compare_asc';

export const createEvent = (event) => {
    return async (dispatch, getState, {getFirestore}) => {
        const firestore = getFirestore();
        const user = firestore.auth().currentUser;
        //get access to redux state, pull out info. Access to user photo
        const photoURL = getState().firebase.profile.photoURL;
        let newEvent = createNewEvent(user, photoURL, event);
        try {
            //creates new event in collection in firestore
            let createdEvent = await firestore.add(`events`, newEvent);
            //set to query against attendees since not relational database
            await firestore.set(`event_attendee/${createdEvent.id}_${user.uid}`, {
                eventId: createdEvent.id,
                userUid: user.uid,
                eventDate: event.date,
                host: true
            })
            toastr.success('Success!', 'Event has been created')
        } catch (error) {
            toastr.error('Oops', 'Something went wrong')
        }
    };
};

export const updateEvent = event => {
    return async (dispatch, getState) => {
      dispatch(asyncActionStart());
      const firestore = firebase.firestore();

      //check if date is different from existing data
      if (event.date !== getState().firestore.ordered.events[0].date) {
        event.date = moment(event.date).toDate();
      }
      try {
        //get ref to event doc
        let eventDocRef = firestore.collection('events').doc(event.id);
        //compare existing date inside redux state, with event date from form
        let dateEqual = compareAsc(getState().firestore.ordered.events[0].date.toDate(), event.date);
        if (dateEqual !== 0) {
          let batch = firestore.batch();
          await batch.update(eventDocRef, event);
  
          //take care of attendees
          let eventAttendeeRef = firestore.collection('event_attendee');
          let eventAttendeeQuery = await eventAttendeeRef.where('eventId', '==', event.id);
          //gives us documents inside event attendee query snapshot
          //ones we will need to update
          let eventAttendeeQuerySnap = await eventAttendeeQuery.get();
  
          for (let i = 0; i < eventAttendeeQuerySnap.docs.length; i++) {
              //get doc reference
            let eventAttendeeDocRef = await firestore.collection('event_attendee').doc(eventAttendeeQuerySnap.docs[i].id);
            await batch.update(eventAttendeeDocRef, {
              eventDate: event.date
            })
          }
          await batch.commit();
        } else {
          await eventDocRef.update(event);
        }
        dispatch(asyncActionFinish());
        toastr.success('Success', 'Event has been updated');
      } catch (error) {
        console.log(error);
        dispatch(asyncActionError());
        toastr.error('Oops', 'Something went wrong');
      }
    };
  };

export const cancelToggle = (cancelled, eventId) =>
    async (dispatch, getState, {getFirestore}) => {
        const firestore = getFirestore();
        const message = cancelled 
            ? 'Are you sure you want to cancel the event?'
            : 'This will reactivate the event - are you sure?'
        try {
            toastr.confirm(message, {
                onOk: () => 
                firestore.update(`events/${eventId}`, {
                    cancelled: cancelled
                })
            })
          await firestore.update(`events/${eventId}`, {
              cancelled: cancelled
          })  
        } catch (error) {
            console.log(error);
        }
    }
//pass last event as paramter to event dashboard
//respresents last event returned
export const getEventsForDashboard = (lastEvent) =>
async (dispatch, getState) => {
    let today = new Date(Date.now());
    const firestore = firebase.firestore();
    const eventsRef = firestore.collection('events');
    try {
        dispatch(asyncActionStart());
        //use last event to start after when send query to firestore for paging
        let startAfter = 
        lastEvent && 
        (await firestore
            .collection('events')
            .doc(lastEvent.id)
            .get());
        let query;

        lastEvent 
            ? (query = eventsRef
                .where('date', '>=', today)
                .orderBy('date')
                .startAfter(startAfter)
                .limit(2))
            : (query = eventsRef
                .where('date', '>=', today)
                .orderBy('date')
                .limit(2))
        //where we capture the array of events
        let querySnap = await query.get();

        //If no more events in array, return at this point
        if (querySnap.docs.length === 0) {
            dispatch(asyncActionFinish());
            return
        }
        
        let events = [];

        //get events in docs
        //run for loop through and attach to array
        for (let i=0; i < querySnap.docs.length; i++) {
            //spread query event at that index
            //store as an array, get document id
            //store in evt variable
            let evt = {...querySnap.docs[i].data(), id:querySnap.docs[i].id};
            events.push(evt);
            //we have events in array, can add to our own reducer to display on page
        }
        //Use FetchEvents, and payload to pass
        dispatch({type: FETCH_EVENTS, payload: {events}})
        dispatch(asyncActionFinish());
        //let component know in case it needs to update UI
        return querySnap;
    } catch (error) {
        console.log(error);
        dispatch(asyncActionError());
    }
}

export const addEventComment = (eventId, values, parentId) =>
    async (dispatch, getState, {getFirebase}) => {
        const firebase = getFirebase();
        
        const profile = getState().firebase.profile;
        const user = firebase.auth().currentUser;
        let newComment = {
            parentId: parentId,
            displayName: profile.displayName,
            photoURL: profile.photoURL || '/assets/user.png',
            uid: user.uid,
            text: values.comment,
            date: Date.now()
        }

        try {
            //give location in firebase, pass comment object
            await firebase.push(`event_chat/${eventId}`, newComment);
        } catch (error) {
            console.log(error);
            toastr.error('Oops', 'Problem adding comment');
        }
    }