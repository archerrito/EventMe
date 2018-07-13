import moment from 'moment';
import cuid from 'cuid';
import { toastr } from 'react-redux-toastr';
import { FETCH_EVENTS } from '../event/eventConstants';
import { asyncActionStart, asyncActionFinish, asyncActionError } from '../async/asyncActions';
import firebase from '../../app/config/firebase';

export const updateProfile = (user) =>
  async (dispatch, getState, {getFirebase}) => {
    const firebase = getFirebase();
    const {isLoaded, isEmpty, ...updatedUser} = user;
    if (updatedUser.dateOfBirth !== getState().firebase.profile.dateOfBirth) {
      updatedUser.dateOfBirth = moment(updatedUser.dateOfBirth).toDate();
    }

    try {
      await firebase.updateProfile(updatedUser);
      toastr.success('Success', 'Profile updated')
    } catch (error) {
      console.log(error)
    }
  }

  export const uploadProfileImage =(file, fileName) =>
  async(dispatch, getState, {getFirebase, getFirestore}) => {
        const imageName = cuid();  
        const firebase = getFirebase();
      const firestore = getFirestore();
      const user = firebase.auth().currentUser;
      const path = `${user.uid}/user_images`;
      const options = {
          name: imageName
      };
      try {
          dispatch(asyncActionStart());
            //upload file to firebase storage
            let uploadFile = await firebase.uploadFile(path, file, null, options);
            //get url of image
            let downloadURL = await uploadFile.uploadTaskSnapshot.downloadURL;
            //get userdoc
            let userDoc = await firestore.get(`users/${user.uid}`);
            //check if user has photo, if not update profile with new image
            if (!userDoc.data().photoURL) {
                //update firestore documents
                await firebase.updateProfile({
                    photoURL: downloadURL
                });
                //update profile
                await user.updateProfile({
                    photoURL:downloadURL
                })
            }      
            //add new photo to photos collection
            await firestore.add({
                //specify collection, documents, subcollections
                collection: 'users',
                doc: user.uid,
                //specify array where put collection named photos
                subcollections: [{collection: 'photos'}]
            }, {
                //only fields photo will have are name and url
                name: imageName,
                url: downloadURL
            })
            dispatch(asyncActionFinish());
      } catch (error) {
          console.log(error);
          dispatch(asyncActionError());
          throw new Error('Problem uploading photo');
      }
  }

  export const deletePhoto = (photo) =>
  async (dispatch, getState, {getFirebase, getFirestore}) => {
    const firebase = getFirebase();
    const firestore = getFirestore();
    const user = firebase.auth().currentUser;
    try {
        await firebase.deleteFile(`${user.uid}/user_images/${photo.name}`);
        await firestore.delete({
            collection: 'users',
            doc: user.uid,
            subcollections: [{collection: 'photos', doc: photo.id}]
        })
    } catch (error) {
        console.log(error);
        throw new Error('Problem deleting the photo')
    }
  }

  export const setMainPhoto = photo =>
    async (dispatch, getState, {getFirebase}) => {
        const firebase = getFirebase();
        try {
            return await firebase.updateProfile({
                photoURL: photo.url
            });
        } catch (error) {
            console.log(error)
            throw new Error('Problem setting main photo');
        }
    }

    export const goingToEvent = (event) =>
        async (dispatch, getState, {getFirestore}) => {
            const firestore = getFirestore();
            const user = firestore.auth().currentUser;
            //want to get from firebase profile, 
            const photoURL = getState().firebase.profile.photoURL;
            const attendee = {
                going: true,
                joinDate: Date.now(),
                photoURL: photoURL|| '/assets/user.png',
                displayName: user.displayName,
                host: false
            }
            try {
                await firestore.update(`events/${event.id}`, {
                    //add new object to object map for this particular attendee with this user id
                    [`attendees.${user.uid}`]: attendee
                })
                //create attendee lookup collection
                await firestore.set(`event_attendee/${event.id}_${user.uid}`, {
                    //just lookup data allow queries later on
                    eventId: event.id,
                    userUid: user.uid,
                    eventDate: event.date,
                    host: false
                })
                toastr.success('Success', 'You have signed up to the event');

            } catch (error) {
                console.log(error);
                toastr.error('Oops', 'Problem signing up to event');
            }
        }

        export const cancelGoingToEvent = (event) =>
        async (dispatch, getState, {getFirestore}) => {
            const firestore = getFirestore();
            const user = firestore.auth().currentUser;

            try {
                await firestore.update(`events/${event.id}`, {
                    [`attendees.${user.uid}`]: firestore.FieldValue.delete()
                })
                await firestore.delete(`event_attendee/${event.id}_${user.uid}`);
                toastr.success('Success', 'You have removed yourself from the event');
            } catch (error) {
                console.log(error);
                toastr.error('Oops', 'Something went wrong');
            }
        }

        export const getUserEvents = (userUid, activeTab) =>
        async (dispatch, getState) => {
            dispatch(asyncActionStart());
            const firestore = firebase.firestore();
            const today = new Date(Date.now());
            //query collection of events that user is going to
            //only contains lookup fields
            let eventsRef = firestore.collection('event_attendee');
            let query;
            switch (activeTab) {
                case 1: //past events
                    query = eventsRef
                        .where('userUid', '==', userUid)
                        //less than today
                        .where('eventDate', '<=', today)
                        .orderBy('eventDate', 'desc');
                    break;
                case 2: //future events
                    query = eventsRef
                        .where('userUid', '==', userUid)
                        //more than today
                        .where('eventDate', '>=', today)
                        .orderBy('eventDate');
                        break;
                case 3: //hosted events
                    query = eventsRef
                        .where('userUid', '==', userUid)
                        //host = true
                        .where('host', '==', true)
                        .orderBy('eventDate', 'desc');
                            break;
                default:
                    query = eventsRef
                        .where('userUid', '==', userUid)
                        .orderBy('eventDate', 'desc');         
            }
            try {
                //has events user attending depending on which query activated
                let querySnap = await query.get();
                let events =[];

                for (let i = 0; i < querySnap.docs.length; i++) {
                    //query events collection, get docs, in querysnap,
                    // docs, current array index, get that data, 
                    //specifically eventID, get to retrieve event document 
                    //from firestore
                    let evt = await firestore
                        .collection('events')
                        .doc(querySnap.docs[i]
                        .data().eventId)
                        .get();
                    //pus into event array, pass in id, we have array of events
                    events.push({...evt.data(), id: evt.id})
                }

                //dispatch action so we have in event reducer
                dispatch({type: FETCH_EVENTS, payload: {events}})

                dispatch(asyncActionFinish());
            } catch (error) {
                console.log(error)
                dispatch(asyncActionError())
            }           
        };