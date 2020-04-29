import React from "react";
import { connect } from "react-redux";

import { actions } from "../../actions";

import "./SelectLevel.css";

const originalLevelTable = [
    {
        title: "Simple",
        width: 10,
        height: 10,
        numMines: 15,
    },
    {
        title: "Warm-up",
        width: 15,
        height: 12,
        numMines: 30,
    },
    {
        title: "Moderate",
        width: 20,
        height: 15,
        numMines: 50,
    },
    {
        title: "Difficult",
        width: 35,
        height: 20,
        numMines: 125,
    },
];

const extendedLevelTable = [
    {
        title: "Strenuous",
        width: 50,
        height: 50,
        numMines: 450,
        numPower: 10,
        numBonus: 5,
        startArmor: 1,
        startPower: 5,
    },
    {
        title: "Aggravating",
        width: 100,
        height: 100,
        numMines: 1800,
        numPower: 40,
        numBonus: 20,
        startArmor: 1,
        startPower: 5,
    },
    {
        title: "Tormenting",
        width: 175,
        height: 175,
        numMines: 5500,
        numPower: 125,
        numBonus: 60,
        startArmor: 1,
        startPower: 5,
    },
    {
        title: "Impossible",
        width: 250,
        height: 250,
        numMines: 11000,
        numPower: 250,
        numBonus: 125,
        startArmor: 1,
        startPower: 5,
    },
];

const SelectLevel = ({
    onPlay,
}) => {
    return <div
        className="SelectLevel"
    >
        <h2 className="SelectLevel-header">
            Choose your level of difficulty:
        </h2>
        <div className="SelectLevel-groups">
            <div className="SelectLevel-grid">
                {originalLevelTable.map(level => <React.Fragment key={level.title}>
                    <div>{level.title}</div>
                    <div>
                        <button
                            type="button"
                            onClick={
                                () => onPlay({
                                    ...level,
                                    numPower: 0,
                                    numBonus: 0,
                                    showArmor: false,
                                    startArmor: 0,
                                    startPower: 0,
                                })
                            }
                        >
                            Play
                        </button>
                    </div>
                </React.Fragment>)}
            </div>
            <div className="SelectLevel-grid power-border">
                {extendedLevelTable.map(level => <React.Fragment key={level.title}>
                    <div>{level.title}</div>
                    <div>
                        <button
                            type="button"
                            onClick={
                                () => onPlay({
                                    ...level,
                                    showArmor: true,
                                })
                            }
                        >
                            Play
                        </button>
                    </div>
                </React.Fragment>)}
            </div>
        </div>
        <p>
            <span className="power-text">POWER</span> levels are larger,
            but include fancy gadgets to help speed up the process and
            get you out of any tight spots!
        </p>
    </div>;
}

const mapStateToProps = (state, ownProps) => ({
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onPlay: (level) => dispatch(actions.Play(level)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectLevel);
