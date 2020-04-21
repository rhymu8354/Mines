import { actionTypes } from "../actions";

import {
    ACTIVITY_SELECT_LEVEL,
} from "../constants";

const initialState = {
    activity: ACTIVITY_SELECT_LEVEL,
    width: 1,
    height: 1,
    minScaling: 2,
};

export default function (state = initialState, action) {
    switch (action.type) {
        case actionTypes.ReflectStageSize:
            return {
                ...state,
                width: action.width,
                height: action.height,
            };
        case actionTypes.SetActivity:
            return {
                ...state,
                activity: action.activity,
            };
        case actionTypes.SetMinScaling:
            return {
                ...state,
                minScaling: action.minScaling,
            };
        default:
            return state;
    }
}
