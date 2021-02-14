import Pako from "pako";

import { actionTypes, actions } from "../actions";

import {
    ACTIVITY_PLAY,
    ACTIVITY_SELECT_LEVEL,
    BONUS_GAME_MINES,
    BONUS_GAME_HEIGHT,
    BONUS_GAME_WIDTH,
    LOCAL_STORAGE_SAVED_GAME,
    MODAL_ABOUT,
    MODAL_RELEASE_NOTES,
} from "../constants";

const CompressGame = uncompressedGameState => {
    return btoa(
        Pako.deflate(
            JSON.stringify(uncompressedGameState),
            {"to": "string"}
        )
    );
};

const DecompressGame = compressedGameState => {
    return JSON.parse(
        Pako.inflate(
            atob(compressedGameState),
            {"to": "string"}
        )
    );
};

const OnDropSavedGame = () => {
    localStorage.removeItem(LOCAL_STORAGE_SAVED_GAME);
};

const OnPlay = ({dispatch}) => {
    dispatch(actions.SetActivity({activity: ACTIVITY_PLAY}));
};

const OnQuit = ({
    dispatch,
    getState,
}) => {
    const gameStack = getState().app.gameStack;
    if (gameStack.length === 0) {
        dispatch(actions.SetActivity({activity: ACTIVITY_SELECT_LEVEL}));
    } else {
        const bonusPower = (
            (
                !getState().game.active
                && !getState().game.lost
            )
            ? getState().app.bonusPower
            : 0
        );
        dispatch(actions.RestoreGame({
            game: DecompressGame(gameStack[gameStack.length - 1])
        }));
        dispatch(actions.AddPower({power: bonusPower}));
        dispatch(actions.PopGame());
    }
};

const OnRestoreSavedGame = ({
    dispatch,
    getState,
}) => {
    dispatch(actions.SetActivity({activity: ACTIVITY_PLAY}));
    dispatch(actions.RestoreGame({game: DecompressGame(getState().app.savedGame)}));
};

const OnSave = ({
    dispatch,
    getState,
}) => {
    const compressedGameState = CompressGame(getState().game);
    localStorage.setItem(LOCAL_STORAGE_SAVED_GAME, compressedGameState);
    dispatch(actions.ReflectSavedGame({game: compressedGameState}));
    dispatch(actions.Quit());
};

const OnShowAbout = ({dispatch}) => {
    dispatch(actions.PushModal({which: MODAL_ABOUT}));
};

const OnShowReleaseNotes = ({dispatch}) => {
    dispatch(actions.PushModal({which: MODAL_RELEASE_NOTES}));
};

const OnStartBonusGame = ({
    dispatch,
    getState,
}) => {
    const game = CompressGame(getState().game);
    dispatch(actions.PushGame({game}));
    dispatch(actions.Play({
        numMines: BONUS_GAME_MINES,
        numPower: 0,
        numBonus: 0,
        showArmor: false,
        startArmor: 0,
        startPower: 0,
        width: BONUS_GAME_WIDTH,
        height: BONUS_GAME_HEIGHT,
    }));
};

const handlers = {
    [actionTypes.DropSavedGame]: OnDropSavedGame,
    [actionTypes.Play]: OnPlay,
    [actionTypes.Quit]: OnQuit,
    [actionTypes.RestoreSavedGame]: OnRestoreSavedGame,
    [actionTypes.Save]: OnSave,
    [actionTypes.ShowAbout]: OnShowAbout,
    [actionTypes.ShowReleaseNotes]: OnShowReleaseNotes,
    [actionTypes.StartBonusGame]: OnStartBonusGame,
};

export default function({ getState, dispatch }) {
    return next => action => {
        next(action);
        const handler = handlers[action.type];
        if (handler) {
            // @ts-ignore
            handler({dispatch, action, getState});
        }
    };
};
