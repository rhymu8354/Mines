import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";

import { actions } from "../../actions";

import "./Play.css";

const useOnceEffect = fn => useEffect(fn, []);

const Play = ({
    gameActive,
    onHideStage,
    onQuit,
    onReflectStageSize,
    onRetry,
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
                {(
                    gameActive
                    ? <>(Score and other stuff will go here!)</>
                    : <span className="game-over-text">GAME OVER</span>
                )}
            </p>
            <div className="Play-controls-buttons">
                <button
                    type="button"
                    onClick={() => onQuit()}
                >
                    Quit
                </button>
                {(
                    gameActive
                    ? null
                    : <button
                        type="button"
                        onClick={() => onRetry()}
                    >
                        Retry
                    </button>
                )}
            </div>
        </div>
    </div>;
}

const mapStateToProps = (state, ownProps) => ({
    gameActive: state.game.active,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onHideStage: () => dispatch(actions.HideStage()),
    onReflectStageSize: (width, height) => dispatch(actions.ReflectStageSize({width, height})),
    onQuit: () => dispatch(actions.Quit()),
    onRetry: () => dispatch(actions.Play()),
    onShowStage: () => dispatch(actions.ShowStage()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Play);
