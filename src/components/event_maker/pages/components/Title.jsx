import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../../../contexts/ThemeContext";
import { getThemeColor } from "./utils";

export function Title({
    text = "Default Title",
    color = "base-content",
    bold = false,
    italic = false,
    underline = false,
    className = "",
}) {
    const { theme } = useTheme();
    const fontStyle = `${bold ? "font-bold" : ""} ${italic ? "italic" : ""} ${underline ? "underline" : ""}`;
    const textColor = getThemeColor(theme, color);

    return (
        <h1
            className={`text-2xl ${fontStyle} ${className}`}
            style={{ color: textColor }}
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