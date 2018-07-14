const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const newActivity = (type, event, id) => {
    return {
      type: type,
      eventDate: event.date,
      //hostedBy: event.hostedBy,
      title: event.title,
      photoURL: event.hostPhotoURL,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      hostUid: event.hostUid,
      eventId: id
    };
  };

exports.createActivity = functions.firestore
    //specify document we want, and Id ads whats created
    .document('events/{eventId}')
    //when want to create new event
    .onCreate(event => {
    let newEvent = event.data();
  
    console.log(newEvent);
    //create new activity object
    const activity = newActivity('newEvent', newEvent, event.id);
  
    console.log(activity);
  
    //add to new activity collection
    return admin
      .firestore()
      .collection('activity')
      .add(activity)
      .then(docRef => {
        return console.log('Activity created with id: ', docRef.id);
      })
      .catch(err => {
        return console.log('Error adding activity', err);
      });
  });

//not own event, cloud functions event when change or document happens, updated.
exports.cancelActivity = functions.firestore.document('events/{eventId}').onUpdate((event, context) => {
    let updatedEvent = event.after.data();
    let previousEventData = event.before.data();
    console.log({ event });
    console.log({ context });
    console.log({ updatedEvent });
    console.log({ previousEventData });
  
    if (!updatedEvent.cancelled || updatedEvent.cancelled === previousEventData.cancelled) {
      return false;
    }
    //gives access to specific 'events/{eventId}' parameter
    //have activity object with all fields
    const activity = newActivity('cancelledEvent', updatedEvent, context.params.eventId);
  
    console.log({ activity });
  
    return admin
      .firestore()
      .collection('activity')
      .add(activity)
      .then(docRef => {
        return console.log('Activity created with id: ', docRef.id);
      })
      .catch(err => {
        return console.log('Error adding activity', err);
      });
  });