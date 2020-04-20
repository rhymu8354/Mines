import { actionTypes } from "../actions";

import {
    ACTIVITY_SELECT_LEVEL,
} from "../constants";

const initialState = {
    activity: ACTIVITY_SELECT_LEVEL,
};

export default function (state = initialState, action) {
    switch (action.type) {
        case actionTypes.SetActivity:
            return {
                ...state,
                activity: action.activity,
            };
        default:
            return state;
    }
}
