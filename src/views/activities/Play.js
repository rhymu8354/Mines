import React, { useEffect } from "react";
import { connect } from "react-redux";

import { actions } from "../../actions";

import "./Play.css";

import {
    STAGE_WIDTH_PIXELS,
    STAGE_HEIGHT_PIXELS,
} from "../../constants";

const useOnceEffect = fn => useEffect(fn, []);

const Play = ({
    onHideStage,
    onQuit,
    onShowStage,
}) => {
    useOnceEffect(
        () => {
            onShowStage();
            return () => onHideStage();
        }
    );
    return <div
        className="Play"
    >
        <div
            className="Play-stage"
            id="stage"
            style={{
                width: STAGE_WIDTH_PIXELS,
                height: STAGE_HEIGHT_PIXELS,
            }}
            onContextMenu={(e) => {e.preventDefault();}}
        />
        <div className="Play-controls">
            <p>
                (Score and other stuff will go here!)
            </p>
            <div>
                <button
                    type="button"
                    onClick={() => onQuit()}
                >
                    Quit
                </button>
            </div>
        </div>
    </div>;
}

const mapStateToProps = (state, ownProps) => ({
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onHideStage: () => dispatch(actions.HideStage()),
    onQuit: () => dispatch(actions.Quit()),
    onShowStage: () => dispatch(actions.ShowStage()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Play);
