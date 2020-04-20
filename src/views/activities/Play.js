import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";

import { actions } from "../../actions";

import "./Play.css";

const useOnceEffect = fn => useEffect(fn, []);

const Play = ({
    onHideStage,
    onQuit,
    onReflectStageSize,
    onShowStage,
}) => {
    const stageRef = useRef(null);
    useOnceEffect(
        () => {
            onShowStage();
            const onResize = () => {
                onReflectStageSize(
                    stageRef.current.clientWidth,
                    stageRef.current.clientHeight
                );
            }
            onResize();
            window.addEventListener("resize", onResize);
            return () => {
                window.removeEventListener("resize", onResize);
                onHideStage()
            };
        }
    );
    return <div
        className="Play"
    >
        <div
            className="Play-stage-outer"
            ref={stageRef}
            onContextMenu={e => e.preventDefault()}
        >
            <div
                className="Play-stage-inner"
                id="stage"
                onContextMenu={e => e.preventDefault()}
            />
        </div>
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
    onReflectStageSize: (width, height) => dispatch(actions.ReflectStageSize({width, height})),
    onQuit: () => dispatch(actions.Quit()),
    onShowStage: () => dispatch(actions.ShowStage()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Play);
