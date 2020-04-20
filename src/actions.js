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
    "ReflectStageSize",
    "SetActivity",
    "ShowReleaseNotes",
    "ShowStage",
    "StepIfNotTagged",
    "ToggleMarker",
].forEach(actionType => DefineAction(actionType));
