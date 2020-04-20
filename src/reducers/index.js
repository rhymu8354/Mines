import { combineReducers } from "redux";

import app from "./App";
import game from "./Game";
import modal from "./Modal";

export default combineReducers({
    app,
    game,
    modal,
});
