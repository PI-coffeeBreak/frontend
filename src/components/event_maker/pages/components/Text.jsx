import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../../../contexts/ThemeContext.jsx";
import { getThemeColorValue } from "./utils.js";
export function Text({
    text = "Default Text",
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
        <p
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
    underline: PropTypes.bool
}; 