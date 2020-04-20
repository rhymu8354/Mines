import { actionTypes } from "../actions";

import {
    GRID_CELL_MINE_PRESENT,
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
    grid: MakeGrid(),
};

export default function (state = initialState, action) {
    switch (action.type) {
        case actionTypes.ReflectGridUpdated:
            const grid = [...state.grid];
            grid[action.y] = [...grid[action.y]];
            grid[action.y][action.x] = action.cell;
            return {
                ...state,
                grid,
            };
        default:
            return state;
    }
}
