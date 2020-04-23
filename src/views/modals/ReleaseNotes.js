import React from "react";
import { connect } from "react-redux";

import { actions } from "../../actions";

import SafeHyperlink from "../SafeHyperlink";

import "./ReleaseNotes.css";

const content = [
    {
        version: "0.13.0 - 2020-04-23",
        notes: <ul>
            <li>Added grid shake and sound effect on detonations.</li>
        </ul>,
    },
    {
        version: "0.12.0 - 2020-04-23",
        notes: <ul>
            <li>Added optional tinting of uncovered cells.</li>
            <li>Added <code>ABOUT</code> button and information.</li>
        </ul>,
    },
    {
        version: "0.11.1 - 2020-04-23",
        notes: <ul>
            <li>Corrected the date of the 0.11.0 release.  Oops!</li>
        </ul>,
    },
    {
        version: "0.11.0 - 2020-04-22",
        notes: <ul>
            <li>Fixed bugs in mouse up/down in mini-map.</li>
            <li>
                Improved performance in mine reveal on game loss
                for large grids.
            </li>
            <li>
                The power ability buttons are now disabled when
                the game is over.
            </li>
            <li>
                When zooming in/out with the mouse wheel over the grid,
                the mouse position governs the zoom point.
            </li>
            <li>The <code>RETRY</code> button is now always available.</li>
        </ul>,
    },
    {
        version: "0.10.0 - 2020-04-22",
        notes: <ul>
            <li>
                Added four new difficulty levels, with larger grids and
                special features!
                <ul>
                    <li>
                        Powerful fragments of elite roBOTic warriors from
                        a distant LAND are scattered throughout the grid.
                        Uncovering and clicking on them will give
                        you <span className="power-text">POWER</span>!
                        Gather this power for use in a tight spot:
                    </li>
                    <ul>
                        <li>
                            <span style={{color: "goldenrod"}}>Probe</span>: Scan
                            a 5x5 area for mines.  (<em>Careful!</em>  Mines are revealed,
                            but they remain <span style={{color: "red"}}>live</span>; <em>Do not touch!</em>)
                        </li>
                        <li>
                            <span style={{color: "red"}}>Detonator</span>: Blow
                            up all mines in 5x5 area.  This can result in
                            chain-reactions, revealing large areas of the grid.
                            Neat!
                        </li>
                    </ul>
                </ul>
            </li>
            <li>
                Actions are now performed on <em>mouse up</em>,
                not <em>mouse down</em>.
            </li>
            <li>
                The number of mines remaining in the grid is now displayed
                during play.  <em>Beware</em>: marking a spot where you think
                a mine is substracts from this number, even if you're wrong!
            </li>
        </ul>,
    },
    {
        version: "0.9.0 - 2020-04-21",
        notes: <ul>
            <li>Fixed bug when clicking outside grid.</li>
            <li>
                Add ability to zoom and scroll around the grid.
                When zoomed in, show what part of the grid is visible
                in the viewport using a mini-map diagram in
                the bottom-right corner.
            </li>
        </ul>,
    },
    {
        version: "0.8.0 - 2020-04-20",
        notes: <ul>
            <li>Enabled different levels of difficulty.</li>
            <li>Added time/score.</li>
        </ul>,
    },
    {
        version: "0.7.0 - 2020-04-20",
        notes: <ul>
            <li>Prevent loss on first move.</li>
            <li>
                Shift-left-click (or middle-click) on an uncovered cell will
                step on all neighbors as long as there are as many markers
                around the cell as there are mines detected nearby.
            </li>
        </ul>,
    },
    {
        version: "0.6.0 - 2020-04-20",
        notes: <ul>
            <li>Added ability to mark places (by right-clicking) where player believes there are mines.</li>
            <li>Detect win condition.</li>
            <li>Upon losing, show where markers are wrong.</li>
        </ul>,
    },
    {
        version: "0.5.0 - 2020-04-20",
        notes: <ul>
            <li>Mines now explode (<em>Game Over man, <strong>GAME OVER!</strong></em>).</li>
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
            <li>Added many bugs to be fixed later. :Kappa:</li>
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
            {content.map(section => <React.Fragment key={section.version}>
                <h3>{section.version}</h3>
                {section.notes}
            </React.Fragment>)}
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
