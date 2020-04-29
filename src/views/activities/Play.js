import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";

import { actions } from "../../actions";

import {
    MAX_TILE_SCALING,
    POWER_COSTS,
    POWER_TOOL_ARMOR,
    POWER_TOOL_DETONATOR,
    POWER_TOOL_PROBE,
} from "../../constants";

import "./Play.css";

const useOnceEffect = fn => useEffect(fn, []);

const Play = ({
    armor,
    bonusPower,
    gameActive,
    gameLost,
    isBonus,
    minScaling,
    numMinesPlayerThinksAreUnaccounted,
    onAddArmor,
    onHideStage,
    onQuit,
    onReflectStageSize,
    onRetry,
    onSave,
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
    showArmor,
    soundEnabled,
    soundLevel,
    tinting,
}) => {
    const stageRef = useRef(null);
    useOnceEffect(
        () => {
            onShowStage("stage");
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
            {(
                isBonus
                ? <p className="Play-controls-bonus bonus-text">
                    BONUS GAME
                </p>
                : null
            )}
            <p className="Play-controls-score">
                Time: <span className="score-text">{score}</span>
            </p>
            <p className="Play-controls-mines-left">
                Mines Left: <span className="mines-left-text">{numMinesPlayerThinksAreUnaccounted}</span>
            </p>
            {(
                showArmor
                ? <p className="Play-controls-power">
                    <span className="armor-text">Armor: {armor}</span>
                </p>
                : null
            )}
            {(
                (power > 0)
                ? <>
                    <p className="Play-controls-power">
                        <span className="power-text">Power: {power}</span>
                    </p>
                    <div className="Play-controls-power-buttons">
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
                            Probe&nbsp;({POWER_COSTS[POWER_TOOL_PROBE]})
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
                            Detonator&nbsp;({POWER_COSTS[POWER_TOOL_DETONATOR]})
                        </button>
                        <button
                            type="button"
                            disabled={
                                !gameActive
                                || (power < POWER_COSTS[POWER_TOOL_ARMOR])
                            }
                            onClick={() => onAddArmor()}
                        >
                            Armor&nbsp;({POWER_COSTS[POWER_TOOL_ARMOR]})
                        </button>
                    </div>
                    <p className="Play-controls-power-info">
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
                : <p className="Play-controls-game-status">
                    {(
                        gameLost
                        ? <span className="game-over-text">
                            {(
                                isBonus
                                ? "NICE TRY"
                                : "GAME OVER"
                            )}
                        </span>
                        : <span className="game-won-text">
                            {(
                                isBonus
                                ? `GG! +${bonusPower} power!`
                                : "* YOU WIN *"
                            )}
                        </span>
                    )}
                </p>
            )}
            <div className="Play-controls-buttons">
                <button
                    type="button"
                    onClick={() => onQuit()}
                >
                    {(isBonus ? "Back" : "Quit")}
                </button>
                {(
                    isBonus
                    ? null
                    : <>
                        <button
                            type="button"
                            onClick={() => onRetry()}
                        >
                            Retry
                        </button>
                        <button
                            type="button"
                            onClick={() => onSave()}
                        >
                            Save
                        </button>
                    </>
                )}
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
                        Right-clicking a covered cell toggles the mark of a mine.
                    </p>
                    <p>
                        Middle-clicking will explore all surrounding cells.
                        Locations of marked mines will be skipped. The clicked
                        number must match the number of surrounding marked mines.
                    </p>
                    <p>
                        Right-clicking an uncovered cell toggles the tint to it.
                        You can control the tinting with the slider control.
                    </p>
                </div>
            </div>
        </div>
    </div>;
}

const mapStateToProps = (state, ownProps) => ({
    armor: state.game.armor,
    bonusPower: state.app.bonusPower,
    gameActive: state.game.active,
    gameLost: state.game.lost,
    isBonus: state.app.gameStack.length > 0,
    minScaling: state.app.minScaling,
    numMinesPlayerThinksAreUnaccounted: state.game.numMinesPlayerThinksAreUnaccounted,
    power: state.game.powerCollected,
    powerTool: state.game.powerTool,
    redBoxEnabled: state.app.redBoxEnabled,
    score: state.game.score,
    shakeEnabled: state.app.shakeEnabled,
    showArmor: state.game.showArmor,
    soundEnabled: state.app.soundEnabled,
    soundLevel: state.app.soundLevel,
    tinting: state.app.tinting,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onAddArmor: () => {
        const powerCost = POWER_COSTS[POWER_TOOL_ARMOR];
        dispatch(actions.AddPower({power: -powerCost}));
        dispatch(actions.AddArmor({armor: 1}));
    },
    onHideStage: () => dispatch(actions.HideStage()),
    onReflectStageSize: (width, height) => dispatch(actions.ReflectStageSize({width, height})),
    onQuit: () => dispatch(actions.Quit()),
    onRetry: () => dispatch(actions.Play({})),
    onSave: () => dispatch(actions.Save()),
    onSelectPowerTool: (powerTool) => dispatch(actions.SelectPowerTool({powerTool})),
    onSetMinScaling: (minScaling) => dispatch(actions.SetMinScaling({minScaling})),
    onSetRedBoxEnabled: (redBoxEnabled) => dispatch(actions.SetRedBoxEnabled({redBoxEnabled})),
    onSetShakeEnabled: (shakeEnabled) => dispatch(actions.SetShakeEnabled({shakeEnabled})),
    onSetSoundEnabled: (soundEnabled) => dispatch(actions.SetSoundEnabled({soundEnabled})),
    onSetSoundLevel: (soundLevel) => dispatch(actions.SetSoundLevel({soundLevel})),
    onSetTinting: (tinting) => dispatch(actions.SetTinting({tinting})),
    onShowStage: (parentId) => dispatch(actions.ShowStage({parentId})),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Play);
