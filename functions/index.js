const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const newActivity = (type, event, id) => {
  return {
    type: type,
    eventDate: event.date,
    hostedBy: event.hostedBy,
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

  exports.userFollowing = functions.firestore
  // track followerUid, person clicked button
  .document('users/{followerUid}/following/{followingUid}')
  //triggers new document, event and context give us params
  .onCreate((event, context) => {
    console.log('v1');
    const followerUid = context.params.followerUid;
    const followingUid = context.params.followingUid;

    const followerDoc = admin
      .firestore()
      .collection('users')
      //personal user's id
      .doc(followerUid);

    console.log(followerDoc);

    //get current users document to put into followers collection of user we are following
    return followerDoc.get().then(doc => {
      let userData = doc.data();
      console.log({ userData });
      let follower = {
        displayName: userData.displayName,
        photoURL: userData.photoURL || '/assets/user.png',
        city: userData.city || 'unknown city'
      };
      //add to firestore
      return admin
        .firestore()
        .collection('users')
        //user we're following id
        .doc(followingUid)
        //in followed user collection, add follower id
        .collection('followers')
        .doc(followerUid)
        .set(follower);
    });
  });

  exports.unfollowUser = functions.firestore
  .document('users/{followerUid}/following/{followingUid}')
  //tracks delete event for location above with follower uid that is following uid 
  //when stops following, delete latter
  .onDelete((event, context) => {
    return admin
      .firestore()
      .collection('users')
      //want to delete this particular document from users collection
      .doc(context.params.followingUid)
      .collection('followers')
      //delete from other users collection as well
      .doc(context.params.followerUid)
      .delete()
      .then(() => {
        return console.log('doc deleted');
      })
      .catch(err => {
        return console.log(err);
      });
  });