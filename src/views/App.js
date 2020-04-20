import React from "react";
import { connect } from "react-redux";

import { actions } from "../actions";

import {
    ACTIVITY_PLAY,
    ACTIVITY_SELECT_LEVEL,
} from "../constants";

import Modal from "./Modal";
import Play from "./activities/Play";
import SelectLevel from "./activities/SelectLevel";

import "./App.css";

const activities = {
    [ACTIVITY_PLAY]: Play,
    [ACTIVITY_SELECT_LEVEL]: SelectLevel,
};

const App = ({
    activity,
    onShowReleaseNotes,
}) => {
    const Activity = activities[activity];
    return <div className="App">
        <div className="App-viewport">
            <header
                className="App-header"
            >
                <div>
                    <h2>Rhymines {process.env.REACT_APP_VERSION}</h2>
                    <p>- It's like Rhymurang, only more explosive!</p>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={() => onShowReleaseNotes()}
                    >
                        Release&nbsp;Notes
                    </button>
                </div>
            </header>
            <div
                className="App-body"
            >
                <Activity />
            </div>
        </div>
        <Modal />
    </div>;
}

const mapStateToProps = (state, ownProps) => ({
    activity: state.app.activity,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onShowReleaseNotes: () => dispatch(actions.ShowReleaseNotes()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
