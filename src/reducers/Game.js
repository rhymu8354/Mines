import { actionTypes } from "../actions";

import {
    GRID_CELL_MINE_PRESENT,
    GRID_CELL_UNCOVERED,
} from "../constants";

const MakeGrid = (width, height, numMines) => {
    // Set up empty game grid.
    let grid = [];
    for (let y = 0; y < height; ++y) {
        grid[y] = [];
        for (let x = 0; x < width; ++x) {
            grid[y][x] = 0;
        }
    }

    // Place mines.
    let minesLeft = numMines;
    while (minesLeft > 0) {
        let x = Math.floor(Math.random() * width);
        let y = Math.floor(Math.random() * height);
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
    cellsCleared: 0,
    cellsToClear: 0,
    grid: null,
    lost: false,
    numMines: 0,
    score: 0,
};

export default function (state = initialState, action) {
    switch (action.type) {
        case actionTypes.GameLost:
            return {
                ...state,
                active: false,
                lost: true,
            };
        case actionTypes.Play: {
            const numMines = action.numMines || state.numMines;
            const width = action.width || state.grid[0].length;
            const height = action.height || state.grid.length;
            return {
                ...state,
                active: true,
                cellsCleared: 0,
                cellsToClear: width * height - numMines,
                grid: MakeGrid(width, height, numMines),
                lost: false,
                numMines,
                score: 0,
            };
        }
        case actionTypes.ReflectGridUpdated:
            const originalCell = state.grid[action.y][action.x];
            const grid = [...state.grid];
            grid[action.y] = [...grid[action.y]];
            grid[action.y][action.x] = action.cell;
            let cellsCleared = state.cellsCleared;
            let cellsToClear = state.cellsToClear;
            if (
                (originalCell !== action.cell)
                && ((action.cell & GRID_CELL_MINE_PRESENT) === 0)
                && ((originalCell & GRID_CELL_UNCOVERED) === 0)
                && ((action.cell & GRID_CELL_UNCOVERED) !== 0)
            ) {
                ++cellsCleared;
                --cellsToClear;
            }
            return {
                ...state,
                active: (
                    (cellsToClear > 0)
                    && !state.lost
                ),
                cellsCleared,
                cellsToClear,
                grid,
            };
        case actionTypes.ReflectScore:
            return {
                ...state,
                score: action.score,
            };
        default:
            return state;
    }
}
