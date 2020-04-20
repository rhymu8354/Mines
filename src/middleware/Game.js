import { actionTypes, actions } from "../actions";

import {
    ComputeNeighborMines,
    IsMinePresent,
    IsTagged,
    IsUncovered,
    WithAllGridCells,
    WithNeighborGridCells,
} from "../Utilities";

import {
    GRID_CELL_MINE_EXPLODED,
    GRID_CELL_TAGGED,
    GRID_CELL_UNCOVERED,
} from "../constants";

const OnGameLost = ({
    dispatch,
    getState,
}) => {
    const grid = getState().game.grid;
    WithAllGridCells((x, y) => {
        let cell = grid[y][x];
        if (IsMinePresent({grid, x, y})) {
            if (!IsUncovered({grid, x, y})) {
                cell |= GRID_CELL_UNCOVERED;
            }
        } else if (IsTagged({grid, x, y})) {
            // Refresh the tile for any mis-tagged cell.
            // When the game is over, the "mis-tagged" tile replaces
            // the "tag" tile, even though the cell didn't change.
            dispatch(actions.ReflectGridUpdated({x, y, cell}));
        }
        if (cell !== grid[y][x]) {
            dispatch(actions.ReflectGridUpdated({x, y, cell}));
        }
    });
};

const OnGameWon = ({
    dispatch,
    getState,
}) => {
    const grid = getState().game.grid;
    WithAllGridCells((x, y) => {
        let cell = grid[y][x];
        if (IsMinePresent({grid, x, y})) {
            if (!IsTagged({grid, x, y})) {
                cell |= GRID_CELL_UNCOVERED;
            }
        }
        if (cell !== grid[y][x]) {
            dispatch(actions.ReflectGridUpdated({x, y, cell}));
        }
    });
};

const OnStepIfNotTagged = ({
    action: {x, y},
    dispatch,
    getState,
}) => {
    const grid = getState().game.grid;
    if (IsTagged({grid, x, y})) {
        return;
    }
    let cell = grid[y][x] | GRID_CELL_UNCOVERED;
    dispatch(actions.ReflectGridUpdated({x, y, cell}));
    if (IsMinePresent({grid, x, y})) {
        cell = grid[y][x] | GRID_CELL_MINE_EXPLODED;
        dispatch(actions.ReflectGridUpdated({x, y, cell}));
        dispatch(actions.GameLost());
    } else {
        if (ComputeNeighborMines({grid, x, y}) === 0) {
            WithNeighborGridCells({x, y, fn: (x, y) => {
                if (!IsUncovered({grid, x, y})) {
                    dispatch(actions.StepIfNotTagged({x, y}));
                }
            }});
        }
        if (getState().game.cellsToClear === 0) {
            dispatch(actions.GameWon());
        }
    }
};

const OnToggleMarker = ({
    action: {x, y},
    dispatch,
    getState,
}) => {
    const grid = getState().game.grid;
    if (IsUncovered({grid, x, y})) {
        return;
    }
    const cell = grid[y][x] ^ GRID_CELL_TAGGED;
    dispatch(actions.ReflectGridUpdated({x, y, cell}));
};

const handlers = {
    [actionTypes.GameLost]: OnGameLost,
    [actionTypes.GameWon]: OnGameWon,
    [actionTypes.StepIfNotTagged]: OnStepIfNotTagged,
    [actionTypes.ToggleMarker]: OnToggleMarker,
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
