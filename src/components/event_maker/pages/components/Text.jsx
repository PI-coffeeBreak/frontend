import React from "react";
import PropTypes from "prop-types";
import { getColorVariable } from "./utils";

export function Text({
    text = "Default Text",
    color = "primary-content",
    bold = false,
    italic = false,
    underline = false,
    className = "",
}) {
    const styles = {
        color: getColorVariable(color),
        fontWeight: bold ? "bold" : "normal",
        fontStyle: italic ? "italic" : "normal",
        textDecoration: underline ? "underline" : "none",
    };

    return (
        <p
            className={className}
            style={styles}
        >
            {text}
        </p>
    );
}

Text.propTypes = {
    text: PropTypes.string,
    color: PropTypes.string,
    bold: PropTypes.bool,
    italic: PropTypes.bool,
    underline: PropTypes.bool,
    className: PropTypes.string,
}; 