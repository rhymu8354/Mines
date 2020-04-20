import { actionTypes } from "../actions";

import {
    ACTIVITY_SELECT_LEVEL,
} from "../constants";

const initialState = {
    activity: ACTIVITY_SELECT_LEVEL,
    width: 1,
    height: 1,
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
        default:
            return state;
    }
}
