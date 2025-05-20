import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../../../contexts/ThemeContext.jsx";
import { getThemeColorValue } from "./utils.js";

export function Title({
    text = "Default Title",
    color = "base-content",
    bold = false,
    italic = false,
    underline = false,
}) {
    const { theme } = useTheme();
    const textColor = getThemeColorValue(theme, color);

    const styles = {
        color: textColor,
        fontWeight: bold ? "bold" : "normal",
        fontStyle: italic ? "italic" : "normal",
        textDecoration: underline ? "underline" : "none",
    };

    return (
        <h1
            className={`text-2xl`}
            style={styles}
        >
            {text}
        </h1>
    );
}

Title.propTypes = {
    text: PropTypes.string,
    color: PropTypes.string,
    bold: PropTypes.bool,
    italic: PropTypes.bool,
    underline: PropTypes.bool,
    className: PropTypes.string,
}; 