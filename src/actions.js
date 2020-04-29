export const actionTypes = {};
export const actions = {};

const CreateAction = type => (args) => ({...args, type});

const DefineAction = (type) => {
    actionTypes[type] = type;
    actions[type] = CreateAction(type);
};

[
    "AddArmor",
    "AddPower",
    "Detonate",
    "GameLost",
    "GameWon",
    "HideStage",
    "PickUp",
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
    "SetRedBoxEnabled",
    "SetShakeEnabled",
    "SetSoundEnabled",
    "SetSoundLevel",
    "SetTinting",
    "ShowAbout",
    "ShowReleaseNotes",
    "ShowStage",
    "StepIfNotTagged",
    "StepOnUntaggedNeighborsIfEnoughTagged",
    "UsePowerTool",
].forEach(actionType => DefineAction(actionType));
