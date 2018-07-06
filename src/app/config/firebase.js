import firebase from 'firebase';
import 'firebase/firestore';

const firebaseConfig ={
    apiKey: "AIzaSyBvppl71BeCu0A1x_A9oBp-kCeCWlMvu64",
    authDomain: "eventme-209213.firebaseapp.com",
    databaseURL: "https://eventme-209213.firebaseio.com",
    projectId: "eventme-209213",
    storageBucket: "",
    messagingSenderId: "160326669368"
}

firebase.initializeApp(firebaseConfig);
firebase.firestore();

export default firebase;