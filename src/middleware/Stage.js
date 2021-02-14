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
    DEPTH_SPRITE_CONTAINER,
    DETONATION_SHAKE_COUNT,
    DETONATION_SOUND_DURATION,
    DOUBLE_CLICK_THRESHOLD_MILLISECONDS,
    GRID_CELL_BONUS,
    GRID_CELL_DARKENED,
    GRID_CELL_POWER,
    GRID_CELL_SSS,
    GRID_CELL_TAGGED,
    MAX_TILE_SCALING,
    MINI_MAP_OPACITY,
    MINI_MAP_SIZE,
    MINI_MAP_MARGIN,
    SCROLL_UNITS_PER_PAGE_X,
    SCROLL_UNITS_PER_PAGE_Y,
    SHAKE_MAX_DISTANCE,
    SSS_FLASH_PERIOD,
    SSS_SOUND_DURATION,
    TILE_BONUS,
    TILE_COVERED,
    TILE_EXPLODED_MINE,
    TILE_POWER,
    TILE_SSS_0,
    TILE_SSS_1,
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
    GRID_CELL_UNCOVERED,
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

const ComputeSpriteTint = ({getState, stage}) => {
    const tintedChannel = Math.floor(0xff * getState().app.tinting);
    stage.tinting = (
        tintedChannel
        + tintedChannel * 256
        + tintedChannel * 65536
    );
};

const ComputeCellFrame = ({stage, gameActive, grid, x, y}) => {
    const cell = grid[y][x];
    if (IsMineExploded({grid, x, y})) {
        return TILE_EXPLODED_MINE;
    } else if (IsTagged({grid, x, y})) {
        if (gameActive) {
            return TILE_TAG;
        } else if (IsMinePresent({grid, x, y})) {
            return TILE_UNEXPLODED_MINE;
        } else {
            return TILE_TAGGED_BUT_NO_MINE;
        }
    } else if (IsUncovered({grid, x, y})) {
        if (IsMinePresent({grid, x, y})) {
            return TILE_UNEXPLODED_MINE;
        } else if ((cell & GRID_CELL_BONUS) !== 0) {
            return TILE_BONUS;
        } else if ((cell & GRID_CELL_POWER) !== 0) {
            return TILE_POWER;
        } else if ((cell & GRID_CELL_SSS) !== 0) {
            if ((Math.floor((stage.lastTimeRaw - stage.sssStart) / SSS_FLASH_PERIOD) % 2) === 0) {
                return TILE_SSS_0;
            } else {
                return TILE_SSS_1;
            }
        } else {
            return tilesForNeighbors[
                ComputeNeighborMines({grid, x, y})
            ];
        }
    } else {
        return TILE_COVERED;
    }
};

const DragViewportInMiniMap = ({
    dispatch,
    getState,
    stage,
    pointer
}) => {
    const viewportWidthInPixels = getState().game.width;
    const viewportHeightInPixels = getState().game.height;
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
        ) / stage.miniMapRatio
        - viewportWidthInTiles / 2
    );
    const offsetY = Math.floor(
        (
            pointer.y - (viewportHeightInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN)
        ) / stage.miniMapRatio
        - viewportHeightInTiles / 2
    );
    dispatch(actions.SetViewport({offsetX, offsetY}));
};

const DragViewportInGrid = ({dispatch, getState, stage, pointer}) => {
    const [x, y] = GridCoordinatesFromPointer({getState, pointer, stage});
    const {offsetX, offsetY} = getState().game;
    if (
        (x !== stage.lastX)
        || (y !== stage.lastY)
    ) {
        dispatch(
            actions.SetViewport({
                offsetX: offsetX + stage.lastX - x,
                offsetY: offsetY + stage.lastY - y,
            })
        );
    }
};

const GridCoordinatesFromPointer = ({
    getState,
    pointer,
    stage,
}) => {
    const tileScaledSize = TILE_SIZE * stage.tileScaling;
    const x = getState().game.offsetX + Math.floor(pointer.x / tileScaledSize - 0.5);
    const y = getState().game.offsetY + Math.floor(pointer.y / tileScaledSize - 0.5);
    return [x, y];
};

const DropTiles = ({
    getState,
    stage
}) => {
    WithAllGridCells(stage.tiles, (x, y) => {
        const sprite = stage.tiles[y][x];
        if (sprite != null) {
            sprite.setVisible(false);
            stage.freeSprites.push(sprite);
            stage.tiles[y][x] = null;
        }
    });
};

const SetCursor = ({
    getState,
    stage,
}) => {
    const powerTool = getState().game.powerTool;
    if (
        stage.draggingViewportInGrid
        || stage.draggingViewportInMiniMap
    ) {
        stage.scene.input.setDefaultCursor("all-scroll");
    } else if (powerTool == null) {
        stage.scene.input.setDefaultCursor("pointer");
    } else {
        stage.scene.input.setDefaultCursor("crosshair");
    }
};

const SetRedBoxVisibility = ({
    getState,
    stage,
}) => {
    stage.redBox.setVisible(
        getState().app.redBoxEnabled
        && (stage.lastX != null)
    );
};

const SetSpriteTexture = ({
    getState,
    stage,
    x,
    y,
    sprite,
}) => {
    const grid = getState().game.grid;
    const gameActive = getState().game.active;
    sprite.setTexture(
        "atlas",
        ComputeCellFrame({stage, gameActive, grid, x, y})
    );
    const cell = grid[y][x];
    if ((cell & GRID_CELL_DARKENED) === 0) {
        sprite.setTint(0xffffff);
    } else {
        sprite.setTint(stage.tinting);
    }
};

const StopSssSound = ({
    stage,
}) => {
    if (stage.sssSound != null) {
        stage.sssSound.destroy();
        stage.sssSound = null;
    }
    stage.sssStart = null;
}

const ToggleMarker = ({
    dispatch,
    getState,
    x,
    y,
}) => {
    const grid = getState().game.grid;
    const cell = grid[y][x] ^ GRID_CELL_TAGGED;
    dispatch(actions.ReflectGridUpdated({x, y, cell}));
};

const ToggleTint = ({
    dispatch,
    getState,
    stage,
    x,
    y,
}) => {
    const grid = getState().game.grid;
    const darkening = ((grid[y][x] & GRID_CELL_DARKENED) === 0);
    if (
        IsUncovered({grid, x, y})
        && !IsMinePresent({grid, x, y})
        && (darkening === stage.darkening)
    ) {
        const grid = getState().game.grid;
        const cell = grid[y][x] ^ GRID_CELL_DARKENED;
        dispatch(actions.ReflectGridUpdated({x, y, cell}));
    }
};

const UpdateMiniMap = ({
    getState,
    stage,
    x,
    y
}) => {
    console.log(`Update minimap for x:${x}, y:${y}`);
    const grid = getState().game.grid;
    const height = grid.length;
    const width = grid[0].length;
    const miniMapWidthRatio = (
        stage.miniMapRenderTexture.gl.drawingBufferWidth
        * 1 / Math.ceil(stage.miniMapRatio * width)
    );
    const miniMapHeightRatio = (
        stage.miniMapRenderTexture.gl.drawingBufferHeight
        * 1 / Math.ceil(stage.miniMapRatio * height)
    );
    if (stage.miniMapCellSize >= 1) {
        const color = (
            (
                IsUncovered({grid, x, y})
                || IsTagged({grid, x, y})
            )
            ? 0x000000
            : 0xffffff
        );
        stage.miniMapRenderTexture.fill(
            color, 1,
            x * stage.miniMapCellSize * miniMapWidthRatio,
            stage.miniMapRenderTexture.gl.drawingBufferHeight - ((y + 1) * stage.miniMapCellSize) * miniMapHeightRatio,
            stage.miniMapCellSize * miniMapWidthRatio,
            stage.miniMapCellSize * miniMapHeightRatio
        );
    } else {
        const cellsPerPixel = -stage.miniMapCellSize;
        const by = Math.floor(x / cellsPerPixel);
        const bx = Math.floor(y / cellsPerPixel);
        let totalCells = 0;
        let cellsUncovered = 0;
        for (let dy = 0; dy < cellsPerPixel; ++dy) {
            for (let dx = 0; dx < cellsPerPixel; ++dx) {
                const x = bx * cellsPerPixel + dx;
                const y = by * cellsPerPixel + dy;
                if (
                    (x < width)
                    && (y < height)
                ) {
                    ++totalCells;
                    if (
                        IsUncovered({grid, x, y})
                        || IsTagged({grid, x, y})
                    ) {
                        ++cellsUncovered;
                    }
                }
            }
        }
        const color = (
            (cellsUncovered > 0)
            ? (
                (cellsUncovered === totalCells)
                ? 0x000000
                : 0x808080
            )
            : 0xffffff
        );
        stage.miniMapRenderTexture.fill(
            color, 1,
            bx * miniMapWidthRatio,
            stage.miniMapRenderTexture.gl.drawingBufferHeight - (by + 1) * miniMapHeightRatio,
            stage.miniMapCellSize * miniMapWidthRatio,
            stage.miniMapCellSize * miniMapHeightRatio
        );
    }
};

const UpdateRedBoxPosition = ({
    getState,
    stage,
}) => {
    if (stage.lastX != null) {
        const tileScaledSize = TILE_SIZE * stage.tileScaling;
        stage.redBox.setX((stage.lastX - getState().game.offsetX + 0.5) * tileScaledSize);
        stage.redBox.setY((stage.lastY - getState().game.offsetY + 0.5) * tileScaledSize);
        stage.spriteContainer.remove(stage.redBox);
        stage.spriteContainer.add(stage.redBox);
    }
};

const UpdateTilePositionsAndScale = ({
    dispatch,
    getState,
    stage,
}) => {
    let offsetX = getState().game.offsetX;
    if (offsetX == null) {
        offsetX = 0;
    }
    let offsetY = getState().game.offsetY;
    if (offsetY == null) {
        offsetY = 0;
    }
    const viewportWidthInPixels = getState().game.width;
    const viewportHeightInPixels = getState().game.height;
    const grid = getState().game.grid;
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
    const viewportBottomOverflow = 1;
    offsetX = Clamp(
        offsetX,
        0,
        widthInTiles + viewportRightOverflow - viewportWidthInTiles
    );
    offsetY = Clamp(
        offsetY,
        0,
        heightInTiles + viewportBottomOverflow - viewportHeightInTiles
    );
    if (
        (offsetX !== getState().game.offsetX)
        || (offsetY !== getState().game.offsetY)
    ) {
        dispatch(actions.SetViewport({offsetX, offsetY}));
        return;
    }
    if (
        (newTileScaling !== stage.tileScaling)
        || (offsetX !== stage.offsetX)
        || (offsetY !== stage.offsetY)
        || (stage.baseTime == null)
    ) {
        stage.offsetX = offsetX;
        stage.offsetY = offsetY;
        stage.tileScaling = newTileScaling;
        if (stage.lastX != null) {
            stage.lastX += (offsetX - getState().game.offsetX);
            stage.lastY += (offsetY - getState().game.offsetY);
        }
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
                        stage.spriteContainer.add(sprite);
                        sprite.setOrigin(-0.5, -0.5);
                        sprite.setScale(stage.tileScaling);
                    } else {
                        sprite = stage.freeSprites.pop();
                        sprite.setTint(0xffffff);
                    }
                    SetSpriteTexture({getState, stage, x, y, sprite});
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
        || (offsetX > 0)
        || (offsetY > 0)
    ) {
        stage.miniMap.setPosition(
            viewportWidthInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN * 2,
            viewportHeightInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN * 2
        );
        stage.miniMap.width = MINI_MAP_SIZE + MINI_MAP_MARGIN;
        stage.miniMap.height = MINI_MAP_SIZE + MINI_MAP_MARGIN;
        const miniMapGrid = stage.scene.add.image(
            MINI_MAP_MARGIN,
            MINI_MAP_MARGIN,
            "minimap"
        );
        miniMapGrid.setOrigin(0, 0);
        miniMapGrid.setDepth(1);
        stage.miniMap.add(miniMapGrid);
        const miniMapViewport = stage.scene.add.graphics();
        miniMapViewport.lineStyle(1, 0xff0000, 1);
        miniMapViewport.strokeRect(
            Math.floor(MINI_MAP_MARGIN + viewportOffsetXPixels * stage.miniMapRatio / tileScaledSize),
            Math.floor(MINI_MAP_MARGIN + viewportOffsetYPixels * stage.miniMapRatio / tileScaledSize),
            Math.ceil(viewportWidthInPixels * stage.miniMapRatio / tileScaledSize),
            Math.ceil(viewportHeightInPixels * stage.miniMapRatio / tileScaledSize)
        );
        miniMapViewport.setDepth(1);
        stage.miniMap.add(miniMapViewport);
    }
    stage.redBox.setScale(newTileScaling);
    UpdateRedBoxPosition({getState, stage});
};

const OnActivateSss = ({
    action: {x, y},
    dispatch,
    getState,
    stage,
}) => {
    const grid = getState().game.grid;
    let cell = grid[y][x];
    if (getState().game.active) {
        stage.sssStart = stage.lastTimeRaw;
        if (getState().app.soundEnabled) {
            stage.sssSound = stage.scene.sound.addAudioSprite(
                "sss", {
                    volume: getState().app.soundLevel,
                    rate: 1.0
                }
            );
            stage.sssSound.play("0");
        }
        stage.sssPosition = {x, y};
        cell |= GRID_CELL_UNCOVERED;
    } else {
        cell &= ~GRID_CELL_SSS;
    }
    dispatch(actions.ReflectGridUpdated({x, y, cell}));
};

const OnDetonate = ({
    getState,
    stage,
}) => {
    if (
        getState().app.soundEnabled
        && (stage.shakeCount === 0)
        && (stage.detonationSound == null)
    ) {
        stage.detonationSound = stage.scene.sound.addAudioSprite(
            "boom", {
                volume: getState().app.soundLevel,
                rate: 1.0
            }
        );
        stage.detonationSound.play("0");
        stage.detonationSoundStart = stage.lastTimeRaw;
    }
    if (getState().app.shakeEnabled) {
        stage.shakeCount = DETONATION_SHAKE_COUNT;
    }
};

const OnDiffuseSss = ({
    dispatch,
    getState,
    stage,
}) => {
    if (stage.sssPosition != null) {
        const {x, y} = stage.sssPosition;
        const grid = getState().game.grid;
        const cell = grid[y][x] & ~GRID_CELL_SSS;
        stage.sssPosition = null;
        dispatch(actions.ReflectGridUpdated({x, y, cell}));
    }
    StopSssSound({stage});
};

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
        stage.tiles = null;
    }
    stage.freeSprites.forEach(sprite => sprite.destroy());
    stage.freeSprites = [];
    if (stage.redBox) {
        stage.redBox.destroy();
        stage.redBox = null;
    }
    if (stage.spriteContainer) {
        stage.spriteContainer.destroy();
        stage.spriteContainer = null;
    }
    stage.scene = null;
    stage.removeWheelListener();
    stage.removeWheelListener = null;
    stage.game.destroy(true);
    stage.game = null;
};

const OnPlayOrRestoreGame = ({
    dispatch,
    getState,
    stage,
}) => {
    StopSssSound({stage});
    stage.startingScore = getState().game.score;
    stage.baseTime = null;
    stage.offsetX = getState().game.offsetX;
    stage.offsetY = getState().game.offsetY;
    stage.miniMapInitialized = false;
    ComputeSpriteTint({getState, stage});
    if (stage.tiles) {
        DropTiles({getState, stage});
    }
    const grid = getState().game.grid;
    const height = grid.length;
    const width = grid[0].length;
    stage.tiles = [];
    for (let y = 0; y < height; ++y) {
        stage.tiles[y] = [];
        for (let x = 0; x < width; ++x) {
            stage.tiles[y][x] = null;
        }
    }
    UpdateTilePositionsAndScale({dispatch, getState, stage});
};

const OnReflectGridUpdated = ({
    action: {x, y},
    getState,
    stage,
}) => {
    const sprite = stage.tiles[y][x];
    if (sprite != null) {
        SetSpriteTexture({getState, stage, x, y, sprite});
    }
    UpdateMiniMap({getState, stage, x, y});
};

const OnReflectGridUpdatedBatch = ({
    action: {updates},
    getState,
    stage,
}) => {
    updates.forEach(({x, y}) => {
        const sprite = stage.tiles[y][x];
        if (sprite != null) {
            SetSpriteTexture({getState, stage, x, y, sprite});
        }
        UpdateMiniMap({getState, stage, x, y});
    });
};

const OnReflectStageSize = ({
    dispatch,
    getState,
    stage,
}) => {
    UpdateTilePositionsAndScale({dispatch, getState, stage});
};

const OnSelectPowerTool = ({
    getState,
    stage,
}) => {
    SetCursor({getState, stage});
}

const OnSetMinScaling = ({
    dispatch,
    getState,
    stage,
}) => {
    UpdateTilePositionsAndScale({dispatch, getState, stage});
};

const OnSetRedBoxEnabled = ({
    getState,
    stage,
}) => {
    SetRedBoxVisibility({getState, stage});
}

const OnSetTinting = ({
    getState,
    stage,
}) => {
    ComputeSpriteTint({getState, stage});
    const grid = getState().game.grid;
    WithAllGridCells(grid, (x, y) => {
        const sprite = stage.tiles[y][x];
        if (sprite != null) {
            SetSpriteTexture({getState, stage, x, y, sprite});
        }
    });
};

const OnSetViewport = ({
    dispatch,
    getState,
    stage,
}) => {
    UpdateTilePositionsAndScale({dispatch, getState, stage});
};

const OnShowStage = ({
    action: {parentId},
    dispatch,
    getState,
    onPhaserReady,
    stage,
}) => {
    stage.firstUpdate = true;
    stage.miniMapInitialized = false;
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
                    getState().game.width / (TILE_SIZE * stage.tileScaling)
                ),
                grid[0].length
            );
            const height = Math.min(
                Math.ceil(
                    getState().game.height / (TILE_SIZE * stage.tileScaling)
                ),
                grid.length
            );
            const dx = Math.max(1, Math.floor(width / SCROLL_UNITS_PER_PAGE_X));
            const dy = Math.max(1, Math.floor(height / SCROLL_UNITS_PER_PAGE_Y));
            dispatch(
                actions.SetViewport({
                    offsetX: getState().game.offsetX + dx * direction.x,
                    offsetY: getState().game.offsetY + dy * direction.y,
                })
            );
            e.preventDefault();
        }
    };
    const onPointerMove = (pointer) => {
        const viewportWidthInPixels = getState().game.width;
        const viewportHeightInPixels = getState().game.height;
        if (
            (pointer.x >= viewportWidthInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN)
            && (pointer.x < viewportWidthInPixels - MINI_MAP_MARGIN)
            && (pointer.y >= viewportHeightInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN)
            && (pointer.y < viewportHeightInPixels - MINI_MAP_MARGIN)
        ) {
            stage.lastX = null;
            stage.lastY = null;
            if (stage.draggingViewportInMiniMap) {
                DragViewportInMiniMap({dispatch, getState, stage, pointer});
            }
        } else {
            if (stage.draggingViewportInGrid) {
                DragViewportInGrid({dispatch, getState, stage, pointer});
            }
            const [x, y] = GridCoordinatesFromPointer({getState, pointer, stage});
            const grid = getState().game.grid;
            if (
                (x < grid[0].length)
                && (y < grid.length)
            ) {
                if (
                    (x !== stage.lastX)
                    || (y !== stage.lastY)
                ) {
                    if (stage.activeButton === 2) {
                        ToggleTint({dispatch, getState, stage, x: stage.lastX, y: stage.lastY});
                    }
                    stage.lastX = x;
                    stage.lastY = y;
                    UpdateRedBoxPosition({getState, stage});
                }
            } else {
                stage.lastX = null;
                stage.lastY = null;
            }
        }
        SetRedBoxVisibility({getState, stage});
    };
    const onPointerDown = (pointer) => {
        stage.draggingViewportInGrid = false;
        stage.draggingViewportInMiniMap = false;
        stage.togglingTint = false;
        const rightClick = (pointer.buttons === 2);
        const leftAndRightClick = (pointer.buttons === 3);
        const isAlt = pointer.event.altKey;
        if (
            isAlt
            || leftAndRightClick
        ) {
            stage.draggingViewportInGrid = true;
        } else {
            const viewportWidthInPixels = getState().game.width;
            const viewportHeightInPixels = getState().game.height;
            if (
                (pointer.x >= viewportWidthInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN)
                && (pointer.x < viewportWidthInPixels - MINI_MAP_MARGIN)
                && (pointer.y >= viewportHeightInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN)
                && (pointer.y < viewportHeightInPixels - MINI_MAP_MARGIN)
            ) {
                stage.draggingViewportInMiniMap = true;
                DragViewportInMiniMap({dispatch, getState, stage, pointer});
            }
        }
        stage.activeButton = pointer.buttons;
        SetCursor({getState, stage});
        if (!getState().game.active) {
            return;
        }
        const [x, y] = GridCoordinatesFromPointer({getState, pointer, stage});
        const grid = getState().game.grid;
        if (x >= grid[0].length) {
            return;
        }
        if (y >= grid.length) {
            return;
        }
        stage.lastButton = stage.activeButton;
        if (stage.activeButton === 1) {
            if (stage.lastButton === 1) {
                if (stage.lastLeftClickTime == null) {
                    stage.lastLeftClickTime = stage.lastTimeRaw;
                } else {
                    const timeBetweenClicks = stage.lastTimeRaw - stage.lastLeftClickTime;
                    if (timeBetweenClicks < DOUBLE_CLICK_THRESHOLD_MILLISECONDS) {
                        dispatch(actions.StepOnUntaggedNeighborsIfEnoughTagged({x, y}));
                        stage.lastLeftClickTime = null;
                    } else {
                        stage.lastLeftClickTime = stage.lastTimeRaw;
                    }
                }
            } else {
                stage.lastLeftClickTime = stage.lastTimeRaw;
            }
        } else {
            stage.lastLeftClickTime = null;
        }
        if (rightClick) {
            if (
                IsUncovered({grid, x, y})
                && !IsMinePresent({grid, x, y})
            ) {
                stage.togglingTint = true;
                stage.darkening = ((grid[y][x] & GRID_CELL_DARKENED) === 0);
            }
        }
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
        const wasTogglingTint = stage.togglingTint;
        stage.togglingTint = false;
        if (stage.draggingViewportInMiniMap) {
            stage.draggingViewportInMiniMap = false;
            SetCursor({getState, stage});
            return;
        }
        if (stage.draggingViewportInGrid) {
            stage.draggingViewportInGrid = false;
            SetCursor({getState, stage});
            return;
        }
        const viewportWidthInPixels = getState().game.width;
        const viewportHeightInPixels = getState().game.height;
        if (
            (pointer.x >= viewportWidthInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN)
            && (pointer.x < viewportWidthInPixels - MINI_MAP_MARGIN)
            && (pointer.y >= viewportHeightInPixels - MINI_MAP_SIZE - MINI_MAP_MARGIN)
            && (pointer.y < viewportHeightInPixels - MINI_MAP_MARGIN)
        ) {
            stage.draggingViewportInMiniMap = true;
            DragViewportInMiniMap({dispatch, getState, stage, pointer});
            return;
        }
        if (!getState().game.active) {
            return;
        }
        const [x, y] = GridCoordinatesFromPointer({getState, pointer, stage});
        const grid = getState().game.grid;
        if (x >= grid[0].length) {
            return;
        }
        if (y >= grid.length) {
            return;
        }
        const leftClick = (button === 1);
        const rightClick = (button === 2);
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
                if (!IsTagged({grid, x, y})) {
                    dispatch(actions.Step({x, y}));
                }
                if (
                    wasUncovered
                    && !IsMinePresent({grid, x, y})
                ) {
                    dispatch(actions.PickUp({x, y}));
                }
            } else {
                dispatch(actions.UsePowerTool({x, y}));
            }
        } else if (rightClick) {
            if (wasTogglingTint) {
                ToggleTint({dispatch, getState, stage, x, y});
            } else if (
                !IsUncovered({grid, x, y})
                || IsMinePresent({grid, x, y})
            ) {
                ToggleMarker({dispatch, getState, x, y});
            }
        }
    };
    const onPointerUpOutside = (pointer) => {
        stage.draggingViewportInGrid = false;
        stage.draggingViewportInMiniMap = false;
        stage.activeButton = null;
    };
    const onGameOut = () => {
        stage.lastX = null;
        stage.lastY = null;
        SetRedBoxVisibility({getState, stage});
    };
    const onMouseWheel = event => {
        const direction = (event.deltaY < 0) ? MOUSE_WHEEL_UP : MOUSE_WHEEL_DOWN;
        const x = event.offsetX;
        const y = event.offsetY;
        const oldTileScaledSize = TILE_SIZE * stage.tileScaling;
        const anchorX = Math.floor(x / oldTileScaledSize) + getState().game.offsetX;
        const anchorY = Math.floor(y / oldTileScaledSize) + getState().game.offsetY;
        let minScaling = getState().app.minScaling;
        if (direction === MOUSE_WHEEL_UP) {
            ++minScaling;
        } else {
            --minScaling;
        }
        minScaling = Clamp(minScaling, 1, MAX_TILE_SCALING);
        dispatch(actions.SetMinScaling({minScaling}));
        const newTileScaledSize = TILE_SIZE * stage.tileScaling;
        dispatch(
            actions.SetViewport({
                offsetX: anchorX - Math.floor(x / newTileScaledSize),
                offsetY: anchorY - Math.floor(y / newTileScaledSize),
            })
        );
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
        stage.scene.load.audioSprite("boom", "boom.json");
        stage.scene.load.audioSprite("sss", "sss.json");
    };
    const phaserCreate = function() {
        stage.baseTime = null;
        stage.time = null;
        stage.draggingViewportInMiniMap = false;
        stage.miniMap = stage.scene.add.container();
        stage.miniMap.setDepth(DEPTH_MINI_MAP);
        stage.miniMap.setAlpha(MINI_MAP_OPACITY);
        stage.spriteContainer = stage.scene.add.container();
        stage.spriteContainer.setDepth(DEPTH_SPRITE_CONTAINER);
        stage.redBox = stage.scene.add.graphics();
        stage.redBox.lineStyle(2, 0xff0000, 1);
        stage.redBox.strokeRect(
            -TILE_SIZE - 1,
            -TILE_SIZE - 1,
            TILE_SIZE * 3 + 2,
            TILE_SIZE * 3 + 2
        );
        stage.spriteContainer.add(stage.redBox);
        SetRedBoxVisibility({getState, stage});
        onPhaserReady();
        stage.scene.input.keyboard.on("keydown", onKeyDown);
        stage.scene.input.on("pointermove", onPointerMove);
        stage.scene.input.on("pointerdown", onPointerDown);
        stage.scene.input.on("pointerup", onPointerUp);
        stage.scene.input.on("pointerupoutside", onPointerUpOutside);
        stage.scene.input.on("gameout", onGameOut);
        document.getElementById(parentId).addEventListener("wheel", onMouseWheel);
        stage.removeWheelListener = () => {
            document.getElementById(parentId).removeEventListener("wheel", onMouseWheel);
        };
        stage.scene.input.topOnly = false;
        stage.scene.input.setDefaultCursor("pointer");
        stage.activeButton = null;
        SetCursor({getState, stage});
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
                dispatch(actions.ReflectScore({score: stage.startingScore + stage.time}));
            }
        }
        if (stage.detonationSoundStart != null) {
            if (time - stage.detonationSoundStart > DETONATION_SOUND_DURATION) {
                stage.detonationSound.destroy();
                stage.detonationSound = null;
                stage.detonationSoundStart = null;
            }
        }
        if (stage.sssStart != null) {
            if (time - stage.sssStart > SSS_SOUND_DURATION) {
                const sssPosition = stage.sssPosition;
                if (stage.sssSound != null) {
                    stage.sssSound.destroy();
                    stage.sssSound = null;
                }
                stage.sssStart = null;
                dispatch(actions.TakeDamage());
                dispatch(actions.Detonate(sssPosition));
            } else if (
                Math.floor((time - stage.sssStart) / SSS_FLASH_PERIOD)
                !== Math.floor((stage.lastTimeRaw - stage.sssStart) / SSS_FLASH_PERIOD)
            ) {
                const {x, y} = stage.sssPosition;
                const grid = getState().game.grid;
                const cell = grid[y][x];
                dispatch(actions.ReflectGridUpdated({x, y, cell}));
            }
        }
        if (stage.shakeCount > 0) {
            if (--stage.shakeCount === 0) {
                stage.spriteContainer.setX(0);
                stage.spriteContainer.setY(0);
            } else {
                stage.spriteContainer.setX(Math.floor(Math.random() * SHAKE_MAX_DISTANCE));
                stage.spriteContainer.setY(Math.floor(Math.random() * SHAKE_MAX_DISTANCE));
            }
        }
        if (
            !stage.miniMapInitialized
            && !stage.firstUpdate
        ) {
            stage.miniMapInitialized = true;
            const grid = getState().game.grid;
            const height = grid.length;
            const width = grid[0].length;
            const miniMapGridRatio = Math.min(
                MINI_MAP_SIZE / width,
                MINI_MAP_SIZE / height
            );
            if (miniMapGridRatio >= 1) {
                stage.miniMapRatio = Math.floor(miniMapGridRatio);
                stage.miniMapCellSize = stage.miniMapRatio;
            } else {
                stage.miniMapCellSize = -Math.ceil(1 / miniMapGridRatio);
                stage.miniMapRatio = 1 / -stage.miniMapCellSize;
            }
            console.log(`ratio: ${stage.miniMapRatio}`)
            console.log(`cell: ${stage.miniMapCellSize}`)
            stage.miniMapRenderTexture = stage.scene.add.renderTexture(
                0, 0,
                Math.ceil(stage.miniMapRatio * width),
                Math.ceil(stage.miniMapRatio * height)
            );
            stage.miniMapRenderTexture.setVisible(false);
            stage.miniMapRenderTexture.saveTexture("minimap");
            const miniMapWidth = Math.ceil(stage.miniMapRatio * width);
            const miniMapWidthRatio = (
                stage.miniMapRenderTexture.gl.drawingBufferWidth
                * 1 / miniMapWidth
            );
            const miniMapHeight = Math.ceil(stage.miniMapRatio * height);
            const miniMapHeightRatio = (
                stage.miniMapRenderTexture.gl.drawingBufferHeight
                * 1 / miniMapHeight
            );
            stage.miniMapRenderTexture.fill(
                0xffffff, 1,
                0, 0,
                stage.miniMapRenderTexture.gl.drawingBufferWidth,
                stage.miniMapRenderTexture.gl.drawingBufferHeight,
            );
            if (stage.miniMapCellSize >= 1) {
                WithAllGridCells(grid, (x, y) => {
                    if (
                        IsUncovered({grid, x, y})
                        || IsTagged({grid, x, y})
                    ) {
                        stage.miniMapRenderTexture.fill(
                            0x000000, 1,
                            x * stage.miniMapCellSize * miniMapWidthRatio,
                            stage.miniMapRenderTexture.gl.drawingBufferHeight - ((y + 1) * stage.miniMapCellSize) * miniMapHeightRatio,
                            stage.miniMapCellSize * miniMapWidthRatio,
                            stage.miniMapCellSize * miniMapHeightRatio
                        );
                    }
                });
            } else {
                const cellsPerPixel = -stage.miniMapCellSize;
                for (let by = 0; by < miniMapHeight; ++by) {
                    for (let bx = 0; bx < miniMapWidth; ++bx) {
                        let totalCells = 0;
                        let cellsUncovered = 0;
                        for (let dy = 0; dy < cellsPerPixel; ++dy) {
                            for (let dx = 0; dx < cellsPerPixel; ++dx) {
                                const x = bx * cellsPerPixel + dx;
                                const y = by * cellsPerPixel + dy;
                                if (
                                    (x < width)
                                    && (y < height)
                                ) {
                                    ++totalCells;
                                    if (
                                        IsUncovered({grid, x, y})
                                        || IsTagged({grid, x, y})
                                    ) {
                                        ++cellsUncovered;
                                    }
                                }
                            }
                        }
                        if (cellsUncovered > 0) {
                            const color = (
                                (cellsUncovered === totalCells)
                                ? 0x000000
                                : 0x808080
                            );
                            stage.miniMapRenderTexture.fill(
                                color, 1,
                                bx * miniMapWidthRatio,
                                stage.miniMapRenderTexture.gl.drawingBufferHeight - (by + 1) * miniMapHeightRatio,
                                stage.miniMapCellSize * miniMapWidthRatio,
                                stage.miniMapCellSize * miniMapHeightRatio
                            );
                        }
                    }
                }
            }
            UpdateTilePositionsAndScale({dispatch, getState, stage});
        }
        stage.lastTimeRaw = time;
        stage.firstUpdate = false;
    };
    const config = {
        type: Phaser.AUTO,
        input: {
            keyboard: true,
            mouse: true,
            touch: true,
        },
        miniMap: null,
        parent: parentId,
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
    [actionTypes.ActivateSss]: OnActivateSss,
    [actionTypes.Detonate]: OnDetonate,
    [actionTypes.DiffuseSss]: OnDiffuseSss,
    [actionTypes.HideStage]: OnHideStage,
    [actionTypes.Play]: OnPlayOrRestoreGame,
    [actionTypes.ReflectGridUpdated]: OnReflectGridUpdated,
    [actionTypes.ReflectGridUpdatedBatch]: OnReflectGridUpdatedBatch,
    [actionTypes.ReflectStageSize]: OnReflectStageSize,
    [actionTypes.RestoreGame]: OnPlayOrRestoreGame,
    [actionTypes.SelectPowerTool]: OnSelectPowerTool,
    [actionTypes.SetMinScaling]: OnSetMinScaling,
    [actionTypes.SetRedBoxEnabled]: OnSetRedBoxEnabled,
    [actionTypes.SetTinting]: OnSetTinting,
    [actionTypes.SetViewport]: OnSetViewport,
    [actionTypes.ShowStage]: OnShowStage,
};

export default function({ getState, dispatch }) {
    const stage = {
        activeButton: null,
        baseTime: null,
        darkening: false,
        detonationSound: null,
        detonationSoundStart: null,
        draggingViewportInGrid: false,
        draggingViewportInMiniMap: false,
        firstUpdate: true,
        freeSprites: [],
        game: null,
        lastButton: null,
        lastLeftClickTime: null,
        lastTime: 0,
        lastTimeRaw: 0,
        lastX: null,
        lastY: null,
        miniMapCellSize: 1,
        miniMapInitialized: false,
        miniMapRatio: 1,
        miniMapRenderTexture: null,
        offsetX: 0,
        offsetY: 0,
        ready: false,
        redBox: null,
        removeWheelListener: null,
        scene: null,
        shakeCount: 0,
        spriteContainer: null,
        sssPosition: null,
        sssSound: null,
        sssStart: null,
        startingScore: 0,
        tiles: null,
        tileScaling: 1,
        time: null,
        tinting: 0xffffff,
        togglingTint: false,
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
                // @ts-ignore
                dispatch,
                getState,
                // @ts-ignore
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
}
