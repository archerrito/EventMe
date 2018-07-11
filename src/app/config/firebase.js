import firebase from 'firebase';
import 'firebase/firestore';

const firebaseConfig ={
    apiKey: "AIzaSyBvppl71BeCu0A1x_A9oBp-kCeCWlMvu64",
    authDomain: "eventme-209213.firebaseapp.com",
    databaseURL: "https://eventme-209213.firebaseio.com",
    projectId: "eventme-209213",
    storageBucket: "eventme-209213.appspot.com",
    messagingSenderId: "160326669368"
}

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
const settings = {
    timestampsInSnapshots: true
}

firestore.settings(settings);

export default firebase;