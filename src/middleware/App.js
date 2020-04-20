import { actionTypes, actions } from "../actions";

const OnLoad = ({dispatch}) => {
    dispatch(actions.ShowStage());
};

const handlers = {
    [actionTypes.Load]: OnLoad,
};

export default function({ getState, dispatch }) {
    return next => action => {
        next(action);
        const handler = handlers[action.type];
        if (handler) {
            handler({dispatch, action, getState});
        }
    };
};
