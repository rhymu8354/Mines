export const actionTypes = {};
export const actions = {};

const CreateAction = type => (args) => ({...args, type});

const DefineAction = (type) => {
    actionTypes[type] = type;
    actions[type] = CreateAction(type);
};

[
    "AddPower",
    "Detonate",
    "GameLost",
    "GameWon",
    "HideStage",
    "PickUpOrDarken",
    "Play",
    "PopModal",
    "PushModal",
    "Quit",
    "ReflectGridUpdated",
    "ReflectGridUpdatedBatch",
    "ReflectScore",
    "ReflectStageSize",
    "SelectPowerTool",
    "SelectWittyQuote",
    "SetActivity",
    "SetMinScaling",
    "ShowReleaseNotes",
    "ShowStage",
    "StepIfNotTagged",
    "StepOnUntaggedNeighborsIfEnoughTagged",
    "ToggleMarkerOrLighten",
    "UsePowerTool",
].forEach(actionType => DefineAction(actionType));
