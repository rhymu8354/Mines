import React from "react";
import { connect } from "react-redux";

import { actions } from "../../actions";

import SafeHyperlink from "../SafeHyperlink";

import "./ReleaseNotes.css";

const content = [
    {
        version: "0.20.2 - 2021-02-13",
        notes: <ul>
            <li>Fix issues with sound management.</li>
            <li>Fix crash if save/restore game with "surprise" active.</li>
        </ul>,
    },
    {
        version: "0.20.1 - 2021-02-13",
        notes: <ul>
            <li>Make special surprise obey sound enable/disable.</li>
        </ul>,
    },
    {
        version: "0.20.0 - 2021-02-13",
        notes: <ul>
            <li>Added special surprise for Fail.</li>
        </ul>,
    },
    {
        version: "0.19.1 - 2020-05-10",
        notes: <ul>
            <li>Fixed offset bug with guide box.</li>
        </ul>,
    },
    {
        version: "0.19.0 - 2020-05-08",
        notes: <ul>
            <li>
                Made it more obvious when the viewport is showing an actual
                grid corner or not, by offsetting the view by half a cell.
            </li>
            <li>
                Fixed bug where mini-map would not appear when grid
                was scrolled.
            </li>
            <li>Added "fork me on GitHub" banner.</li>
        </ul>,
    },
    {
        version: "0.18.2 - 2020-04-29",
        notes: <ul>
            <li>
                Fixed bug in mis-counting cells cleared when the first
                move is to use a power probe or detonator.
            </li>
        </ul>,
    },
    {
        version: "0.18.1 - 2020-04-29",
        notes: <ul>
            <li>
                Fixed bug in mini-map where removed tag was not
                drawn properly.
            </li>
        </ul>,
    },
    {
        version: "0.18.0 - 2020-04-29",
        notes: <ul>
            <li>
                Your progress in clearing the grid is now shown
                in the mini-map!
            </li>
        </ul>,
    },
    {
        version: "0.17.0 - 2020-04-29",
        notes: <ul>
            <li>
                Added bonus games for power levels!
                Special "<code>B</code>" tokens are spread throughout the grid.
                Picking one up begins
                a "<span className="bonus-text">bonus</span>" game,
                where the faster you
                complete it, the more bonus power points are granted to you
                in the main game.  If you lose the "bonus" game, no worries,
                the main game continues; you just don't get any bonus
                power points.
            </li>
            <li>
                Added ability to save the game and restore it later.
                This is <em>totally not</em> intended to be used to reload
                the game after making a mistake.
            </li>
            <li>
                Reduced the cost of the detonator from 4 to 3 power points.
            </li>
            <li>
                Added armor!  You start off with one point
                in power levels, and you can spend 5 power points
                to add additional armor.
                What does armor do?  I'm glad you asked!  If you accidentally
                step on a mine, normally it would be "game over".  However,
                if you have armor, you stay alive, with one point of armor
                taken away instead.  The question remains: will you invest
                all your power points
                in armor, or will you take a chance and use the other tools?
                The choice is up to you!
            </li>
            <li>
                Fixed bug in remaining mines not being shown when all clear
                cells are uncovered.
            </li>
        </ul>,
    },
    {
        version: "0.16.1 - 2020-04-26",
        notes: <ul>
            <li>Several documentation errors fixed (thanks to nD00rn!)</li>
        </ul>,
    },
    {
        version: "0.16.0 - 2020-04-25",
        notes: <ul>
            <li>Allow marking/unmarking revealed unexploded mines.</li>
            <li>
                Changed darkening of revealed cells from left-click
                to right-click.  This makes right-click always "safe", meaning
                it will never cause you to lose the game, whereas left-click
                is "dangerous" and can cause you to lose if you click on
                an unexploded mine or clear an area near a spot where you
                have marked a mine which is really not there.
            </li>
            <li>
                You can now scroll the viewport by dragging while holding
                down the &lt;Alt&gt; key or both the left and right
                mouse buttons.
            </li>
            <li>
                Double-left-clicking now works like Shift-clicking:
                doing either on an uncovered cell will step on all neighbors
                as long as there are as many markers around the cell as there
                are mines detected nearby.
            </li>
            <li>
                The first left-click in the grid will now always reveal
                an open area (no mines within the 3x3 area centered on
                where you click).
            </li>
            <li>
                Fixed bug in not showing mistakes adjacent to exploded mines.
            </li>
            <li>
                Fixed bug in miscounting mines left after chain explosions.
            </li>
            <li>
                Darkening/lightening uncovered cells is now applied when you
                release the mouse button rather than when you press it.
            </li>
            <li>
                You can now darken/lighten many unconvered cells by dragging
                while holding down the right mouse button.
            </li>
            <li>
                TypeScript-enabled checks are now enabled for development
                environments such as VSCode (thanks to Aiden_Garth!)
            </li>
        </ul>,
    },
    {
        version: "0.15.0 - 2020-04-23",
        notes: <ul>
            <li>Fixed management of app version when building.</li>
        </ul>,
    },
    {
        version: "0.14.0 - 2020-04-23",
        notes: <ul>
            <li>
                Added optional "guide box" centered where the pointer is
                placed on the grid, to aid in seeing where you're
                going to click.
            </li>
            <li>
                Put some controls and instructions inside a scroll box
                on the right so it doesn't cause overflow.
            </li>
        </ul>,
    },
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
            <li>Fixed bug in initial cell sizing/scaling.</li>
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
        <div>
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
