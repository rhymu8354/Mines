import React from "react";
import { connect } from "react-redux";

import { actions } from "../../actions";

import SafeHyperlink from "../SafeHyperlink";

import "./ReleaseNotes.css";

const content = [
    {
        version: "0.3.1 - 2020-04-20",
        notes: <ul>
            <li>Fixed bug in initial tile sizing/scaling</li>
            <li>Fixed app title</li>
        </ul>,
    },
    {
        version: "0.3.0 - 2020-04-20",
        notes: <ul>
            <li>Made the stage scale up with window size</li>
        </ul>,
    },
    {
        version: "0.2.0 - 2020-04-20",
        notes: <ul>
            <li>Added basic application structure</li>
            <li>Added release notes modal</li>
            <li>Added clickable cells (<em>no bombs yet!</em>)</li>
        </ul>,
    },
    {
        version: "0.1.0 - 2020-04-20",
        notes: <ul>
            <li>
                Initial deployment; basically just the result of
                running <SafeHyperlink href="https://reactjs.org/docs/create-a-new-react-app.html">create-react-app</SafeHyperlink> and
                adding <SafeHyperlink href="https://redux.js.org/">Redux</SafeHyperlink> and <SafeHyperlink href="http://phaser.io/">Phaser</SafeHyperlink>.
            </li>
        </ul>,
    },
];

const ReleaseNotes = ({
    onDismiss,
}) => {
    return <div className="ReleaseNotes-container">
        <div>
            <h2>Release Notes</h2>
            <hr />
        </div>
        <div className="shrinking-container">
            {content.map(section => <>
                <h3>{section.version}</h3>
                {section.notes}
            </>)}
        </div>
        <div className="horizontally-centered-row">
            <button
                type="button"
                onClick={() => onDismiss()}
            >
                Dismiss
            </button>
        </div>
    </div>;
};

const mapStateToProps = (state, ownProps) => ({
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onDismiss: () => dispatch(actions.PopModal()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ReleaseNotes);
