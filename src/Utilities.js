import {
    GRID_CELL_MINE_EXPLODED,
    GRID_CELL_MINE_PRESENT,
    GRID_CELL_TAGGED,
    GRID_CELL_UNCOVERED,
} from "./constants";

export function IsUncovered({grid, x, y}) {
    return ((grid[y][x] & GRID_CELL_UNCOVERED) !== 0);
}

export function IsMineExploded({grid, x, y}) {
    return ((grid[y][x] & GRID_CELL_MINE_EXPLODED) !== 0);
}

export function IsMinePresent({grid, x, y}) {
    return ((grid[y][x] & GRID_CELL_MINE_PRESENT) !== 0);
}

export function IsTagged({grid, x, y}) {
    return ((grid[y][x] & GRID_CELL_TAGGED) !== 0);
}

export function WithAllGridCells(grid, fn) {
    const height = grid.length;
    const width = grid[0].length;
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            fn(x, y);
        }
    }
}

export function WithCellsWithinRange({grid, x, y, range, fn}) {
    const height = grid.length;
    const width = grid[0].length;
    for (let dy = -range; dy <= range; ++dy) {
        for (let dx = -range; dx <= range; ++dx) {
            const x2 = x + dx;
            const y2 = y + dy;
            if ((x2 < 0) || (x2 >= width)) {
                continue;
            }
            if ((y2 < 0) || (y2 >= height)) {
                continue;
            }
            fn(x2, y2);
        }
    }
}

export function WithNeighborGridCells({grid, x, y, fn}) {
    const height = grid.length;
    const width = grid[0].length;
    for (let dy = -1; dy <= 1; ++dy) {
        for (let dx = -1; dx <= 1; ++dx) {
            if ((dx === 0) && (dy === 0)) {
                continue;
            }
            const x2 = x + dx;
            const y2 = y + dy;
            if ((x2 < 0) || (x2 >= width)) {
                continue;
            }
            if ((y2 < 0) || (y2 >= height)) {
                continue;
            }
            fn(x2, y2);
        }
    }
}

export function ComputeNeighborMines({grid, x, y}) {
    let neighborMines = 0;
    WithNeighborGridCells({grid, x, y, fn: (x, y) => {
        if (IsMinePresent({grid, x, y})) {
            ++neighborMines;
        }
    }});
    return neighborMines;
}

export function ComputeNeighborTags({grid, x, y}) {
    let neighborTags = 0;
    WithNeighborGridCells({grid, x, y, fn: (x, y) => {
        if (
            IsTagged({grid, x, y})
            || (
                IsUncovered({grid, x, y})
                && IsMinePresent({grid, x, y})
            )
        ) {
            ++neighborTags;
        }
    }});
    return neighborTags;
}

export function Clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function FirstNonNull(values) {
    return values.find(value => value != null);
}
