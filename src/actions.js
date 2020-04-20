export const actionTypes = {};
export const actions = {};

const CreateAction = type => (args) => ({...args, type});

const DefineAction = (type) => {
    actionTypes[type] = type;
    actions[type] = CreateAction(type);
};

[
    "GameLost",
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
    "Step",
].forEach(actionType => DefineAction(actionType));
