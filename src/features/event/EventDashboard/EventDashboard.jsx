import React, { Component } from 'react';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';
import { Grid, Loader } from 'semantic-ui-react';
import EventList from '../EventList/EventList';
import { getEventsForDashboard } from '../eventActions';
import Loadingcomponent from '../../../app/layout/LoadingComponent';
import EventActivity from'../EventActivity/EventActivity';

const query = [
  {
    collection: 'activity',
    orderBy: ['timestamp', 'desc'],
    limit: 5
  }

]

const mapState = (state) => ({
  events: state.events,
  loading: state.async.loading,
  activities: state.firestore.ordered.activity
})

const actions = {
  getEventsForDashboard
}

class EventDashboard extends Component {
  state = {
    moreEvents: false,
    loadingInitial: true,
    loadedEvents: [],
    contextRef: {}
  }

  async componentDidMount() {
    //querysnap from event actions contained in variable
    let next = await this.props.getEventsForDashboard();

    if (next && next.docs && next.docs.length > 1) {
      this.setState({
        moreEvents: true,
        loadingInitial: false
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.events !== nextProps.events) {
      this.setState({
        loadedEvents: [...this.state.loadedEvents, ...nextProps.events]
      })
    }
  }

  getNextEvents = async () => {
    const {events} = this.props;
    //get last document received
    let lastEvent = events && events[events.length -1];
    let next = await this.props.getEventsForDashboard(lastEvent);
    if (next && next.docs && next.docs.length <= 1) {
      this.setState({
        moreEvents: false
      })
    }
  }

  handleContextRef = contextRef => this.setState({contextRef})

  render() {
    const { loading, activities } = this.props;
    const {moreEvents, loadedEvents} = this.state
    if (this.state.loadingInitial) return <Loadingcomponent inverted={true}/>
    return (
      <Grid>
        <Grid.Column width={10}>
          <div ref={this.handleContextRef}>
            <EventList 
              loading={loading} 
              moreEvents={moreEvents} 
              events={loadedEvents} 
              getNextEvents={this.getNextEvents}/>
          </div>
        </Grid.Column>
        <Grid.Column width={6}>
          <EventActivity activities={activities} contextRef={this.state.contextRef}/>
        </Grid.Column>
        <Grid.Column width={10}>
          <Loader active={loading}/>
        </Grid.Column>
      </Grid>
    )
  }
}

//with actions, now have access to functions in reducer, apart of components props
export default connect(mapState, actions)(
  firestoreConnect(query)(EventDashboard)
);