import Phaser from "phaser";

import { actionTypes } from "../actions";

import {
    STAGE_WIDTH_TILES,
    STAGE_HEIGHT_TILES,
    TILE_SIZE,
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

const OnReflectStageSize = ({
    getState,
    stage,
}) => {
    const width = getState().app.width;
    const height = getState().app.height;
    stage.game.scale.setGameSize(width, height);
    const newTileScaling = Math.min(
        Math.floor(width / (TILE_SIZE * STAGE_WIDTH_TILES)),
        Math.floor(height / (TILE_SIZE * STAGE_HEIGHT_TILES)),
    );
    if (newTileScaling !== stage.tileScaling) {
        stage.tileScaling = newTileScaling;
        const tileScaledSize = TILE_SIZE * stage.tileScaling;
        for (let y = 0; y < STAGE_HEIGHT_TILES; ++y) {
            for (let x = 0; x < STAGE_WIDTH_TILES; ++x) {
                const sprite = stage.tiles[y][x];
                sprite.setX(x * tileScaledSize);
                sprite.setY(y * tileScaledSize);
                sprite.setScale(stage.tileScaling);
            }
        }
    }
    console.log(`scaling factor: ${stage.tileScaling}`);
};

const OnShowStage = ({
    onPhaserReady,
    stage,
}) => {
    const onKeyDown = (e) => {
    };
    const onPointerMove = (pointer) => {
        stage.pointerOver = true;
    };
    const onPointerDown = (pointer) => {
        const tileScaledSize = TILE_SIZE * stage.tileScaling;
        const x = Math.floor(pointer.x / tileScaledSize);
        const y = Math.floor(pointer.y / tileScaledSize);
        stage.tiles[y][x].setTexture("atlas", 1);
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
        onPhaserReady();
        for (let y = 0; y < STAGE_HEIGHT_TILES; ++y) {
            stage.tiles[y] = [];
            for (let x = 0; x < STAGE_WIDTH_TILES; ++x) {
                const sprite = stage.scene.add.sprite(
                    x * tileScaledSize,
                    y * tileScaledSize
                );
                sprite.setTexture("atlas", 0);
                sprite.setOrigin(0, 0);
                sprite.setScale(stage.tileScaling);
                stage.tiles[y][x] = sprite;
            }
        }
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
        width: STAGE_WIDTH_TILES * TILE_SIZE,
        height: STAGE_HEIGHT_TILES * TILE_SIZE,
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
