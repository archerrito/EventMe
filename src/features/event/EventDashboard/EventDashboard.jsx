import React, { Component } from 'react';
import { connect } from 'react-redux';
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import { Grid, Button } from 'semantic-ui-react';
import EventList from '../EventList/EventList';
import { getEventsForDashboard } from '../eventActions';
import Loadingcomponent from '../../../app/layout/LoadingComponent';
import EventActivity from'../EventActivity/EventActivity';

const mapState = (state) => ({
  events: state.events,
  loading: state.async.loading
})

const actions = {
  getEventsForDashboard
}

class EventDashboard extends Component {
  state = {
    //
    moreEvents: false
  }

  async componentDidMount() {
    //querysnap from event actions contained in variable
    let next = await this.props.getEventsForDashboard();
    console.log(next);

    if (next && next.docs && next.docs.length > 1) {
      this.setState({
        moreEvents: true
      })
    }
  }

  getNextEvents = async () => {
    const {events} = this.props;
    //get last document received
    let lastEvent = events && events[events.length -1];
    console.log(lastEvent);
    let next = await this.props.getEventsForDashboard(lastEvent);
    console.log(next);
    if (next && next.docs && next.docs.length <= 1) {
      this.setState({
        moreEvents: false
      })
    }
  }

  handleDeleteEvent = (eventId) => () => {
    this.props.deleteEvent(eventId);
  }

  render() {
    const {events, loading} = this.props;
    if (loading) return <Loadingcomponent inverted={true}/>
    return (
      <Grid>
        <Grid.Column width={10}>
          <EventList deleteEvent={this.handleDeleteEvent} events={events} />
          <Button onClick={this.getNextEvents} disabled={!this.state.moreEvents} content='More' color='green' floated='right' />
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