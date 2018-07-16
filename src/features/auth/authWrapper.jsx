import { connectedReduxRedirect} from 'redux-auth-wrapper/history4/redirect';
import { openModal } from '../modals/modalActions';

export const UserIsAuthenticated = connectedReduxRedirect({
    //give displsyname
    wrapperDisplayName: 'UserIsAuthenticated',
    allowRedirectBack: true,
    redirectPath: '/events',
    //use to decide if user authenticated or not
    //connected to redux store
    authenticatedSelector: ({firebase: {auth}}) =>
        auth.isLoaded && !auth.isEmpty,
    redirectAction: newLoc => (dispatch) => {
        dispatch(openModal('UnauthModal'))
    }
})