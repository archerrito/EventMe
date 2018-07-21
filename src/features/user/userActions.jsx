import moment from 'moment';
import cuid from 'cuid';
import { toastr } from 'react-redux-toastr';
import { FETCH_EVENTS } from '../event/eventConstants';
import { asyncActionStart, asyncActionFinish, asyncActionError } from '../async/asyncActions';
import firebase from '../../app/config/firebase';

export const updateProfile = (user) => 
    async (dispatch, getState, { getFirebase, getFirestore }) => {
        const firebase = getFirebase();
        const firestore = getFirestore();
        const currentUser = firebase.auth().currentUser;
        const currentUserCreationDate = firestore.auth().currentUser.metadata.creationTime;

        const { isLoaded, isEmpty, ...updatedUser } = user;
        if (updatedUser.dateOfBirth !== getState().firebase.profile.dateOfBirth) {
        updatedUser.dateOfBirth = moment(updatedUser.dateOfBirth).toDate();
        }

        try {       
        await firestore.set(`users/${currentUser.uid}`, {createdAt: currentUserCreationDate, ...updatedUser})     
        await firebase.updateProfile(updatedUser);
        toastr.success('Success', 'Profile updated');
        } catch (error) {
        console.log(error);
        }
  };

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

  export const setMainPhoto = photo => async (dispatch, getState) => {
    dispatch(asyncActionStart())
    const firestore = firebase.firestore();
    const user = firebase.auth().currentUser;
    const today = new Date(Date.now());
    let userDocRef = firestore.collection('users').doc(user.uid);
    let eventAttendeeRef = firestore.collection('event_attendee');
    //set batch to commit to firestore
    //used to update data over time, 
    //photos from user account on 
    try {
      let batch = firestore.batch();
  
      await batch.update(userDocRef, {
        photoURL: photo.url
      });
    //update events user is attending and hosting  
      let eventQuery = await eventAttendeeRef.where('userUid', '==', user.uid).where('eventDate', '>', today);
    //gives querysnapshot of documents with where clauses
    //can loop over query, add updates we want to apply to our batch
      let eventQuerySnap = await eventQuery.get();
  
      for (let i=0; i<eventQuerySnap.docs.length; i++) {
        //gets the particular document reference
        let eventDocRef = await firestore.collection('events').doc(eventQuerySnap.docs[i].data().eventId)
        //check if user is hosting
        let event = await eventDocRef.get();
        if (event.data().hostUid === user.uid) {
          batch.update(eventDocRef, {
            hostPhotoURL: photo.url,
            [`attendees.${user.uid}.photoURL`]: photo.url
          })
        } else {
        //contains all updates need to apply when we set main photo
          batch.update(eventDocRef, {
            [`attendees.${user.uid}.photoURL`]: photo.url
          })
        }
      }
      console.log(batch);
      await batch.commit();
      dispatch(asyncActionFinish())
    } catch (error) {
      console.log(error);
      //sets loading flag to off so user doesn't see loading indicator
      dispatch(asyncActionError())
      throw new Error('Problem setting main photo');
    }
  };

    export const goingToEvent = (event) =>
        async (dispatch, getState) => {
            dispatch(asyncActionStart());
            const firestore = firebase.firestore();
            const user = firebase.auth().currentUser;
            //want to get from firebase profile, 
            const profile = getState().firebase.profile;
            console.log(profile);
            const attendee = {
                going: true,
                joinDate: Date.now(),
                photoURL: profile.avatarUrl || '/assets/user.png',
                displayName: profile.displayName,
                host: false
            }
            try {
                //Create two references
                let eventDocRef = firestore.collection('events').doc(event.id);
                //creating new attendee document
                let eventAttendeeDocRef = firestore.collection('event_attendee').doc(`${event.id}_${user.uid}`);

                //monitor changes, transaction will be re-run
                await firestore.runTransaction(async (transaction) => {
                await transaction.get(eventDocRef);
                await transaction.update(eventDocRef, {
                    [`attendees.${user.uid}`]: attendee
                })
                await transaction.set(eventAttendeeDocRef, {
                    eventId: event.id,
                    userUid: user.uid,
                    eventDate: event.date,
                    host: false
                })
                })
                dispatch(asyncActionFinish())
                toastr.success('Success', 'You have signed up to the event');
            } catch (error) {
                console.log(error);
                dispatch(asyncActionError())
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

        export const followUser = userToFollow => async (dispatch, getState, {getFirestore}) => {
            //get firestore and user
            const firestore = getFirestore();
            const user = firestore.auth().currentUser;
            //following object inside our collection
            const following = {
              photoURL: userToFollow.avatarUrl || '/assets/user.png',
              city: userToFollow.city || 'unknown city',
              displayName: userToFollow.displayName
            }
            try {
                //use firestore set because we know firestore id of document we will be creating
              await firestore.set(
                {
                    //keep inside users collection
                  collection: 'users',
                  doc: user.uid,
                  //keep usertofollow id in subcollection called following
                  subcollections: [{collection: 'following', doc: userToFollow.id}]
                },
                //add object, which will get created
                following
              );
              toastr.success('Success', 'User successfully followed');
            } catch (error) {
              console.log(error);
            }
          }

            //take profile of user seeking to unfollow
          export const unfollowUser  = (userToUnfollow) =>
          //setup for firestore and user variables.
          async (dispatch, getState, {getFirestore}) => {
            const firestore = getFirestore();
            const user = firestore.auth().currentUser;
            try {
              await firestore.delete({
                  //delete from users collection
                collection: 'users',
                //from user.uid
                doc: user.uid,
                //in following colleciton, match what was sent in
                subcollections: [{collection: 'following', doc: userToUnfollow.id}]
              });
              toastr.success('Success', 'Successfully unfollowed user');
            } catch (error) {
              console.log(error)
            }
          }