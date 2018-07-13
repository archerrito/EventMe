import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withFirestore, firebaseConnect, isEmpty } from 'react-redux-firebase';
import { compose } from 'redux';
import { Grid } from 'semantic-ui-react';
import EventDetailedHeader from './EventDetailedHeader';
import EventDetailedInfo from './EventDetailedInfo';
import EventDetailedChat from './EventDetailedChat';
import EventDetailedSidebar from './EventDetailedSidebar';
import { objectToArray } from '../../../app/common/util/helpers';
import { goingToEvent, cancelGoingToEvent } from '../../user/userActions';
import { addEventComment } from '../eventActions';

const mapState = (state, ownProps) => {

  let event = {};

  if (state.firestore.ordered.events && state.firestore.ordered.events[0]) {
    event = state.firestore.ordered.events[0];
  }

  return {
    event,
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
  addEventComment
}

class EventDetailedPage extends Component {

  async componentDidMount() {
    const {firestore, match} = this.props;
    await firestore.setListener(`events/${match.params.id}`);
  }

  async componentWillUnmount() {
    const {firestore, match} = this.props;
    await firestore.unsetListener(`events/${match.params.id}`)
  }

  render() {
    const {event, auth, goingToEvent, cancelGoingToEvent, addEventComment, eventChat} = this.props;
    const attendees = event && event.attendees && objectToArray(event.attendees);
    const isHost = event.hostUid === auth.uid;
    //returns true/false, some tests is one object in array returns true
    //if attendee is equal to auth id
    const isGoing = attendees && attendees.some(a => a.id === auth.uid);
    return (
      <Grid>
      <Grid.Column width={10}>
        <EventDetailedHeader 
          event = {event} 
          isHost={isHost} 
          isGoing={isGoing} 
          goingToEvent={goingToEvent}
          cancelGoingToEvent={cancelGoingToEvent}/>
        <EventDetailedInfo event={event}/>
        <EventDetailedChat eventChat={eventChat} addEventComment={addEventComment} eventId={event.id}/>
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
  firebaseConnect((props) => ([`event_chat/${props.match.params.id}`]))
)(EventDetailedPage);