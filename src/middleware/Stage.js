import Phaser from 'phaser';

import { actionTypes, actions } from "../actions";

import {
    STAGE_WIDTH_PIXELS,
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

const StartLoader = (stage) => {
    stage.loading = true;
    stage.scene.load.start();
};

const OnHideStage = ({
    onPhaserNotReady,
    stage,
}) => {
    onPhaserNotReady();
    if (stage.debug) {
        stage.debug.destroy();
        stage.debug = null;
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
        // stage.scene.load.multiatlas("arrows", "arrows.json");
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
        // stage.scene.input.mouse.disableContextMenu();
        stage.scene.input.keyboard.on("keydown", onKeyDown);
        stage.scene.input.on("pointermove", onPointerMove);
        stage.scene.input.on("pointerdown", onPointerDown);
        stage.scene.input.on("gameout", onGameOut);
        stage.scene.input.topOnly = false;
    };
    const phaserUpdate = function(time) {
        if (stage.loading) {
            return;
        }
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
            update: phaserUpdate,
        }
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
        loading: false,
        pointerOver: false,
        ready: false,
        scene: null,
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
            stage.loading = false;
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
                && (!stage.ready || stage.loading)
            ) {
                deferredActions.push(callHandler);
            } else {
                callHandler();
            }
        }
    };
};
