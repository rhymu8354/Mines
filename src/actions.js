export const actionTypes = {};
export const actions = {};

const CreateAction = type => (args) => ({...args, type});

const DefineAction = (type) => {
    actionTypes[type] = type;
    actions[type] = CreateAction(type);
};

[
    "GameLost",
    "GameWon",
    "HideStage",
    "Play",
    "PopModal",
    "PushModal",
    "Quit",
    "ReflectGridUpdated",
    "ReflectScore",
    "ReflectStageSize",
    "SetActivity",
    "SetMinScaling",
    "ShowReleaseNotes",
    "ShowStage",
    "StepIfNotTagged",
    "StepOnUntaggedNeighborsIfEnoughTagged",
    "ToggleMarker",
].forEach(actionType => DefineAction(actionType));
