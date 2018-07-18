import React, { Component } from 'react';
import { Container } from 'semantic-ui-react';
import { Route, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';
import Loadingcomponent from '../../app/layout/LoadingComponent';
import {UserIsAuthenticated} from '../../features/auth/authWrapper';

//set up for code splitting to load components when we need them
const AsyncHomePage = Loadable({
  loader: () => import('../../features/home/HomePage'),
  loading: Loadingcomponent
})
const AsyncEventDashboard = Loadable({
  loader: () => import('../../features/event/EventDashboard/EventDashboard'),
  loading: Loadingcomponent
})
const AsyncNavBar = Loadable({
  loader: () => import('../../features/nav/NavBar/NavBar'),
  loading: Loadingcomponent
})
const AsyncSettingsDashboard = Loadable({
  loader: () => import('../../features/user/Settings/SettingsDashboard'),
  loading: Loadingcomponent
})
const AsyncUserDetailedPage = Loadable({
  loader: () => import('../../features/user/UserDetailed/UserDetailedPage'),
  loading: Loadingcomponent
})
const AsyncPeopleDashboard = Loadable({
  loader: () => import('../../features/user/PeopleDashboard/PeopleDashboard'),
  loading: Loadingcomponent
})
const AsyncEventDetailedPage = Loadable({
  loader: () => import('../../features/event/EventDetailed/EventDetailedPage'),
  loading: Loadingcomponent
})
const AsyncModalManager = Loadable({
  loader: () => import('../../features/modals/ModalManager'),
  loading: Loadingcomponent
})
const AsyncNotFound = Loadable({
  loader: () => import('../../app/layout/NotFound'),
  loading: Loadingcomponent
})
const AsyncEventForm = Loadable({
  loader: () => import('../../features/event/EventForm/EventForm'),
  loading: Loadingcomponent
})

class App extends Component {
  render() {
    return (
      <div>
      <AsyncModalManager />
        <Switch>
          <Route exact path='/' component={AsyncHomePage}/>
        </Switch>

        <Route 
          path="/(.+)"
          render={() => (
            <div>
              <AsyncNavBar />
              <Container className="main">
                <Switch>
                  <Route path='/events' component={AsyncEventDashboard}/>
                  <Route path='/event/:id' component={AsyncEventDetailedPage}/>
                  <Route path='/manage/:id' component={UserIsAuthenticated(AsyncEventForm)}/>
                  <Route path='/people' component={UserIsAuthenticated(AsyncPeopleDashboard)}/>
                  <Route path='/profile/:id' component={UserIsAuthenticated(AsyncUserDetailedPage)}/>
                  <Route path='/settings' component={UserIsAuthenticated(AsyncSettingsDashboard)}/>
                  <Route path='/createEvent' component={UserIsAuthenticated(AsyncEventForm)}/>
                  <Route path='/error' component={AsyncNotFound}/>
                  <Route component={AsyncNotFound}/>
                </Switch>
              </Container>
            </div>
          )}
        
        />
      </div>
    );
  }
}

export default App;