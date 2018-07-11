import moment from 'moment';
import cuid from 'cuid';
import { toastr } from 'react-redux-toastr'
import { firebaseStateReducer } from '../../../node_modules/react-redux-firebase';

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
            return await firestore.add({
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
      } catch (error) {
          console.log(error);
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