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
    "DropSavedGame",
    "GameLost",
    "GameWon",
    "HideStage",
    "PickUp",
    "Play",
    "PopGame",
    "PopModal",
    "PushGame",
    "PushModal",
    "Quit",
    "ReflectGridUpdated",
    "ReflectGridUpdatedBatch",
    "ReflectSavedGame",
    "ReflectScore",
    "ReflectStageSize",
    "RestoreGame",
    "RestoreSavedGame",
    "Save",
    "SelectPowerTool",
    "SelectWittyQuote",
    "SetActivity",
    "SetMinScaling",
    "SetRedBoxEnabled",
    "SetShakeEnabled",
    "SetSoundEnabled",
    "SetSoundLevel",
    "SetTinting",
    "SetViewport",
    "ShowAbout",
    "ShowReleaseNotes",
    "ShowStage",
    "StartBonusGame",
    "Step",
    "StepOnUntaggedNeighborsIfEnoughTagged",
    "UsePowerTool",
].forEach(actionType => DefineAction(actionType));
