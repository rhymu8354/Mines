import Phaser from "phaser";

import { actionTypes } from "../actions";

import {
    STAGE_WIDTH_TILES,
    STAGE_WIDTH_PIXELS,
    STAGE_HEIGHT_TILES,
    STAGE_HEIGHT_PIXELS,
    TILE_SIZE,
} from "../constants";

const defaultFont = {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: 20,
    fontWeight: "normal",
    color: "#fff",
};

const DEPTH_DEBUG = 0;

const OnHideStage = ({
    onPhaserNotReady,
    stage,
}) => {
    onPhaserNotReady();
    if (stage.debug) {
        stage.debug.destroy();
        stage.debug = null;
    }
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
        if (stage.debug) {
            stage.debug.setText(`X: ${pointer.x} (${Math.floor(pointer.x / TILE_SIZE)})  Y:${pointer.y} (${Math.floor(pointer.y / TILE_SIZE)})`);
        }
    };
    const onPointerDown = (pointer) => {
        const x = Math.floor(pointer.x / TILE_SIZE);
        const y = Math.floor(pointer.y / TILE_SIZE);
        stage.tiles[y][x].setTexture("atlas", 1);
    };
    const onGameOut = () => {
        stage.pointerOver = false;
        if (stage.debug) {
            stage.debug.setText("");
        }
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
        onPhaserReady();
        stage.debug = stage.scene.add.text(
            8,
            STAGE_HEIGHT_PIXELS,
            "",
            defaultFont
        );
        stage.debug
            .setOrigin(0, 1)
            .setStroke("#000", 5)
            .setDepth(DEPTH_DEBUG);
        for (let y = 0; y < STAGE_HEIGHT_TILES; ++y) {
            stage.tiles[y] = [];
            for (let x = 0; x < STAGE_WIDTH_TILES; ++x) {
                const sprite = stage.scene.add.sprite(
                    x * TILE_SIZE,
                    y * TILE_SIZE
                );
                sprite.setTexture("atlas", 0);
                sprite.setOrigin(0, 0);
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
        width: STAGE_WIDTH_PIXELS,
        height: STAGE_HEIGHT_PIXELS,
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
