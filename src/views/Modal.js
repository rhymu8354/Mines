import React from "react";
import { connect } from "react-redux";

import {
    MODAL_RELEASE_NOTES,
} from "../constants";

import {
    ReleaseNotes,
} from "./modals";

import "./Modal.css";

const modals = {
    [MODAL_RELEASE_NOTES]: ReleaseNotes,
};

const Modal = ({
    stack,
}) => {
    if (stack.length === 0) {
        return null;
    }
    const modal = stack[stack.length - 1];
    const which = modal.which;
    const SelectedModal = modals[which];
    return (
        SelectedModal
        ? (
            <>
                <div className="modal-overlay" />
                <div className="modal-box">
                    <SelectedModal args={modal.args} />
                </div>
            </>
        )
        : null
    );
};

const mapStateToProps = (state, ownProps) => ({
    stack: state.modal.stack,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Modal);
