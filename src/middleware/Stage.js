import Phaser from "phaser";

import { actionTypes, actions } from "../actions";

import {
    IsMinePresent,
    IsUncovered,
    IsTagged,
    ComputeNeighborMines,
    WithAllGridCells,
} from "../Utilities";

import {
    GRID_CELL_MINE_EXPLODED,
    GRID_WIDTH_TILES,
    GRID_HEIGHT_TILES,
    TILE_COVERED,
    TILE_EXPLODED_MINE,
    TILE_SIZE,
    TILE_UNCOVERED_EIGHT_NEIGHBORS,
    TILE_UNCOVERED_FIVE_NEIGHBORS,
    TILE_UNCOVERED_FOUR_NEIGHBORS,
    TILE_UNCOVERED_NO_NEIGHBORS,
    TILE_UNCOVERED_ONE_NEIGHBOR,
    TILE_UNCOVERED_SEVEN_NEIGHBORS,
    TILE_UNCOVERED_SIX_NEIGHBORS,
    TILE_UNCOVERED_THREE_NEIGHBORS,
    TILE_UNCOVERED_TWO_NEIGHBORS,
    TILE_UNEXPLODED_MINE,
    TILE_TAG,
    TILE_TAGGED_BUT_NO_MINE,
} from "../constants";

const OnHideStage = ({
    onPhaserNotReady,
    stage,
}) => {
    onPhaserNotReady();
    if (stage.tiles) {
        stage.tiles.forEach(row => row.forEach(sprite => {
            sprite.destroy();
        }));
        stage.tiles = [];
    }
    stage.scene = null;
    stage.game.destroy(true);
    stage.game = null;
};

const tilesForNeighbors = [
    TILE_UNCOVERED_NO_NEIGHBORS,
    TILE_UNCOVERED_ONE_NEIGHBOR,
    TILE_UNCOVERED_TWO_NEIGHBORS,
    TILE_UNCOVERED_THREE_NEIGHBORS,
    TILE_UNCOVERED_FOUR_NEIGHBORS,
    TILE_UNCOVERED_FIVE_NEIGHBORS,
    TILE_UNCOVERED_SIX_NEIGHBORS,
    TILE_UNCOVERED_SEVEN_NEIGHBORS,
    TILE_UNCOVERED_EIGHT_NEIGHBORS,
];

const ComputeCellTexture = ({gameActive, grid, x, y}) => {
    const cell = grid[y][x];
    if ((cell & GRID_CELL_MINE_EXPLODED) === 0) {
        if (IsUncovered({grid, x, y})) {
            if (IsMinePresent({grid, x, y})) {
                return TILE_UNEXPLODED_MINE;
            } else {
                return tilesForNeighbors[
                    ComputeNeighborMines({grid, x, y})
                ];
            }
        } else {
            if (IsTagged({grid, x, y})) {
                if (
                    gameActive
                    || IsMinePresent({grid, x, y})
                ) {
                    return TILE_TAG;
                } else {
                    return TILE_TAGGED_BUT_NO_MINE;
                }
            } else {
                return TILE_COVERED;
            }
        }
    } else {
        return TILE_EXPLODED_MINE;
    }
};

const OnPlay = ({
    stage,
}) => {
    WithAllGridCells((x, y) => {
        const sprite = stage.tiles[y][x];
        sprite.setTexture("atlas", TILE_COVERED);
    });
};

const OnReflectGridUpdated = ({
    action: {x, y},
    getState,
    stage,
}) => {
    const grid = getState().game.grid;
    const gameActive = getState().game.active;
    stage.tiles[y][x].setTexture("atlas", ComputeCellTexture({gameActive, grid, x, y}));
};

const OnReflectStageSize = ({
    getState,
    stage,
}) => {
    const width = getState().app.width;
    const height = getState().app.height;
    stage.game.scale.setGameSize(width, height);
    const newTileScaling = Math.min(
        Math.floor(width / (TILE_SIZE * GRID_WIDTH_TILES)),
        Math.floor(height / (TILE_SIZE * GRID_HEIGHT_TILES)),
    );
    if (newTileScaling !== stage.tileScaling) {
        stage.tileScaling = newTileScaling;
        const tileScaledSize = TILE_SIZE * stage.tileScaling;
        WithAllGridCells((x, y) => {
            const sprite = stage.tiles[y][x];
            sprite.setX(x * tileScaledSize);
            sprite.setY(y * tileScaledSize);
            sprite.setScale(stage.tileScaling);
        });
    }
};

const OnShowStage = ({
    dispatch,
    getState,
    onPhaserReady,
    stage,
}) => {
    const onKeyDown = (e) => {
    };
    const onPointerMove = (pointer) => {
        stage.pointerOver = true;
    };
    const onPointerDown = (pointer) => {
        const gameActive = getState().game.active;
        if (!gameActive) {
            return;
        }
        const tileScaledSize = TILE_SIZE * stage.tileScaling;
        const x = Math.floor(pointer.x / tileScaledSize);
        const y = Math.floor(pointer.y / tileScaledSize);
        const leftClick = (pointer.buttons === 1);
        const middleClick = (pointer.buttons === 4);
        const isShift = pointer.event.shiftKey;
        if (
            middleClick || (leftClick && isShift)
        ) {
            dispatch(actions.StepOnUntaggedNeighborsIfEnoughTagged({x, y}));
        }
        else if (leftClick) {
            dispatch(actions.StepIfNotTagged({x, y}));
        } else {
            dispatch(actions.ToggleMarker({x, y}));
        }
    };
    const onGameOut = () => {
        stage.pointerOver = false;
    };
    const phaserInit = function() {
        stage.scene = this;
    };
    const phaserPreload = function() {
        stage.scene.load.spritesheet(
            "atlas",
            "/atlas.png",
            {
                frameWidth: TILE_SIZE,
                frameHeight: TILE_SIZE,
            }
        );
    };
    const phaserCreate = function() {
        const tileScaledSize = TILE_SIZE * stage.tileScaling;
        for (let y = 0; y < GRID_HEIGHT_TILES; ++y) {
            stage.tiles[y] = [];
            for (let x = 0; x < GRID_WIDTH_TILES; ++x) {
                const sprite = stage.scene.add.sprite(
                    x * tileScaledSize,
                    y * tileScaledSize
                );
                sprite.setOrigin(0, 0);
                sprite.setScale(stage.tileScaling);
                stage.tiles[y][x] = sprite;
            }
        }
        onPhaserReady();
        stage.scene.input.keyboard.on("keydown", onKeyDown);
        stage.scene.input.on("pointermove", onPointerMove);
        stage.scene.input.on("pointerdown", onPointerDown);
        stage.scene.input.on("gameout", onGameOut);
        stage.scene.input.topOnly = false;
    };
    const config = {
        type: Phaser.AUTO,
        input: {
            keyboard: true,
            mouse: true,
            touch: true,
        },
        parent: "stage",
        pixelArt: true,
        width: GRID_WIDTH_TILES * TILE_SIZE,
        height: GRID_HEIGHT_TILES * TILE_SIZE,
        scene: {
            init: phaserInit,
            preload: phaserPreload,
            create: phaserCreate,
        },
    };
    stage.game = new Phaser.Game(config);
};

const handlers = {
    [actionTypes.HideStage]: OnHideStage,
    [actionTypes.Play]: OnPlay,
    [actionTypes.ReflectGridUpdated]: OnReflectGridUpdated,
    [actionTypes.ReflectStageSize]: OnReflectStageSize,
    [actionTypes.ShowStage]: OnShowStage,
};

export default function({ getState, dispatch }) {
    const stage = {
        debug: null,
        game: null,
        pointerOver: false,
        ready: false,
        scene: null,
        tiles: [],
        tileScaling: 1,
        time: 0,
    };
    let deferredActions = [];
    let handlingDeferredActions = false;
    const handleDeferredActions = () => {
        if (handlingDeferredActions) {
            return;
        }
        handlingDeferredActions = true;
        deferredActions.forEach(deferredAction => deferredAction());
        deferredActions.length = 0;
        handlingDeferredActions = false;
    };
    const onPhaserNotReady = () => {
        stage.ready = false;
    };
    const onPhaserReady = () => {
        stage.ready = true;
        stage.scene.load.on("complete", () => {
            handleDeferredActions();
        });
        handleDeferredActions();
    };
    return next => action => {
        next(action);
        const handler = handlers[action.type];
        if (handler) {
            const callHandler = () => handler({
                action,
                dispatch,
                getState,
                onPhaserNotReady,
                onPhaserReady,
                stage
            });
            if (
                (action.type !== actionTypes.ShowStage)
                && !stage.ready
            ) {
                deferredActions.push(callHandler);
            } else {
                callHandler();
            }
        }
    };
};
