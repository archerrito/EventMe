import React, { Component } from 'react';
import { connect } from 'react-redux';
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import { Grid } from 'semantic-ui-react';
import EventList from '../EventList/EventList';
import { deleteEvent } from '../eventActions';
import Loadingcomponent from '../../../app/layout/LoadingComponent';
import EventActivity from'../EventActivity/EventActivity';

const mapState = (state) => ({
  events: state.firestore.ordered.events,
})

const actions = {
  deleteEvent
}

class EventDashboard extends Component {

  handleDeleteEvent = (eventId) => () => {
    //pass in id, not equal to event id, return new array of all events that do not match id
    // const updatedEvents = this.state.events.filter(e => e.id !== eventId);
    // this.setState({
    //   events: updatedEvents
    //)}
    //replaced with 
    this.props.deleteEvent(eventId);

  }

  render() {
    const {events} = this.props;
    if (!isLoaded(events) || isEmpty(events)) return <Loadingcomponent inverted={true}/>
    return (
      <Grid>
        <Grid.Column width={10}>
          <EventList deleteEvent={this.handleDeleteEvent} events={events} />
        </Grid.Column>
        <Grid.Column width={6}>
          <EventActivity />
        </Grid.Column>
      </Grid>
    )
  }
}

//with actions, now have access to functions in reducer, apart of components props
export default connect(mapState, actions)(
  firestoreConnect([{collection:'events'}])(EventDashboard)
);