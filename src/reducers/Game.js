import { actionTypes } from "../actions";

import {
    GRID_CELL_MINE_PRESENT,
    GRID_CELL_UNCOVERED,
    NUM_MINES,
    GRID_WIDTH_TILES,
    GRID_HEIGHT_TILES,
} from "../constants";

const MakeGrid = () => {
    // Set up empty game grid.
    let grid = [];
    for (let y = 0; y < GRID_HEIGHT_TILES; ++y) {
        grid[y] = [];
        for (let x = 0; x < GRID_WIDTH_TILES; ++x) {
            grid[y][x] = 0;
        }
    }

    // Place mines.
    let minesLeft = NUM_MINES;
    while (minesLeft > 0) {
        let x = Math.floor(Math.random() * GRID_WIDTH_TILES);
        let y = Math.floor(Math.random() * GRID_HEIGHT_TILES);
        if (grid[y][x] === 0) {
            grid[y][x] = GRID_CELL_MINE_PRESENT;
            --minesLeft;
        }
    }

    // Return the finished game grid.
    return grid;
};

const initialState = {
    active: true,
    lost: false,
    grid: null,
    cellsToClear: 0,
};

export default function (state = initialState, action) {
    switch (action.type) {
        case actionTypes.GameLost:
            return {
                ...state,
                active: false,
                lost: true,
            };
        case actionTypes.Play:
            return {
                ...state,
                active: true,
                lost: false,
                grid: MakeGrid(),
                cellsToClear: GRID_WIDTH_TILES * GRID_HEIGHT_TILES - NUM_MINES,
            };
        case actionTypes.ReflectGridUpdated:
            const originalCell = state.grid[action.y][action.x];
            const grid = [...state.grid];
            grid[action.y] = [...grid[action.y]];
            grid[action.y][action.x] = action.cell;
            let cellsToClear = state.cellsToClear;
            if (
                (originalCell !== action.cell)
                && ((originalCell & GRID_CELL_MINE_PRESENT) === 0)
                && ((originalCell & GRID_CELL_UNCOVERED) === 0)
                && ((action.cell & GRID_CELL_UNCOVERED) !== 0)
            ) {
                --cellsToClear;
            }
            return {
                ...state,
                active: (
                    (cellsToClear > 0)
                    && !state.lost
                ),
                cellsToClear,
                grid,
            };
        default:
            return state;
    }
}
