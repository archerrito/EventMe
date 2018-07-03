import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Button } from 'semantic-ui-react';
import cuid from 'cuid';
import EventList from '../EventList/EventList';
import EventForm from '../EventForm/EventForm';
import { createEvent, deleteEvent, updateEvent } from '../eventActions';


const mapState = (state) => ({
  events: state.events
})

const actions = {
  createEvent,
  deleteEvent,
  updateEvent
}

class EventDashboard extends Component {
  state = {
    isOpen: false,
    selectedEvent: null
  }


  handleFormOpen = () => {
    this.setState({
      selectedEvent: null,
      isOpen:true
    });
  };

  handleCancel = () => {
    this.setState({
      isOpen:false
    });
  };

  handleUpdateEvent = (updatedEvent) => {
    this.props.updateEvent(updatedEvent);
    this.setState({
      // events: this.state.events.map(event => {
      //   if (event.id === updatedEvent.id) {
      //     //clones object, takes updated event, copies into empty object
      //     //assigns to what we're replacing it with. Not mutating state
      //     return Object.assign({}, updatedEvent);
      //   } else {
      //     return event;
      //   }
      // }),
      //replaced with call to eventReducer above

      isOpen: false,
      selectedEvent: null
    })
  }

  handleOpenEvent = (eventToOpen) => () => {
    this.setState({
      selectedEvent: eventToOpen,
      isOpen: true
    });
  };

  //need to pass this method down to eventForm in render
  handleCreateEvent = (newEvent) => {
    //cuid in package.json to generate id.
    newEvent.id = cuid();
    newEvent.hostPhotoURL = '/assets/user.png';
    //take events in our state, then add new event
    // const updatedEvents = [...this.state.events, newEvent];
    this.props.createEvent(newEvent);
    this.setState({
      // events: updatedEvents,
      isOpen: false
    })
  }

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
    const {selectedEvent} = this.state;
    const {events} = this.props;
    return (
      <Grid>
        <Grid.Column width={10}>
          <EventList deleteEvent={this.handleDeleteEvent} onEventOpen={this.handleOpenEvent} events={events} />
        </Grid.Column>
        <Grid.Column width={6}>
        </Grid.Column>
      </Grid>
    )
  }
}

//with actions, now have access to functions in reducer, apart of components props
export default connect(mapState, actions)(EventDashboard);