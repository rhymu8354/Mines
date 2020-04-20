import { actionTypes } from "../actions";

const initialState = {
    stack: [],
};
export default function (state = initialState, action) {
    switch (action.type) {
        case actionTypes.PopModal:
            return {
                ...state,
                stack: state.stack.slice(0, state.stack.length - 1),
            };
        case actionTypes.PushModal:
            return {
                ...state,
                stack: [
                    ...state.stack,
                    {
                        which: action.which,
                        args: action.args,
                    }
                ],
            };
        default:
            return state;
    }
}
