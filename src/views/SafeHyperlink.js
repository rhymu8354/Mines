import React from "react";

const SafeHyperlink = (props) => {
    const { children, ...otherProps } = props;
    return <a
        {...otherProps}
        target="_blank"
        rel="noopener noreferrer"
    >
        {children}
    </a>;
};

export default SafeHyperlink;
