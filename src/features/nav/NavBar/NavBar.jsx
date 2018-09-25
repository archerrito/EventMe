import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withFirebase } from 'react-redux-firebase';
import { Menu, Container } from 'semantic-ui-react';
import { NavLink, Link, withRouter } from 'react-router-dom';
import StrategyMenu from '../Menus/StrategyMenu';
import CalendarMenu from '../Menus/CalendarMenu';
import SignedInMenu from '../Menus/SignedInMenu';
import { openModal } from '../../modals/modalActions';

const actions = {
    openModal,
}

const mapState = (state) => ({
    auth: state.firebase.auth,
    profile: state.firebase.profile
})

class NavBar extends Component {

    handleSignIn = () => {
        this.props.openModal('LoginModal');
    }

    handleRegister = () => {
        this.props.openModal('RegisterModal');
    }

    handleSignOut = () => {
        this.props.firebase.logout();
        this.props.history.push('/');
    }

    render() {
        const { auth, profile } = this.props;
        //check to see if authenticated, if empty, means no credentials in firebase
        const authenticated = auth.isLoaded && !auth.isEmpty;
        return (
            <Menu inverted fixed="top">
                <Container>
                    <Menu.Item as={Link} to='/' header>
                        <img src="/assets/logo.png" alt="logo" />
                    Traction Hound
                    </Menu.Item>
                    
                    <StrategyMenu /> 
                    <CalendarMenu />  
                    <Menu.Item as={NavLink} to='/initiatives' name="Initiatives" />
                    <Menu.Item as={NavLink} to='/tasks' name=" My Tasks" />
                    <Menu.Item as={NavLink} to='/reporting' name="Reporting" />
                    <Menu.Item as={NavLink} to='/university' name="University" />
                    <SignedInMenu 
                            auth={auth} 
                            profile={profile} 
                            signOut={this.handleSignOut} 
                        /> 
                </Container>
            </Menu>
        );
    }
}

export default withRouter(withFirebase(connect(mapState, actions)(NavBar)));