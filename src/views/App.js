import React, { useEffect } from "react";
import { connect } from "react-redux";

import { actions } from "../actions";

import {
    ACTIVITY_PLAY,
    ACTIVITY_SELECT_LEVEL,
    APP_VERSION,
} from "../constants";

import Modal from "./Modal";
import Play from "./activities/Play";
import SelectLevel from "./activities/SelectLevel";

import "./App.css";

const activities = {
    [ACTIVITY_PLAY]: Play,
    [ACTIVITY_SELECT_LEVEL]: SelectLevel,
};

const useOnceEffect = fn => useEffect(fn, []);

const App = ({
    activity,
    onSelectWittyQuote,
    onShowAbout,
    onShowReleaseNotes,
    wittyQuote,
}) => {
    useOnceEffect(
        () => {
            onSelectWittyQuote();
        }
    );
    const Activity = activities[activity];
    return <div
        className="App"
    >
        <div className="App-viewport">
            <header
                className="App-header"
            >
                <div>
                    <h2>Rhymines {APP_VERSION}</h2>
                    <p>- {wittyQuote}</p>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={() => onShowReleaseNotes()}
                    >
                        Release&nbsp;Notes
                    </button>
                    <button
                        type="button"
                        onClick={() => onShowAbout()}
                    >
                        About
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
    wittyQuote: state.app.wittyQuote,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onSelectWittyQuote: () => dispatch(actions.SelectWittyQuote()),
    onShowAbout: () => dispatch(actions.ShowAbout()),
    onShowReleaseNotes: () => dispatch(actions.ShowReleaseNotes()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
