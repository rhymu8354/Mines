import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";

import { actions } from "../../actions";

import {
    MAX_TILE_SCALING,
    POWER_COSTS,
    POWER_TOOL_DETONATOR,
    POWER_TOOL_PROBE,
} from "../../constants";

import "./Play.css";

const useOnceEffect = fn => useEffect(fn, []);

const Play = ({
    gameActive,
    gameLost,
    minScaling,
    numMinesPlayerThinksAreUnaccounted,
    onHideStage,
    onQuit,
    onReflectStageSize,
    onRetry,
    onSelectPowerTool,
    onSetMinScaling,
    onSetRedBoxEnabled,
    onSetShakeEnabled,
    onSetSoundEnabled,
    onSetSoundLevel,
    onSetTinting,
    onShowStage,
    power,
    powerTool,
    redBoxEnabled,
    score,
    shakeEnabled,
    soundEnabled,
    soundLevel,
    tinting,
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
            <p className="Player-controls-mines-left">
                Mines Left: <span className="mines-left-text">{numMinesPlayerThinksAreUnaccounted}</span>
            </p>
            {(
                (power > 0)
                ? <>
                    <p className="Player-controls-power">
                        <span className="power-text">Power: {power}</span>
                    </p>
                    <div className="Player-controls-power-buttons">
                        <button
                            type="button"
                            className={(
                                (powerTool === POWER_TOOL_PROBE)
                                ? "power-tool-selected"
                                : null
                            )}
                            disabled={
                                !gameActive
                                || (power < POWER_COSTS[POWER_TOOL_PROBE])
                            }
                            onClick={() => onSelectPowerTool(POWER_TOOL_PROBE)}
                        >
                            Probe&nbsp;(2)
                        </button>
                        <button
                            type="button"
                            className={(
                                (powerTool === POWER_TOOL_DETONATOR)
                                ? "power-tool-selected"
                                : null
                            )}
                            disabled={
                                !gameActive
                                || (power < POWER_COSTS[POWER_TOOL_DETONATOR])
                            }
                            onClick={() => onSelectPowerTool(POWER_TOOL_DETONATOR)}
                        >
                            Detonator&nbsp;(4)
                        </button>
                    </div>
                    <p className="Player-controls-power-info">
                        The power of ancient bots courses through your
                        veins!  Click a power move button above, then
                        left-click in the grid to unleash it!
                    </p>
                </>
                : null
            )}
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
                <button
                    type="button"
                    onClick={() => onRetry()}
                >
                    Retry
                </button>
            </div>
            <div className="Play-controls-scrolled">
                <div className="Play-controls-slider">
                    <div>Zoom:</div>
                    <input
                        type="range"
                        className="Play-controls-slider-input"
                        min={1}
                        max={MAX_TILE_SCALING}
                        step={1}
                        value={minScaling}
                        onChange={onChangeField(onSetMinScaling)}
                    />
                </div>
                <div className="Play-controls-slider">
                    <div>Tinting:</div>
                    <input
                        type="range"
                        className="Play-controls-slider-input"
                        min={0}
                        max={1}
                        step={0.05}
                        value={tinting}
                        onChange={onChangeField(onSetTinting)}
                    />
                </div>
                <div className="Play-controls-checkbox">
                    <div>Enable Sound:</div>
                    <input
                        type="checkbox"
                        checked={soundEnabled}
                        onChange={(e) => onSetSoundEnabled(e.target.checked)}
                    />
                </div>
                {(
                    soundEnabled
                    ? <div className="Play-controls-slider">
                        <div>Volume:</div>
                        <input
                            type="range"
                            className="Play-controls-slider-input"
                            min={0}
                            max={1}
                            step={0.05}
                            value={soundLevel}
                            onChange={onChangeField(onSetSoundLevel)}
                        />
                    </div>
                    : null
                )}
                <div className="Play-controls-checkbox">
                    <div>Enable Shake:</div>
                    <input
                        type="checkbox"
                        checked={shakeEnabled}
                        onChange={(e) => onSetShakeEnabled(e.target.checked)}
                    />
                </div>
                <div className="Play-controls-checkbox">
                    <div>Guide&nbsp;box:</div>
                    <input
                        type="checkbox"
                        checked={redBoxEnabled}
                        onChange={(e) => onSetRedBoxEnabled(e.target.checked)}
                    />
                </div>
                <div className="Play-controls-instructions">
                    <p>
                        You can also use the mouse wheel to zoom in/out.
                    </p>
                    <p>
                        When zoomed in, click and drag in the lower-right mini-map,
                        or use the WASD (or arrow) keys, to scroll the viewport
                        around the grid.
                    </p>
                    <p>
                        Left-clicking an uncovered cell adds a tint to it, while
                        right-clicking removes tinting.  You can control the
                        tinting with the slider control above.
                    </p>
                </div>
            </div>
        </div>
    </div>;
}

const mapStateToProps = (state, ownProps) => ({
    gameActive: state.game.active,
    gameLost: state.game.lost,
    minScaling: state.app.minScaling,
    numMinesPlayerThinksAreUnaccounted: state.game.numMinesPlayerThinksAreUnaccounted,
    power: state.game.powerCollected,
    powerTool: state.game.powerTool,
    redBoxEnabled: state.app.redBoxEnabled,
    score: state.game.score,
    shakeEnabled: state.app.shakeEnabled,
    soundEnabled: state.app.soundEnabled,
    soundLevel: state.app.soundLevel,
    tinting: state.app.tinting,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onHideStage: () => dispatch(actions.HideStage()),
    onReflectStageSize: (width, height) => dispatch(actions.ReflectStageSize({width, height})),
    onQuit: () => dispatch(actions.Quit()),
    onRetry: () => dispatch(actions.Play({})),
    onSelectPowerTool: (powerTool) => dispatch(actions.SelectPowerTool({powerTool})),
    onSetMinScaling: (minScaling) => dispatch(actions.SetMinScaling({minScaling})),
    onSetRedBoxEnabled: (redBoxEnabled) => dispatch(actions.SetRedBoxEnabled({redBoxEnabled})),
    onSetShakeEnabled: (shakeEnabled) => dispatch(actions.SetShakeEnabled({shakeEnabled})),
    onSetSoundEnabled: (soundEnabled) => dispatch(actions.SetSoundEnabled({soundEnabled})),
    onSetSoundLevel: (soundLevel) => dispatch(actions.SetSoundLevel({soundLevel})),
    onSetTinting: (tinting) => dispatch(actions.SetTinting({tinting})),
    onShowStage: () => dispatch(actions.ShowStage()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Play);
