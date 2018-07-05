import React from 'react'
import  { connect } from 'react-redux';
import TestModal from './TestModal';
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'

const modalLookup = {
    TestModal,
    LoginModal,
    RegisterModal
}

const mapState = (state) => ({
    //in case modal opened, call modal reducer, populates modal type in ur store
    currentModal: state.modals
})

const ModalManager = ({currentModal}) => {
  //decide which modal to open inside our component
    let renderedModal;
    //have modal in our props
    if (currentModal) {
        const { modalType, modalProps } = currentModal;
        const ModalComponent = modalLookup[modalType];

        renderedModal = <ModalComponent {...modalProps} />
    }

    return <span>{renderedModal}</span>
}

//mapstate gives access to current modal inside our component
export default connect(mapState)(ModalManager);
