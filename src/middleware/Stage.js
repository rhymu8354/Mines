import Phaser from "phaser";

import { actionTypes, actions } from "../actions";

import {
    IsMineExploded,
    IsMinePresent,
    IsUncovered,
    IsTagged,
    Clamp,
    ComputeNeighborMines,
    WithAllGridCells,
} from "../Utilities";

import {
    DEPTH_MINI_MAP,
    DEPTH_TILE,
    GRID_CELL_POWER,
    MAX_TILE_SCALING,
    MINI_MAP_OPACITY,
    MINI_MAP_SIZE,
    MINI_MAP_MARGIN,
    SCROLL_UNITS_PER_PAGE_X,
    SCROLL_UNITS_PER_PAGE_Y,
    TILE_COVERED,
    TILE_EXPLODED_MINE,
    TILE_POWER,
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

const moveKeys = new Map([
    [Phaser.Input.Keyboard.KeyCodes.A, "A"],
    [Phaser.Input.Keyboard.KeyCodes.LEFT, "A"],
    [Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR, "A"],
    [Phaser.Input.Keyboard.KeyCodes.S, "S"],
    [Phaser.Input.Keyboard.KeyCodes.DOWN, "S"],
    [Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO, "S"],
    [Phaser.Input.Keyboard.KeyCodes.W, "W"],
    [Phaser.Input.Keyboard.KeyCodes.UP, "W"],
    [Phaser.Input.Keyboard.KeyCodes.NUMPAD_EIGHT, "W"],
    [Phaser.Input.Keyboard.KeyCodes.D, "D"],
    [Phaser.Input.Keyboard.KeyCodes.RIGHT, "D"],
    [Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX, "D"],
]);

const directions = new Map([
    ["A", {x: -1, y:  0}],
    ["D", {x:  1, y:  0}],
    ["W", {x:  0, y: -1}],
    ["S", {x:  0, y:  1}],
]);

const MOUSE_WHEEL_UP = 0;
const MOUSE_WHEEL_DOWN = 1;

const OnHideStage = ({
    getState,
    onPhaserNotReady,
    stage,
}) => {
    onPhaserNotReady();
    if (stage.miniMap) {
        stage.miniMap.removeAll(true);
        stage.miniMap.destroy();
        stage.miniMap = null;
        stage.miniMapGrid = null;
        stage.miniMapViewport = null;
    }
    if (stage.tiles) {
        DropTiles({getState, stage});
        stage.tiles = [];
    }
    stage.freeSprites.forEach(sprite => sprite.destroy());
    stage.freeSprites = [];
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

const ComputeCellFrame = ({gameActive, grid, x, y}) => {
    const cell = grid[y][x];
    if (IsMineExploded({grid, x, y})) {
        return TILE_EXPLODED_MINE;
    } else if (IsUncovered({grid, x, y})) {
        if (IsMinePresent({grid, x, y})) {
            return TILE_UNEXPLODED_MINE;
        } else if ((cell & GRID_CELL_POWER) !== 0) {
            return TILE_POWER;
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
};

const DropTiles = ({
    getState,
    stage
}) => {
    const grid = getState().game.grid;
    WithAllGridCells(grid, (x, y) => {
        const sprite = stage.tiles[y][x];
        if (sprite != null) {
            sprite.setVisible(false);
            stage.freeSprites.push(sprite);
            stage.tiles[y][x] = null;
        }
    });
};

const UpdateTilePositionsAndScale = ({
    getState,
    stage,
    offsetX,
    offsetY,
}) => {
    if (offsetX == null) {
        offsetX = stage.offsetX;
    }
    if (offsetY == null) {
        offsetY = stage.offsetY;
    }
    const viewportWidthInPixels = getState().app.width;
    const viewportHeightInPixels = getState().app.height;
    const grid = getState().game.grid;
    const gameActive = getState().game.active;
    const heightInTiles = grid.length;
    const widthInTiles = grid[0].length;
    stage.game.scale.setGameSize(viewportWidthInPixels, viewportHeightInPixels);
    const newTileScaling = Math.max(
        Math.min(
            Math.floor(viewportWidthInPixels / (TILE_SIZE * widthInTiles)),
            Math.floor(viewportHeightInPixels / (TILE_SIZE * heightInTiles)),
        ),
        getState().app.minScaling
    );
    const viewportWidthInTiles = Math.min(
        Math.floor(
            viewportWidthInPixels / (TILE_SIZE * newTileScaling)
        ),
        widthInTiles
    );
    const viewportHeightInTiles = Math.min(
        Math.floor(
            viewportHeightInPixels / (TILE_SIZE * newTileScaling)
        ),
        heightInTiles
    );
    const tileScaledSize = TILE_SIZE * newTileScaling;
    const viewportRightOverflow = Math.ceil((MINI_MAP_SIZE + MINI_MAP_MARGIN * 2) / tileScaledSize);
    offsetX = Clamp(
        offsetX,
        0,
        widthInTiles + viewportRightOverflow - viewportWidthInTiles
    );
    offsetY = Clamp(
        offsetY,
        0,
        heightInTiles - viewportHeightInTiles
    );
    if (
        (newTileScaling !== stage.tileScaling)
        || (offsetX !== stage.offsetX)
        || (offsetY !== stage.offsetY)
        || (stage.baseTime == null)
    ) {
        stage.tileScaling = newTileScaling;
        stage.offsetX = offsetX;
        stage.offsetY = offsetY;
        WithAllGridCells(grid, (x, y) => {
            const spriteX = (x - offsetX) * tileScaledSize;
            const spriteY = (y - offsetY) * tileScaledSize;
            if (
                (spriteX + tileScaledSize < 0)
                || (spriteX >= viewportWidthInPixels)
                || (spriteY + tileScaledSize < 0)
                || (spriteY >= viewportHeightInPixels)
            ) {
                const sprite = stage.tiles[y][x];
                if (sprite != null) {
                    sprite.setVisible(false);
                    stage.freeSprites.push(sprite);
                    stage.tiles[y][x] = null;
                }
            } else {
                let sprite = stage.tiles[y][x];
                if (sprite == null) {
                    if (stage.freeSprites.length === 0) {
                        sprite = stage.scene.add.sprite(spriteX, spriteY);
                        sprite.setDepth(DEPTH_TILE);
                        sprite.setOrigin(0, 0);
                        sprite.setScale(stage.tileScaling);
                    } else {
                        sprite = stage.freeSprites.pop();
                    }
                    sprite.setTexture(
                        "atlas",
                        ComputeCellFrame({gameActive, grid, x, y})
                    );
                    stage.tiles[y][x] = sprite;
                }
                sprite.setX(spriteX);
                sprite.setY(spriteY);
                sprite.setScale(newTileScaling);
                sprite.setVisible(true);
            }
        });
    }
    const gridWidthInPixels = widthInTiles * tileScaledSize;
    const gridHeightInPixels = heightInTiles * tileScaledSize;
    const viewportOffsetXPixels = offsetX * tileScaledSize;
    const viewportOffsetYPixels = offsetY * tileScaledSize;
    stage.miniMap.removeAll(true);
    if (
        (viewportWidthInPixels < gridWidthInPixels)
        || (viewportHeightInPixels < gridHeightInPixels)
    ) {
        stage.miniMapRatio = Math.min(
            MINI_MAP_SIZE / Math.max(viewportOffsetXPixels + viewportWidthInPixels, gridWidthInPixels),
            MINI_MAP_SIZE / Math.max(viewportOffsetYPixels + viewportHeightInPixels, gridHeightInPixels)
        );
        stage.miniMap.setPosition(
            viewportWidthInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN * 2,
            viewportHeightInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN * 2
        );
        stage.miniMap.width = MINI_MAP_SIZE + MINI_MAP_MARGIN;
        stage.miniMap.height = MINI_MAP_SIZE + MINI_MAP_MARGIN;
        const miniMapGrid = stage.scene.add.graphics();
        miniMapGrid.fillStyle(0xffffff);
        miniMapGrid.fillRect(
            MINI_MAP_MARGIN,
            MINI_MAP_MARGIN,
            gridWidthInPixels * stage.miniMapRatio,
            gridHeightInPixels * stage.miniMapRatio
        );
        miniMapGrid.setDepth(1);
        stage.miniMap.add(miniMapGrid);
        const miniMapViewport = stage.scene.add.graphics();
        miniMapViewport.lineStyle(1, 0xff0000, 1);
        miniMapViewport.strokeRect(
            Math.floor(MINI_MAP_MARGIN + viewportOffsetXPixels * stage.miniMapRatio),
            Math.floor(MINI_MAP_MARGIN + viewportOffsetYPixels * stage.miniMapRatio),
            Math.ceil(viewportWidthInPixels * stage.miniMapRatio),
            Math.ceil(viewportHeightInPixels * stage.miniMapRatio)
        );
        miniMapViewport.setDepth(1);
        stage.miniMap.add(miniMapViewport);
    }
};

const DragViewportInMiniMap = ({getState, stage, pointer}) => {
    const viewportWidthInPixels = getState().app.width;
    const viewportHeightInPixels = getState().app.height;
    const tileScaledSize = TILE_SIZE * stage.tileScaling;
    const grid = getState().game.grid;
    const heightInTiles = grid.length;
    const widthInTiles = grid[0].length;
    const viewportWidthInTiles = Math.min(
        Math.floor(
            viewportWidthInPixels / tileScaledSize
        ),
        widthInTiles
    );
    const viewportHeightInTiles = Math.min(
        Math.floor(
            viewportHeightInPixels / tileScaledSize
        ),
        heightInTiles
    );
    const offsetX = Math.floor(
        (
            pointer.x - (viewportWidthInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN)
        ) / stage.miniMapRatio / tileScaledSize
        - viewportWidthInTiles / 2
    );
    const offsetY = Math.floor(
        (
            pointer.y - (viewportHeightInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN)
        ) / stage.miniMapRatio / tileScaledSize
        - viewportHeightInTiles / 2
    );
    UpdateTilePositionsAndScale({
        getState,
        stage,
        offsetX,
        offsetY,
    });
};

const OnPlay = ({
    getState,
    stage,
}) => {
    stage.baseTime = null;
    DropTiles({getState, stage});
    UpdateTilePositionsAndScale({
        getState,
        stage,
        offsetX: 0,
        offsetY: 0
    });
};

const OnReflectGridUpdated = ({
    action: {x, y},
    getState,
    stage,
}) => {
    const grid = getState().game.grid;
    const gameActive = getState().game.active;
    const sprite = stage.tiles[y][x];
    if (sprite != null) {
        sprite.setTexture("atlas", ComputeCellFrame({gameActive, grid, x, y}));
    }
};

const OnReflectStageSize = ({
    getState,
    stage,
}) => {
    UpdateTilePositionsAndScale({getState, stage});
};

const OnSelectPowerTool = ({
    getState,
    stage,
}) => {
    const powerTool = getState().game.powerTool;
    if (powerTool == null) {
        stage.scene.input.setDefaultCursor("pointer");
    } else {
        stage.scene.input.setDefaultCursor("crosshair");
    }
};

const OnSetMinScaling = ({
    getState,
    stage,
}) => {
    UpdateTilePositionsAndScale({getState, stage});
};

const OnShowStage = ({
    dispatch,
    getState,
    onPhaserReady,
    stage,
}) => {
    const onKeyDown = (e) => {
        if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
            dispatch(actions.SelectPowerTool({powerTool: null}));
            return;
        }
        const moveKey = moveKeys.get(e.keyCode);
        if (moveKey) {
            const direction = directions.get(moveKey);
            const grid = getState().game.grid;
            const width = Math.min(
                Math.ceil(
                    getState().app.width / (TILE_SIZE * stage.tileScaling)
                ),
                grid[0].length
            );
            const height = Math.min(
                Math.ceil(
                    getState().app.height / (TILE_SIZE * stage.tileScaling)
                ),
                grid.length
            );
            const dx = Math.max(1, Math.floor(width / SCROLL_UNITS_PER_PAGE_X));
            const dy = Math.max(1, Math.floor(height / SCROLL_UNITS_PER_PAGE_Y));
            UpdateTilePositionsAndScale({
                getState,
                stage,
                offsetX: stage.offsetX + dx * direction.x,
                offsetY: stage.offsetY + dy * direction.y
            });
            e.preventDefault();
        }
    };
    const onPointerMove = (pointer) => {
        if (stage.draggingViewportInMiniMap) {
            DragViewportInMiniMap({getState, stage, pointer});
        }
    };
    const onPointerDown = (pointer) => {
        if (stage.activeButton != null) {
            return;
        }
        if (stage.draggingViewportInMiniMap) {
            return;
        }
        const viewportWidthInPixels = getState().app.width;
        const viewportHeightInPixels = getState().app.height;
        if (
            (pointer.x >= viewportWidthInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN)
            && (pointer.x < viewportWidthInPixels - MINI_MAP_MARGIN)
            && (pointer.y >= viewportHeightInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN)
            && (pointer.y < viewportHeightInPixels - MINI_MAP_MARGIN)
        ) {
            stage.draggingViewportInMiniMap = true;
            DragViewportInMiniMap({getState, stage, pointer});
        }
        stage.activeButton = pointer.buttons;
    }
    const onPointerUp = (pointer) => {
        if (pointer.buttons) {
            return;
        }
        if (!stage.activeButton) {
            return;
        }
        const button = stage.activeButton;
        stage.activeButton = null;
        if (stage.draggingViewportInMiniMap) {
            stage.draggingViewportInMiniMap = false;
            return;
        }
        const viewportWidthInPixels = getState().app.width;
        const viewportHeightInPixels = getState().app.height;
        if (
            (pointer.x >= viewportWidthInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN)
            && (pointer.x < viewportWidthInPixels - MINI_MAP_MARGIN)
            && (pointer.y >= viewportHeightInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN)
            && (pointer.y < viewportHeightInPixels - MINI_MAP_MARGIN)
        ) {
            stage.draggingViewportInMiniMap = true;
            DragViewportInMiniMap({getState, stage, pointer});
            return;
        }
        const gameActive = getState().game.active;
        if (!gameActive) {
            return;
        }
        const tileScaledSize = TILE_SIZE * stage.tileScaling;
        const x = stage.offsetX + Math.floor(pointer.x / tileScaledSize);
        const y = stage.offsetY + Math.floor(pointer.y / tileScaledSize);
        const grid = getState().game.grid;
        if (x >= grid[0].length) {
            return;
        }
        if (y >= grid.length) {
            return;
        }
        const leftClick = (button === 1);
        const middleClick = (button === 4);
        const isShift = pointer.event.shiftKey;
        if (
            middleClick || (leftClick && isShift)
        ) {
            dispatch(actions.StepOnUntaggedNeighborsIfEnoughTagged({x, y}));
        } else if (leftClick) {
            const powerTool = getState().game.powerTool;
            if (powerTool == null) {
                const wasUncovered = IsUncovered({grid, x, y});
                dispatch(actions.StepIfNotTagged({x, y}));
                if (wasUncovered) {
                    dispatch(actions.PickUp({x, y}));
                }
            } else {
                dispatch(actions.UsePowerTool({x, y}));
            }
        } else {
            dispatch(actions.ToggleMarker({x, y}));
        }
    };
    const onPointerUpOutside = (pointer) => {
        stage.draggingViewportInMiniMap = false;
        stage.activeButton = null;
    };
    const onMouseWheel = (direction, x, y) => {
        const oldTileScaledSize = TILE_SIZE * stage.tileScaling;
        const anchorX = Math.floor(x / oldTileScaledSize) + stage.offsetX;
        const anchorY = Math.floor(y / oldTileScaledSize) + stage.offsetY;
        let minScaling = getState().app.minScaling;
        if (direction === MOUSE_WHEEL_UP) {
            ++minScaling;
        } else {
            --minScaling;
        }
        minScaling = Clamp(minScaling, 1, MAX_TILE_SCALING);
        dispatch(actions.SetMinScaling({minScaling}));
        const newTileScaledSize = TILE_SIZE * stage.tileScaling;
        UpdateTilePositionsAndScale({
            getState,
            stage,
            offsetX: anchorX - Math.floor(x / newTileScaledSize),
            offsetY: anchorY - Math.floor(y / newTileScaledSize),
        });
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
        const grid = getState().game.grid;
        const height = grid.length;
        const width = grid[0].length;
        stage.baseTime = null;
        stage.time = null;
        stage.draggingViewportInMiniMap = false;
        for (let y = 0; y < height; ++y) {
            stage.tiles[y] = [];
            for (let x = 0; x < width; ++x) {
                stage.tiles[y][x] = null;
            }
        }
        stage.miniMap = stage.scene.add.container();
        stage.miniMap.setDepth(DEPTH_MINI_MAP);
        stage.miniMap.setAlpha(MINI_MAP_OPACITY);
        onPhaserReady();
        stage.scene.input.keyboard.on("keydown", onKeyDown);
        stage.scene.input.on("pointermove", onPointerMove);
        stage.scene.input.on("pointerdown", onPointerDown);
        stage.scene.input.on("pointerup", onPointerUp);
        stage.scene.input.on("pointerupoutside", onPointerUpOutside);
        document.getElementById("stage").addEventListener("wheel", (event) => {
            onMouseWheel(
                (event.deltaY < 0) ? MOUSE_WHEEL_UP : MOUSE_WHEEL_DOWN,
                event.offsetX,
                event.offsetY
            );
        });
        stage.scene.input.topOnly = false;
        stage.scene.input.setDefaultCursor("pointer");
        stage.activeButton = null;
    };
    const phaserUpdate = function(time) {
        if (getState().game.active) {
            if (stage.baseTime == null) {
                stage.baseTime = time;
                stage.time = 0;
            }
            stage.lastTime = stage.time;
            stage.time = Math.floor((time - stage.baseTime) / 1000);
            if (stage.lastTime !== stage.time) {
                dispatch(actions.ReflectScore({score: stage.time}));
            }
        }
    };
    const config = {
        draggingViewportInMiniMap: false,
        type: Phaser.AUTO,
        input: {
            keyboard: true,
            mouse: true,
            touch: true,
        },
        miniMap: null,
        parent: "stage",
        pixelArt: true,
        width: 1,
        height: 1,
        scene: {
            init: phaserInit,
            preload: phaserPreload,
            create: phaserCreate,
            update: phaserUpdate,
        },
    };
    stage.game = new Phaser.Game(config);
};

const handlers = {
    [actionTypes.HideStage]: OnHideStage,
    [actionTypes.Play]: OnPlay,
    [actionTypes.ReflectGridUpdated]: OnReflectGridUpdated,
    [actionTypes.ReflectStageSize]: OnReflectStageSize,
    [actionTypes.SelectPowerTool]: OnSelectPowerTool,
    [actionTypes.SetMinScaling]: OnSetMinScaling,
    [actionTypes.ShowStage]: OnShowStage,
};

export default function({ getState, dispatch }) {
    const stage = {
        baseTime: null,
        activeButton: null,
        debug: null,
        freeSprites: [],
        game: null,
        miniMapRatio: 1,
        offsetX: 0,
        offsetY: 0,
        ready: false,
        scene: null,
        tiles: [],
        tileScaling: 1,
        time: null,
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
