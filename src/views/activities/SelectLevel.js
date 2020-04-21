import React from "react";
import { connect } from "react-redux";

import { actions } from "../../actions";

import "./SelectLevel.css";

const levelTable = [
    {
        title: "Easy",
        width: 10,
        height: 10,
        numMines: 15,
    },
    {
        title: "Moderate",
        width: 15,
        height: 12,
        numMines: 30,
    },
    {
        title: "Difficult",
        width: 20,
        height: 15,
        numMines: 50,
    },
    {
        title: "Brain-melting",
        width: 35,
        height: 20,
        numMines: 125,
    },
]

const SelectLevel = ({
    onPlay,
}) => {
    return <div
        className="SelectLevel"
    >
        <h2 className="SelectLevel-header">
            Choose your level of difficulty:
        </h2>
        <div className="SelectLevel-grid">
            {levelTable.map(level => <React.Fragment key={level.title}>
                <div>{level.title}</div>
                <div>
                    <button
                        type="button"
                        onClick={() => onPlay(level)}
                    >
                        Play
                    </button>
                </div>
            </React.Fragment>)}
        </div>
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
