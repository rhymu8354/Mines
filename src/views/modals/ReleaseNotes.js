import React from "react";
import { connect } from "react-redux";

import { actions } from "../../actions";

import SafeHyperlink from "../SafeHyperlink";

import "./ReleaseNotes.css";

const content = [
    {
        version: "0.6.0 - 2020-04-20",
        notes: <ul>
            <li>Added ability to mark places where player believes there are mines</li>
            <li>Detect win condition</li>
            <li>Upon losing, show where markers are wrong.</li>
        </ul>,
    },
    {
        version: "0.5.0 - 2020-04-20",
        notes: <ul>
            <li>Mines now explode (<em>Game Over man, <strong>GAME OVER!</strong></em>)</li>
            <li>Add <code>RETRY</code> button to restart the game.</li>
            <li>Fix issues with game grid not resetting for the next game.</li>
        </ul>,
    },
    {
        version: "0.4.0 - 2020-04-20",
        notes: <ul>
            <li>Added mines (<em>they explode but you don't yet lose the game</em>).</li>
            <li>Added neighbor mine counters.</li>
            <li>Added revealing of open areas.</li>
            <li>Added many bugs to be fixed later. Kappa</li>
        </ul>,
    },
    {
        version: "0.3.1 - 2020-04-20",
        notes: <ul>
            <li>Fixed bug in initial tile sizing/scaling.</li>
            <li>Fixed app title.</li>
        </ul>,
    },
    {
        version: "0.3.0 - 2020-04-20",
        notes: <ul>
            <li>Made the stage scale up with window size.</li>
        </ul>,
    },
    {
        version: "0.2.0 - 2020-04-20",
        notes: <ul>
            <li>Added basic application structure.</li>
            <li>Added release notes modal.</li>
            <li>Added clickable cells (<em>no bombs yet!</em>).</li>
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
