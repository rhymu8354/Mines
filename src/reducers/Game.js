import { actionTypes } from "../actions";

import {
    GRID_CELL_BONUS,
    GRID_CELL_MINE_PRESENT,
    GRID_CELL_POWER,
    GRID_CELL_UNCOVERED,
    GRID_CELL_SSS,
    GRID_CELL_TAGGED,
} from "../constants";

import {
    FirstNonNull,
} from "../Utilities";

const MakeGrid = (width, height, numMines, numPower, numBonus, sss) => {
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

    // Place power points.
    let powerLeft = numPower;
    while (powerLeft > 0) {
        let x = Math.floor(Math.random() * width);
        let y = Math.floor(Math.random() * height);
        if (grid[y][x] === 0) {
            grid[y][x] = GRID_CELL_POWER;
            --powerLeft;
        }
    }

    // Place bonus games.
    let bonusLeft = numBonus;
    while (bonusLeft > 0) {
        let x = Math.floor(Math.random() * width);
        let y = Math.floor(Math.random() * height);
        if (grid[y][x] === 0) {
            grid[y][x] = GRID_CELL_BONUS;
            --bonusLeft;
        }
    }

    // Place the "surprise".
    while (sss) {
        let x = Math.floor(Math.random() * width);
        let y = Math.floor(Math.random() * height);
        if (grid[y][x] === 0) {
            grid[y][x] = GRID_CELL_SSS;
            break;
        }
    }

    // Return the finished game grid.
    return grid;
};

const initialState = {
    active: true,
    armor: 0,
    cellsCleared: 0,
    cellsToClear: 0,
    firstStepTaken: false,
    grid: null,
    height: 1,
    lost: false,
    numBonus: 0,
    numMines: 0,
    numMinesPlayerThinksAreUnaccounted: 0,
    numPower: 0,
    offsetX: 0,
    offsetY: 0,
    placeSss: false,
    powerCollected: 0,
    powerTool: null,
    score: 0,
    showArmor: false,
    sssActive: null,
    startArmor: 0,
    startPower: 0,
    width: 1,
};

export default function (state = initialState, action) {
    switch (action.type) {
        case actionTypes.ActivateSss:
            return {
                ...state,
                sssActive: {
                    x: action.x,
                    y: action.y,
                },
            };
        case actionTypes.AddArmor:
            return {
                ...state,
                armor: state.armor + action.armor,
            };
        case actionTypes.AddPower:
            return {
                ...state,
                powerCollected: state.powerCollected + action.power,
            };
        case actionTypes.DiffuseSss:
            return {
                ...state,
                sssActive: null,
            };
        case actionTypes.GameLost:
            return {
                ...state,
                active: false,
                lost: true,
            };
        case actionTypes.GameWon:
            return {
                ...state,
                active: false,
                lost: false,
            };
        case actionTypes.Play: {
            const numMines = FirstNonNull([action.numMines, state.numMines]);
            const numPower = FirstNonNull([action.numPower, state.numPower]);
            const numBonus = FirstNonNull([action.numBonus, state.numBonus]);
            const placeSss = FirstNonNull([action.sss, state.placeSss]);
            const showArmor = FirstNonNull([action.showArmor, state.showArmor]);
            const startArmor = FirstNonNull([action.startArmor, state.startArmor]);
            const startPower = FirstNonNull([action.startPower, state.startPower]);
            const width = FirstNonNull([action.width, (state.grid && (state.grid.length > 0)) ? state.grid[0].length : 0]);
            const height = FirstNonNull([action.height, state.grid ? state.grid.length : 0]);
            return {
                ...state,
                armor: startArmor,
                active: true,
                cellsCleared: 0,
                cellsToClear: width * height - numMines,
                firstStepTaken: false,
                grid: MakeGrid(width, height, numMines, numPower, numBonus, placeSss),
                lost: false,
                numBonus,
                numMines,
                numMinesPlayerThinksAreUnaccounted: numMines,
                numPower,
                offsetX: 0,
                offsetY: 0,
                placeSss: placeSss,
                powerCollected: startPower,
                powerTool: null,
                showArmor,
                score: 0,
                sssActive: null,
                startArmor,
                startPower,
            };
        }
        case actionTypes.ReflectFirstStepTaken:
            return {
                ...state,
                firstStepTaken: true,
            };
        case actionTypes.ReflectGridUpdated: {
            const originalCell = state.grid[action.y][action.x];
            const grid = [...state.grid];
            grid[action.y] = [...grid[action.y]];
            grid[action.y][action.x] = action.cell;
            let cellsCleared = state.cellsCleared;
            let cellsToClear = state.cellsToClear;
            let numMinesPlayerThinksAreUnaccounted = state.numMinesPlayerThinksAreUnaccounted;
            if (originalCell !== action.cell) {
                if (
                    ((action.cell & GRID_CELL_MINE_PRESENT) === 0)
                    && ((originalCell & GRID_CELL_UNCOVERED) === 0)
                    && ((action.cell & GRID_CELL_UNCOVERED) !== 0)
                ) {
                    ++cellsCleared;
                    --cellsToClear;
                }
                if ((action.cell & GRID_CELL_UNCOVERED) === 0) {
                    if (
                        ((originalCell & GRID_CELL_TAGGED) === 0)
                        && ((action.cell & GRID_CELL_TAGGED) !== 0)
                    ) {
                        --numMinesPlayerThinksAreUnaccounted;
                    } else if (
                        ((originalCell & GRID_CELL_TAGGED) !== 0)
                        && ((action.cell & GRID_CELL_TAGGED) === 0)
                    ) {
                        ++numMinesPlayerThinksAreUnaccounted;
                    }
                } else if (
                    ((originalCell & GRID_CELL_UNCOVERED) === 0)
                    && ((action.cell & GRID_CELL_MINE_PRESENT) !== 0)
                    && ((originalCell & GRID_CELL_TAGGED) === 0)
                ) {
                    --numMinesPlayerThinksAreUnaccounted;
                }
            }
            return {
                ...state,
                cellsCleared,
                cellsToClear,
                grid,
                numMinesPlayerThinksAreUnaccounted,
            };
        }
        case actionTypes.ReflectGridUpdatedBatch: {
            const grid = [...state.grid];
            const rowsChanged = new Set();
            let cellsCleared = state.cellsCleared;
            let cellsToClear = state.cellsToClear;
            let numMinesPlayerThinksAreUnaccounted = state.numMinesPlayerThinksAreUnaccounted;
            action.updates.forEach(({x, y, cell}) => {
                const originalCell = state.grid[y][x];
                if (!rowsChanged.has(y)) {
                    rowsChanged.add(y);
                    grid[y] = [...grid[y]];
                }
                grid[y][x] = cell;
                if (originalCell !== cell) {
                    if (
                        ((cell & GRID_CELL_MINE_PRESENT) === 0)
                        && ((originalCell & GRID_CELL_UNCOVERED) === 0)
                        && ((cell & GRID_CELL_UNCOVERED) !== 0)
                    ) {
                        ++cellsCleared;
                        --cellsToClear;
                    }
                    if (
                        ((originalCell & GRID_CELL_TAGGED) === 0)
                        && ((cell & GRID_CELL_TAGGED) !== 0)
                    ) {
                        --numMinesPlayerThinksAreUnaccounted;
                    } else if (
                        ((originalCell & GRID_CELL_TAGGED) !== 0)
                        && ((cell & GRID_CELL_TAGGED) === 0)
                    ) {
                        ++numMinesPlayerThinksAreUnaccounted;
                    } else if (
                        ((cell & GRID_CELL_MINE_PRESENT) !== 0)
                        && ((originalCell & GRID_CELL_TAGGED) === 0)
                        && ((originalCell & GRID_CELL_UNCOVERED) === 0)
                        && ((cell & GRID_CELL_UNCOVERED) !== 0)
                    ) {
                        --numMinesPlayerThinksAreUnaccounted;
                    }
                }
            });
            return {
                ...state,
                active: (
                    (cellsToClear > 0)
                    && !state.lost
                ),
                cellsCleared,
                cellsToClear,
                grid,
                numMinesPlayerThinksAreUnaccounted,
            };
        }
        case actionTypes.RestoreGame:
            return {
                ...action.game
            };
        case actionTypes.ReflectScore:
            return {
                ...state,
                score: action.score,
            };
        case actionTypes.ReflectStageSize:
            return {
                ...state,
                width: action.width,
                height: action.height,
            };
        case actionTypes.SelectPowerTool:
            if (!state.active) {
                return state;
            }
            return {
                ...state,
                powerTool: (
                    (state.powerTool === action.powerTool)
                    ? null
                    : action.powerTool
                ),
            };
        case actionTypes.SetViewport:
            return {
                ...state,
                offsetX: action.offsetX,
                offsetY: action.offsetY,
            };
        case actionTypes.SssDetonated:
            return {
                ...state,
                sssActive: null,
            };
        default:
            return state;
    }
}
