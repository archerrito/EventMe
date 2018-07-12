import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { firestoreConnect, isEmpty } from 'react-redux-firebase';
import { compose } from 'redux'
import UserDetailedHeader from './UserDetailedHeader'
import UserDetailedDescription from './UserDetailedDescription'
import UserDetailedPhotos from './UserDetailedPhotos'
import UserDetailedSidebar from './UserDetailedSidebar'
import UserDetailedEvents from './UserDetailedEvents'
import { userDetailedQuery } from '../userQueries';
import LoadingComponent from '../../../app/layout/LoadingComponent';

//ownProps gives access to params set in URL
const mapState = (state, ownProps) => {
  let userUid = null;
  let profile = {};

  if (ownProps.match.params.id === state.auth.uid) {
    profile = state.firebase.profile
  } else {
    //set profile going to store in firestore
    //if not empty set profile to what we retrieve, only do that if user
    //id we fish out of url not equal to auth current user id
    profile = !isEmpty(state.firestore.ordered.profile) && state.firestore.ordered.profile[0];
    userUid = ownProps.match.params.id;
  }
  return {
    profile,
    userUid,
    auth: state.firebase.auth,
    photos: state.firestore.ordered.photos,
    //know when page is loading
    requesting: state.firestore.status.requesting
  }
};

class UserDetailedPage extends Component {
  render() {
    const {profile, photos, auth, match, requesting} = this.props;
    const isCurrentUser = auth.uid === match.params.id;
    //check to see if any objects inside are set to true
    const loading = Object.values(requesting).some(a => a=== true)
    
    if (loading) return <LoadingComponent inverted={true}/>

    return (
      <Grid>
        <UserDetailedHeader profile={profile}/>
        <UserDetailedDescription profile={profile}/>
        <UserDetailedSidebar isCurrentUser={isCurrentUser}/>
        {photos && photos.length > 0 &&
        <UserDetailedPhotos photos={photos}/>}
        <UserDetailedEvents/>
      </Grid>
    );
  }
}

export default compose(
  connect(mapState),
  firestoreConnect((auth, userUid) => userDetailedQuery(auth, userUid)),
)(UserDetailedPage);