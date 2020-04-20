import { actionTypes, actions } from "../actions";

import {
    ComputeNeighborMines,
    IsMinePresent,
    IsUncovered,
    WithNeighbors,
} from "../Utilities";

import {
    GRID_CELL_MINE_EXPLODED,
    GRID_CELL_UNCOVERED,
} from "../constants";

const OnStep = ({
    action: {x, y},
    dispatch,
    getState,
}) => {
    const grid = getState().game.grid;
    let cell = grid[y][x] | GRID_CELL_UNCOVERED;
    dispatch(actions.ReflectGridUpdated({x, y, cell}));
    if (IsMinePresent({grid, x, y})) {
        cell = grid[y][x] | GRID_CELL_MINE_EXPLODED;
        dispatch(actions.ReflectGridUpdated({x, y, cell}));
        dispatch(actions.GameLost());
    } else {
        if (ComputeNeighborMines({grid, x, y}) === 0) {
            WithNeighbors({x, y, fn: (x, y) => {
                if (!IsUncovered({grid, x, y})) {
                    dispatch(actions.Step({x, y}));
                }
            }});
        }
    }
};

const handlers = {
    [actionTypes.Step]: OnStep,
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
