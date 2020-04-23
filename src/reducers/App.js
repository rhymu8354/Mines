import { actionTypes } from "../actions";

import {
    ACTIVITY_SELECT_LEVEL,
    DEFAULT_SOUND_LEVEL,
    DEFAULT_TINTING,
    LOCAL_STORAGE_SHAKE_ENABLED,
    LOCAL_STORAGE_SOUND_ENABLED,
    LOCAL_STORAGE_SOUND_LEVEL,
    LOCAL_STORAGE_TINTING,
} from "../constants";

const wittyQuotes = [
    "It's like Rhymurang, only more explosive!",
    "Now supercharged with remnants of dad jokes!",
    "It's like food.exe but without the food!",
    "<Insert witty quote here>",
    "It will drive you insane, AND waste your time too; double-effective!",
    "React is not a framework.",
    "Of all the things I've lost, I miss my mind the most!",
    "Don't call me JUNIOR!",
    "Speak softly and carry a big stick.",
    "If we don't change direction soon, we'll end up where we're going!",
    "Without this great land of ours, we would all drown.",
    "Marriage is like a bank account.  You put it in, you take it out, you lose interest.",
    "You can go a long way with a smile.  You can go a lot farther with a smile and a gun.",
    "Today we must all be aware that protocol takes precedence over procedure.",
];

const GetInitialLevel = (settingKey, defaultSetting) => {
    const setting = parseFloat(localStorage.getItem(settingKey));
    return (
        isNaN(setting)
        ? defaultSetting
        : setting
    );
};

const GetInitialEnable = (settingKey, defaultSetting) => {
    const setting = localStorage.getItem(settingKey);
    return (
        (setting == null)
        ? defaultSetting
        : (setting === "true")
    );
};

const initialState = {
    activity: ACTIVITY_SELECT_LEVEL,
    width: 1,
    height: 1,
    minScaling: 2,
    shakeEnabled: GetInitialEnable(LOCAL_STORAGE_SHAKE_ENABLED, true),
    soundEnabled: GetInitialEnable(LOCAL_STORAGE_SOUND_ENABLED, true),
    soundLevel: GetInitialLevel(LOCAL_STORAGE_SOUND_LEVEL, DEFAULT_SOUND_LEVEL),
    tinting: GetInitialLevel(LOCAL_STORAGE_TINTING, DEFAULT_TINTING),
    wittyQuote: "",
};

export default function (state = initialState, action) {
    switch (action.type) {
        case actionTypes.ReflectStageSize:
            return {
                ...state,
                width: action.width,
                height: action.height,
            };
        case actionTypes.SelectWittyQuote:
            return {
                ...state,
                wittyQuote: wittyQuotes[
                    Math.floor(Math.random() * wittyQuotes.length)
                ],
            };
        case actionTypes.SetActivity:
            return {
                ...state,
                activity: action.activity,
            };
        case actionTypes.SetMinScaling:
            return {
                ...state,
                minScaling: action.minScaling,
            };
        case actionTypes.SetShakeEnabled:
            localStorage.setItem(LOCAL_STORAGE_SHAKE_ENABLED, action.shakeEnabled ? "true" : "false");
            return {
                ...state,
                shakeEnabled: action.shakeEnabled,
            };
        case actionTypes.SetSoundEnabled:
            localStorage.setItem(LOCAL_STORAGE_SOUND_ENABLED, action.soundEnabled ? "true" : "false");
            return {
                ...state,
                soundEnabled: action.soundEnabled,
            };
        case actionTypes.SetSoundLevel:
            localStorage.setItem(LOCAL_STORAGE_SOUND_LEVEL, action.soundLevel.toString());
            return {
                ...state,
                soundLevel: action.soundLevel,
            };
        case actionTypes.SetTinting:
            localStorage.setItem(LOCAL_STORAGE_TINTING, action.tinting.toString());
            return {
                ...state,
                tinting: action.tinting,
            };
        default:
            return state;
    }
}
