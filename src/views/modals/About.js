import React from "react";
import { connect } from "react-redux";

import { actions } from "../../actions";

import SafeHyperlink from "../SafeHyperlink";

import "./About.css";

const About = ({
    onDismiss,
}) => {
    return <div className="About-container">
        <div>
            <h2>About Rhymines</h2>
            <hr />
        </div>
        <div>
            <p>
                Rhymines is a web port of a Minesweeper clone that Rhymu8354
                originally wrote in C++ and assembly for MS-DOS in 1992.
                Some of the original source code was lost, so he decided to
                rewrite it for the web, using the original artwork, level
                parameters, and special ability designs.
            </p>
            <p>
                This web app uses <SafeHyperlink href="https://reactjs.org/">React</SafeHyperlink>,
                {" "}<SafeHyperlink href="https://redux.js.org/">Redux</SafeHyperlink>,
                {" "}<SafeHyperlink href="https://react-redux.js.org/">React-Redux</SafeHyperlink>,
                and <SafeHyperlink href="http://phaser.io/">Phaser</SafeHyperlink>.
                It's open-source, with the source code available on GitHub here:
                {" "}<SafeHyperlink href="https://github.com/rhymu8354/Mines">https://github.com/rhymu8354/Mines</SafeHyperlink>.
                Feel free to make suggestions or pull requests! ♥
                The latest production build is hosted on <SafeHyperlink href="https://vercel.com/">Vercel</SafeHyperlink>.
            </p>
            <p>
                Rhymu8354 developed part of this app live on Twitch:
                {" "}<SafeHyperlink href="https://www.twitch.tv/videos/597549188">Watch the VOD here</SafeHyperlink>
            </p>
            <p>
                Rhymu8354 regularly streams live coding on Twitch four days a week,
                develops (mostly from scratch) many open-source components
                available on GitHub, and has a Discord server you can use
                to connect to and participate in his community.
                He also occasionally produces educational content about software
                development on YouTube, in addition to archiving all past
                Twitch broadcasts on YouTube.
                <ul>
                    <li><SafeHyperlink href="https://www.twitch.tv/rhymu8354">Watch live on Twitch</SafeHyperlink></li>
                    <li><SafeHyperlink href="https://github.com/rhymu8354">Browse code on GitHub</SafeHyperlink></li>
                    <li><SafeHyperlink href="https://discord.gg/bZhfCh8">Join the Discord server</SafeHyperlink></li>
                    <li><SafeHyperlink href="https://www.youtube.com/rhymu8354">See the YouTube channel</SafeHyperlink></li>
                </ul>
            </p>
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
)(About);
