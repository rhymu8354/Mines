export const actionTypes = {};
export const actions = {};

const CreateAction = type => (args) => ({...args, type});

const DefineAction = (type) => {
    actionTypes[type] = type;
    actions[type] = CreateAction(type);
};

[
    "HideStage",
    "Load",
    "ShowStage",
].forEach(actionType => DefineAction(actionType));
