import { actionTypes, actions } from "../actions";

import {
    ACTIVITY_PLAY,
    ACTIVITY_SELECT_LEVEL,
    MODAL_ABOUT,
    MODAL_RELEASE_NOTES,
} from "../constants";

const OnPlay = ({dispatch}) => {
    dispatch(actions.SetActivity({activity: ACTIVITY_PLAY}));
};

const OnQuit = ({dispatch}) => {
    dispatch(actions.SetActivity({activity: ACTIVITY_SELECT_LEVEL}));
};

const OnShowAbout = ({dispatch}) => {
    dispatch(actions.PushModal({which: MODAL_ABOUT}));
};

const OnShowReleaseNotes = ({dispatch}) => {
    dispatch(actions.PushModal({which: MODAL_RELEASE_NOTES}));
};

const handlers = {
    [actionTypes.Play]: OnPlay,
    [actionTypes.Quit]: OnQuit,
    [actionTypes.ShowAbout]: OnShowAbout,
    [actionTypes.ShowReleaseNotes]: OnShowReleaseNotes,
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
