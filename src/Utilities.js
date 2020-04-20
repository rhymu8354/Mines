import {
    GRID_CELL_MINE_PRESENT,
    GRID_CELL_TAGGED,
    GRID_CELL_UNCOVERED,
    GRID_HEIGHT_TILES,
    GRID_WIDTH_TILES,
} from "./constants";

export function IsUncovered({grid, x, y}) {
    return ((grid[y][x] & GRID_CELL_UNCOVERED) !== 0);
}

export function IsMinePresent({grid, x, y}) {
    return ((grid[y][x] & GRID_CELL_MINE_PRESENT) !== 0);
}

export function IsTagged({grid, x, y}) {
    return ((grid[y][x] & GRID_CELL_TAGGED) !== 0);
}

export function WithAllGridCells(fn) {
    for (let y = 0; y < GRID_HEIGHT_TILES; ++y) {
        for (let x = 0; x < GRID_WIDTH_TILES; ++x) {
            fn(x, y);
        }
    }
}

export function WithNeighborGridCells({x, y, fn}) {
    for (let dy = -1; dy <= 1; ++dy) {
        for (let dx = -1; dx <= 1; ++dx) {
            if ((dx === 0) && (dy === 0)) {
                continue;
            }
            const x2 = x + dx;
            const y2 = y + dy;
            if ((x2 < 0) || (x2 >= GRID_WIDTH_TILES)) {
                continue;
            }
            if ((y2 < 0) || (y2 >= GRID_HEIGHT_TILES)) {
                continue;
            }
            fn(x2, y2);
        }
    }
}

export function ComputeNeighborMines({grid, x, y}) {
    let neighborMines = 0;
    WithNeighborGridCells({x, y, fn: (x, y) => {
        if (IsMinePresent({grid, x, y})) {
            ++neighborMines;
        }
    }});
    return neighborMines;
}
