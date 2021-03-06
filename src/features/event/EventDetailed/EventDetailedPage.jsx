import React, { Component } from 'react'
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { withFirestore, firebaseConnect, isEmpty } from 'react-redux-firebase';
import { compose } from 'redux';
import { Grid } from 'semantic-ui-react';
import EventDetailedHeader from './EventDetailedHeader';
import EventDetailedInfo from './EventDetailedInfo';
import EventDetailedChat from './EventDetailedChat';
import EventDetailedSidebar from './EventDetailedSidebar';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { objectToArray, createDataTree } from '../../../app/common/util/helpers';
import { goingToEvent, cancelGoingToEvent } from '../../user/userActions';
import { addEventComment } from '../eventActions';
import { openModal } from '../../modals/modalActions';

const mapState = (state, ownProps) => {

  let event = {};

  if (state.firestore.ordered.events && state.firestore.ordered.events[0]) {
    event = state.firestore.ordered.events[0];
  }

  return {
    requesting: state.firestore.status.requesting,
    event,
    loading: state.async.loading,
    //have access to authenticaiton cause don't render application until we do
    auth: state.firebase.auth,
    eventChat: 
      //check to see if data is available
      !isEmpty(state.firebase.data.event_chat) && 
      //take event chat in firebase event chat, select matching id of event id
      objectToArray(state.firebase.data.event_chat[ownProps.match.params.id])
  }
}

const actions= {
  goingToEvent,
  cancelGoingToEvent,
  addEventComment,
  openModal
}

class EventDetailedPage extends Component {

  state = {
    initialLoading: true
  }

  async componentDidMount() {
    const {firestore, match} = this.props;
    //check if in existence to display 404
    let event = await firestore.get(`events/${match.params.id}`);
    if (!event.exists) {
      toastr.error('Not found', 'This is not the event your are looking for');
      this.props.history.push('/error');
    }
    await firestore.setListener(`events/${match.params.id}`);
    this.setState({
      initialLoading: false
    })
  }

  async componentWillUnmount() {
    const {firestore, match} = this.props;
    await firestore.unsetListener(`events/${match.params.id}`)
  }

  render() {
    const { 
      openModal, 
      loading, 
      event, auth, 
      goingToEvent, 
      cancelGoingToEvent, 
      addEventComment, 
      eventChat,
      requesting,
      match
    } = this.props;

    const attendees = event && event.attendees && objectToArray(event.attendees).sort(function(a, b) {
      return a.joinDate - b.joinDate;
    });
    const isHost = event.hostUid === auth.uid;
    //returns true/false, some tests is one object in array returns true
    //if attendee is equal to auth id
    const isGoing = attendees && attendees.some(a => a.id === auth.uid);
    const chatTree = !isEmpty(eventChat) && createDataTree(eventChat);
    const authenticated = auth.isLoaded && !auth.isEmpty;
    const loadingEvent = requesting[`events/${match.params.id}`];

    //improved loading experience for event detailed page
    if (loadingEvent || this.state.initialLoading) return <LoadingComponent inverted={true}/>

    return (
      <Grid>
      <Grid.Column width={10}>
        <EventDetailedHeader
        loading={loading} 
          event = {event} 
          isHost={isHost} 
          isGoing={isGoing} 
          goingToEvent={goingToEvent}
          cancelGoingToEvent={cancelGoingToEvent}
          authenticated={authenticated}
          openModal={openModal}
          />
        <EventDetailedInfo event={event}/>
        {authenticated &&
        <EventDetailedChat 
          eventChat={chatTree} 
          addEventComment={addEventComment} 
          eventId={event.id}
          />
        }
      </Grid.Column>
      <Grid.Column width={5}>
        <EventDetailedSidebar attendees={attendees}/>
      </Grid.Column>
    </Grid>
    )
  }
}

export default compose(
  withFirestore,
  connect(mapState, actions),
  //checks auth status before checking firebase
  firebaseConnect(props => props.auth.isLoaded && 
  !props.auth.isEmpty && [`event_chat/${props.match.params.id}`])
)(EventDetailedPage);