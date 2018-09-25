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



////
const AsyncGoalsPage = Loadable({
  loader: () => import('../../features/home/HomePage'),
  loading: Loadingcomponent
})
const AsyncAdministrativePage = Loadable({
  loader: () => import('../../features/event/EventDashboard/EventDashboard'),
  loading: Loadingcomponent
})
const AsyncAnalyticsPage = Loadable({
  loader: () => import('../../features/nav/NavBar/NavBar'),
  loading: Loadingcomponent
})
const AsyncMatrixPage = Loadable({
  loader: () => import('../../features/nav/NavBar/NavBar'),
  loading: Loadingcomponent
})
const AsyncPersonasPage = Loadable({
  loader: () => import('../../features/user/Settings/SettingsDashboard'),
  loading: Loadingcomponent
})
const AsyncCompetitorsPage = Loadable({
  loader: () => import('../../features/user/UserDetailed/UserDetailedPage'),
  loading: Loadingcomponent
})
const AsyncContentPage = Loadable({
  loader: () => import('../../features/user/PeopleDashboard/PeopleDashboard'),
  loading: Loadingcomponent
})
const AsyncHiringPage = Loadable({
  loader: () => import('../../features/event/EventDetailed/EventDetailedPage'),
  loading: Loadingcomponent
})
const AsyncScoreCardPage = Loadable({
  loader: () => import('../../features/modals/ModalManager'),
  loading: Loadingcomponent
})
const AsyncTrainingPage = Loadable({
  loader: () => import('../../app/layout/NotFound'),
  loading: Loadingcomponent
})
const AsyncCertificationPage = Loadable({
  loader: () => import('../../features/event/EventForm/EventForm'),
  loading: Loadingcomponent
})
const AsyncCoachingPage = Loadable({
  loader: () => import('../../features/event/EventDashboard/EventDashboard'),
  loading: Loadingcomponent
})
const AsyncCompensationPage = Loadable({
  loader: () => import('../../features/nav/NavBar/NavBar'),
  loading: Loadingcomponent
})
const AsyncMetricsPage = Loadable({
  loader: () => import('../../features/user/Settings/SettingsDashboard'),
  loading: Loadingcomponent
})
const AsyncCalendarPage = Loadable({
  loader: () => import('../../features/user/UserDetailed/UserDetailedPage'),
  loading: Loadingcomponent
})
const AsyncMeetingsPage = Loadable({
  loader: () => import('../../features/user/PeopleDashboard/PeopleDashboard'),
  loading: Loadingcomponent
})
const AsyncTasksPage = Loadable({
  loader: () => import('../../features/event/EventDetailed/EventDetailedPage'),
  loading: Loadingcomponent
})
const AsyncAttributionPage = Loadable({
  loader: () => import('../../features/modals/ModalManager'),
  loading: Loadingcomponent
})
const AsyncUniversityPage = Loadable({
  loader: () => import('../../app/layout/NotFound'),
  loading: Loadingcomponent
})
const AsyncInitiativesPage = Loadable({
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

                  <Route path='/goals' component={AsyncGoalsPage}/>
                  <Route path='/administrative' component={AsyncAdministrativePage}/>
                  <Route path='/matrix' component={AsyncMatrixPage}/>
                  <Route path='/analytics' component={AsyncAnalyticsPage}/>
                  <Route path='/personas' component={AsyncPersonasPage}/>
                  <Route path='/competitors' component={AsyncCompetitorsPage}/>
                  <Route path='/content' component={AsyncContentPage}/>
                  <Route path='/hiring' component={AsyncHiringPage}/>
                  <Route path='/scorecard' component={AsyncScoreCardPage}/>
                  <Route path='/training' component={AsyncTrainingPage}/>
                  <Route path='/certification' component={AsyncCertificationPage}/>
                  <Route path='/coaching' component={AsyncCoachingPage}/>
                  <Route path='/compensation' component={AsyncCompensationPage}/>
                  <Route path='/metrics' component={AsyncMetricsPage}/>
                  <Route path='/calendar' component={AsyncCalendarPage}/>
                  <Route path='/meetings' component={AsyncMeetingsPage}/>
                  <Route path='/initiatives' component={AsyncInitiativesPage}/>
                  <Route path='/tasks' component={AsyncTasksPage}/>
                  <Route path='/attribution' component={AsyncAttributionPage}/>
                  <Route path='/university' component={AsyncUniversityPage}/>
                  <Route path='/settings' component={UserIsAuthenticated(AsyncSettingsDashboard)}/>                  
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