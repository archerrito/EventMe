import moment from 'moment'

export const createNewEvent = (user, photoURL, event) => {
    event.date = moment(event.date).toDate();

    //Return how we want event stored in firestore
    return {
        ...event,
        hostUid: user.uid,
        hostPhotoURL: user.displayName || '/assets/user/png',
        createdAt: Date.now(),
        attendees: {
            [user.uid]: {
                going: true,
                joinDate: Date.now(),
                photoURL: photoURL ||'/assets/user.png',
                displayName: user.displayName,
                host: true
            }
        }
    }
}