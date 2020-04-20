import React from "react";
import { connect } from "react-redux";

import { actions } from "../../actions";

import "./SelectLevel.css";

const SelectLevel = ({
    onPlay,
}) => {
    return <div
        className="SelectLevel"
    >
        <button
            type="button"
            onClick={() => onPlay()}
        >
            Play
        </button>
    </div>;
}

const mapStateToProps = (state, ownProps) => ({
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onPlay: () => dispatch(actions.Play()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectLevel);
