import { actionTypes, actions } from "../actions";

import {
    ComputeNeighborMines,
    ComputeNeighborTags,
    IsMinePresent,
    IsTagged,
    IsUncovered,
    WithAllGridCells,
    WithNeighborGridCells,
} from "../Utilities";

import {
    GRID_CELL_MINE_EXPLODED,
    GRID_CELL_MINE_PRESENT,
    GRID_CELL_TAGGED,
    GRID_CELL_UNCOVERED,
} from "../constants";

const StepOnNeighbors = ({
    dispatch,
    grid, x, y
}) => {
    WithNeighborGridCells({grid, x, y, fn: (x, y) => {
        if (!IsUncovered({grid, x, y})) {
            dispatch(actions.StepIfNotTagged({x, y}));
        }
    }});
};

const PlaceMineSomewhereExcept = ({
    dispatch,
    grid,
    except: {x: exceptX, y: exceptY},
}) => {
    const height = grid.length;
    const width = grid[0].length;
    let needMine = true;
    while (needMine) {
        let x = Math.floor(Math.random() * width);
        let y = Math.floor(Math.random() * height);
        if (
            (x === exceptX)
            && (y === exceptY)
        ) {
            continue;
        }
        if (!IsMinePresent({grid, x, y})) {
            const cell = grid[y][x] | GRID_CELL_MINE_PRESENT;
            dispatch(actions.ReflectGridUpdated({x, y, cell}));
            needMine = false;
        }
    }
};

const OnGameLost = ({
    dispatch,
    getState,
}) => {
    const grid = getState().game.grid;
    WithAllGridCells(grid, (x, y) => {
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
    WithAllGridCells(grid, (x, y) => {
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
    const minePresent = IsMinePresent({grid, x, y});
    let cell = grid[y][x] | GRID_CELL_UNCOVERED;
    if (!minePresent) {
        dispatch(actions.ReflectGridUpdated({x, y, cell}));
    }
    if (
        minePresent
        && (getState().game.cellsCleared > 0)
    ) {
        cell = grid[y][x] | GRID_CELL_MINE_EXPLODED;
        dispatch(actions.ReflectGridUpdated({x, y, cell}));
        dispatch(actions.GameLost());
    } else {
        if (minePresent) {
            cell &= ~GRID_CELL_MINE_PRESENT;
            PlaceMineSomewhereExcept({dispatch, grid, except: {x, y}});
        }
        dispatch(actions.ReflectGridUpdated({x, y, cell}));
        if (ComputeNeighborMines({grid, x, y}) === 0) {
            StepOnNeighbors({dispatch, grid, x, y});
        }
        if (getState().game.cellsToClear === 0) {
            dispatch(actions.GameWon());
        }
    }
};

const OnStepOnUntaggedNeighborsIfEnoughTagged = ({
    action: {x, y},
    dispatch,
    getState,
}) => {
    const grid = getState().game.grid;
    if (IsTagged({grid, x, y})) {
        return;
    }
    if (!IsUncovered({grid, x, y})) {
        return;
    }
    const neighborMines = ComputeNeighborMines({grid, x, y});
    const neighborTags = ComputeNeighborTags({grid, x, y});
    if (neighborTags >= neighborMines) {
        StepOnNeighbors({dispatch, grid, x, y});
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
    [actionTypes.StepOnUntaggedNeighborsIfEnoughTagged]: OnStepOnUntaggedNeighborsIfEnoughTagged,
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
