export { version as APP_VERSION } from "./version.json";

export const TILE_SIZE = 16;
export const SCROLL_UNITS_PER_PAGE_X = 4;
export const SCROLL_UNITS_PER_PAGE_Y = 4;

export const DEPTH_SPRITE_CONTAINER = 0;
export const DEPTH_MINI_MAP = 1;

export const DETONATION_SHAKE_COUNT = 50;
export const DETONATION_SOUND_DURATION = 1100;
export const SHAKE_MAX_DISTANCE = 10;

export const MAX_TILE_SCALING = 10;

export const MINI_MAP_OPACITY = 0.75;
export const MINI_MAP_SIZE = 100;
export const MINI_MAP_MARGIN = 10;

export const ACTIVITY_PLAY = "ACTIVITY_PLAY";
export const ACTIVITY_SELECT_LEVEL = "ACTIVITY_SELECT_LEVEL";

export const MODAL_ABOUT = "MODAL_ABOUT";
export const MODAL_RELEASE_NOTES = "MODAL_RELEASE_NOTES";

export const POWER_TOOL_DETONATOR = "POWER_TOOL_DETONATOR";
export const POWER_TOOL_PROBE = "POWER_TOOL_PROBE";

export const LOCAL_STORAGE_RED_BOX_ENABLED = "redBoxEnabled";
export const LOCAL_STORAGE_SHAKE_ENABLED = "shakeEnabled";
export const LOCAL_STORAGE_SOUND_ENABLED = "soundEnabled";
export const LOCAL_STORAGE_SOUND_LEVEL = "soundLevel";
export const LOCAL_STORAGE_TINTING = "tinting";

export const DEFAULT_SOUND_LEVEL = 1.0;
export const DEFAULT_TINTING = 0.75;

export const DOUBLE_CLICK_THRESHOLD_MILLISECONDS = 500;

export const POWER_COSTS = {
    [POWER_TOOL_DETONATOR]: 4,
    [POWER_TOOL_PROBE]: 2,
};

export const DETONATION_REVEAL_RANGE = 1;
export const DETONATOR_RANGE = 2;
export const PROBE_RANGE = 2;

// "cell" means the game object holding state about one section of the game
// grid.
//
// "tile" means the graphical representation of a "cell".

export const TILE_COVERED = 0;
export const TILE_UNCOVERED_NO_NEIGHBORS = 1;
export const TILE_UNCOVERED_ONE_NEIGHBOR = 2;
export const TILE_UNCOVERED_TWO_NEIGHBORS = 3;
export const TILE_UNCOVERED_THREE_NEIGHBORS = 4;
export const TILE_UNCOVERED_FOUR_NEIGHBORS = 5;
export const TILE_UNCOVERED_FIVE_NEIGHBORS = 6;
export const TILE_UNCOVERED_SIX_NEIGHBORS = 7;
export const TILE_UNCOVERED_SEVEN_NEIGHBORS = 8;
export const TILE_UNCOVERED_EIGHT_NEIGHBORS = 9;
export const TILE_UNEXPLODED_MINE = 10;
export const TILE_TAGGED_BUT_NO_MINE = 11;
export const TILE_EXPLODED_MINE = 12;
export const TILE_TAG = 13;
export const TILE_POWER = 14;
export const TILE_BONUS = 15;

export const GRID_CELL_MINE_PRESENT = 1;
export const GRID_CELL_TAGGED = 2;
export const GRID_CELL_UNCOVERED = 4;
export const GRID_CELL_DARKENED = 8;
export const GRID_CELL_MINE_EXPLODED = 16;
export const GRID_CELL_POWER = 32;
export const GRID_CELL_BONUS = 64;
