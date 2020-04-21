import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";

import { actions } from "../../actions";

import {
    MAX_TILE_SCALING,
} from "../../constants";

import "./Play.css";

const useOnceEffect = fn => useEffect(fn, []);

const Play = ({
    gameActive,
    gameLost,
    minScaling,
    onHideStage,
    onQuit,
    onReflectStageSize,
    onRetry,
    onSetMinScaling,
    onShowStage,
    score,
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
    const onChangeField = setter => event => setter(event.target.value);
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
            <p className="Player-controls-score">
                Score: <span className="score-text">{score}</span>
            </p>
            {(
                gameActive
                ? null
                : <p className="Player-controls-game-status">
                    {(
                        gameLost
                        ? <span className="game-over-text">GAME OVER</span>
                        : <span className="game-won-text">* YOU WIN *</span>
                    )}
                </p>
            )}
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
            <div className="Play-controls-min-scaling">
                <div>Zoom:</div>
                <input
                    type="range"
                    className="Play-controls-min-scaling-slider"
                    min={1}
                    max={MAX_TILE_SCALING}
                    step={1}
                    value={minScaling}
                    onChange={onChangeField(onSetMinScaling)}
                />
            </div>
            <p>
                You can also use the mouse wheel to zoom in/out.
            </p>
            <p>
                When zoomed in, click and drag in the lower-right mini-map,
                or use the WASD (or arrow) keys, to scroll the viewport
                around the grid.
            </p>
        </div>
    </div>;
}

const mapStateToProps = (state, ownProps) => ({
    gameActive: state.game.active,
    gameLost: state.game.lost,
    minScaling: state.app.minScaling,
    score: state.game.score,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onHideStage: () => dispatch(actions.HideStage()),
    onReflectStageSize: (width, height) => dispatch(actions.ReflectStageSize({width, height})),
    onQuit: () => dispatch(actions.Quit()),
    onRetry: () => dispatch(actions.Play({})),
    onSetMinScaling: (minScaling) => dispatch(actions.SetMinScaling({minScaling})),
    onShowStage: () => dispatch(actions.ShowStage()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Play);
