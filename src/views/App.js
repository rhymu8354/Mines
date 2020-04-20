import React, { useEffect } from 'react';
import { connect } from "react-redux";

import logo from '../logo.svg';

import './App.css';

import { actions } from "../actions";

import {
    STAGE_WIDTH_PIXELS,
    STAGE_HEIGHT_PIXELS,
} from "../constants";

const App = ({
    onInitialLoad,
}) => {
    useEffect(() => onInitialLoad(), []);
    return <div className="App">
        <div
            className="App-stage"
            id="stage"
            style={{
                width: STAGE_WIDTH_PIXELS,
                height: STAGE_HEIGHT_PIXELS,
            }}
        />
        <div className="App-controls">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
                Edit <code>src/App.js</code> and save to reload.
            </p>
            <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
            >
                Learn React
            </a>
        </div>
    </div>;
}

const mapStateToProps = (state, ownProps) => ({
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onInitialLoad: () => dispatch(actions.Load()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
