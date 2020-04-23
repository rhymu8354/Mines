import { actionTypes, actions } from "../actions";

import {
    ComputeNeighborMines,
    ComputeNeighborTags,
    IsMineExploded,
    IsMinePresent,
    IsTagged,
    IsUncovered,
    WithAllGridCells,
    WithCellsWithinRange,
    WithNeighborGridCells,
} from "../Utilities";

import {
    DETONATION_REVEAL_RANGE,
    DETONATOR_RANGE,
    GRID_CELL_MINE_EXPLODED,
    GRID_CELL_MINE_PRESENT,
    GRID_CELL_POWER,
    GRID_CELL_TAGGED,
    GRID_CELL_UNCOVERED,
    POWER_COSTS,
    POWER_TOOL_DETONATOR,
    POWER_TOOL_PROBE,
    PROBE_RANGE,
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

const UntagIfTagged = ({
    dispatch,
    grid,
    x,
    y
}) => {
    let cell = grid[y][x];
    if ((cell & GRID_CELL_TAGGED) !== 0) {
        cell &= ~GRID_CELL_TAGGED;
        dispatch(actions.ReflectGridUpdated({x, y, cell}));
    }
};

const UseDetonator = ({
    dispatch,
    getState,
    x,
    y,
}) => {
    const grid = getState().game.grid;
    WithCellsWithinRange({grid, x, y, range: DETONATOR_RANGE, fn: (x, y) => {
        UntagIfTagged({dispatch, grid, x, y});
        Detonate({dispatch, grid, x, y});
    }});
};

const UseProbe = ({
    dispatch,
    getState,
    x,
    y,
}) => {
    const grid = getState().game.grid;
    WithCellsWithinRange({grid, x, y, range: PROBE_RANGE, fn: (x, y) => {
        UntagIfTagged({dispatch, grid, x, y});
        if (IsMinePresent({grid, x, y})) {
            let cell = grid[y][x];
            if ((cell & GRID_CELL_UNCOVERED) === 0) {
                cell |= GRID_CELL_UNCOVERED;
                dispatch(actions.ReflectGridUpdated({x, y, cell}));
            }
        } else {
            dispatch(actions.StepIfNotTagged({x, y}));
        }
    }});
};

const Detonate = ({
    dispatch,
    grid,
    x,
    y,
}) => {
    if (IsMinePresent({grid, x, y})) {
        if (!IsMineExploded({grid, x, y})) {
            dispatch(actions.Detonate({x, y}));
        }
    } else {
        dispatch(actions.StepIfNotTagged({x, y}));
    }
};

const powerToolHandlers = {
    [POWER_TOOL_DETONATOR]: UseDetonator,
    [POWER_TOOL_PROBE]: UseProbe,
};

const OnDetonate = ({
    action: {x, y},
    dispatch,
    getState,
}) => {
    const grid = getState().game.grid;
    let cell = grid[y][x];
    cell |= GRID_CELL_UNCOVERED;
    cell |= GRID_CELL_MINE_EXPLODED;
    dispatch(actions.ReflectGridUpdated({x, y, cell}));
    WithCellsWithinRange({grid, x, y, range: DETONATION_REVEAL_RANGE, fn: (x, y) => {
        UntagIfTagged({dispatch, grid, x, y});
        Detonate({dispatch, grid, x, y});
    }});
};

const OnGameLost = ({
    dispatch,
    getState,
}) => {
    const grid = getState().game.grid;
    const updates = [
    ];
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
            updates.push({x, y, cell});
        }
        if (cell !== grid[y][x]) {
            updates.push({x, y, cell});
        }
    });
    if (updates.length > 0) {
        dispatch(actions.ReflectGridUpdatedBatch({updates}));
    }
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

const OnPickUp = ({
    action: {x, y},
    dispatch,
    getState,
}) => {
    const grid = getState().game.grid;
    let cell = grid[y][x];
    if ((grid[y][x] & GRID_CELL_POWER) !== 0) {
        cell &= ~GRID_CELL_POWER;
        dispatch(actions.ReflectGridUpdated({x, y, cell}));
        dispatch(actions.AddPower({power: 1}));
    }
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
        && !IsMineExploded({grid, x, y})
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

const OnUsePowerTool = ({
    action: {x, y},
    dispatch,
    getState,
}) => {
    const powerTool = getState().game.powerTool;
    const powerCollected = getState().game.powerCollected;
    const powerCost = POWER_COSTS[powerTool];
    if (powerCollected >= powerCost) {
        const powerToolHandler = powerToolHandlers[powerTool];
        if (powerToolHandler) {
            dispatch(actions.AddPower({power: -powerCost}));
            dispatch(actions.SelectPowerTool({powerTool: null}));
            powerToolHandler({dispatch, getState, x, y});
        }
    }
};

const handlers = {
    [actionTypes.Detonate]: OnDetonate,
    [actionTypes.GameLost]: OnGameLost,
    [actionTypes.GameWon]: OnGameWon,
    [actionTypes.PickUp]: OnPickUp,
    [actionTypes.StepIfNotTagged]: OnStepIfNotTagged,
    [actionTypes.StepOnUntaggedNeighborsIfEnoughTagged]: OnStepOnUntaggedNeighborsIfEnoughTagged,
    [actionTypes.ToggleMarker]: OnToggleMarker,
    [actionTypes.UsePowerTool]: OnUsePowerTool,
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
