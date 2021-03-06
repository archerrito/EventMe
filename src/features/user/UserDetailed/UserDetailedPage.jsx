import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';
import { toastr } from 'react-redux-toastr';
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
import { getUserEvents, followUser, unfollowUser } from '../userActions';

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
    events: state.events,
    eventsLoading: state.async.loading,
    auth: state.firebase.auth,
    photos: state.firestore.ordered.photos,
    //know when page is loading
    requesting: state.firestore.status.requesting,
    //could be empty or full depending on if following user
    following: state.firestore.ordered.following
  }
};

const actions = {
  getUserEvents, 
  followUser,
  unfollowUser
}

class UserDetailedPage extends Component {

  async componentDidMount() {
    //checking if user exists to display not found page
    let user = await this.props.firestore.get(`users/${this.props.match.params.id}`);
    if (!user.exists) {
      toastr.error('Not found', 'This is not the user you are looking for');
      this.props.history.push('/error');
    }
    //have access to from userUid props
    let events = await this.props.getUserEvents(this.props.userUid);
    console.log(events);
  }

  changeTab = (e, data) => {
    this.props.getUserEvents(this.props.userUid, data.activeIndex)
  }
  render() {
    const {profile, photos, auth, match, requesting,
       events, eventsLoading, followUser, following, unfollowUser} = this.props;
    const isCurrentUser = auth.uid === match.params.id;
    //check to see if any objects inside are set to true
    const loading = requesting[`users/${match.params.id}`];
    const isFollowing = !isEmpty(following);

    if (loading) return <LoadingComponent inverted={true}/>

    return (
      <Grid>
        <UserDetailedHeader profile={profile}/>
        <UserDetailedDescription profile={profile}/>
        <UserDetailedSidebar 
          isFollowing={isFollowing}
          profile={profile} 
          followUser={followUser} 
          unfollowUser={unfollowUser}
          isCurrentUser={isCurrentUser}/>
        {photos && photos.length > 0 &&
        <UserDetailedPhotos photos={photos}/>}
        <UserDetailedEvents events={events} eventsLoading={eventsLoading} changeTab={this.changeTab}/>
      </Grid>
    );
  }
}

export default compose(
  connect(mapState, actions),
  //match prop used for whether following user
  firestoreConnect((auth, userUid, match) => userDetailedQuery(auth, userUid, match)),
)(UserDetailedPage);