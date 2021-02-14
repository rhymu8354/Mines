export const actionTypes = {};
export const actions = {};

const CreateAction = type => (args) => ({...args, type});

const DefineAction = (type) => {
    actionTypes[type] = type;
    actions[type] = CreateAction(type);
};

[
    "ActivateSss",
    "AddArmor",
    "AddPower",
    "Detonate",
    "DiffuseSss",
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
    "ReflectFirstStepTaken",
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
    "SssDetonated",
    "StartBonusGame",
    "Step",
    "StepOnUntaggedNeighborsIfEnoughTagged",
    "TakeDamage",
    "UsePowerTool",
].forEach(actionType => DefineAction(actionType));
