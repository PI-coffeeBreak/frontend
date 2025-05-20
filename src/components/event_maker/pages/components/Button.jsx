import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../../../contexts/ThemeContext";
import { getThemeColorValue } from "./utils";

export function Button({
    text = "Click Me",
    METHOD = "GET",
    URL = "#",
    className = "",
    backgroundColor = "primary",
    textColor = "primary-content",
    disabled = false,
}) {
    const { theme } = useTheme();
    const bgColor = getThemeColorValue(theme, backgroundColor);
    const txtColor = getThemeColorValue(theme, textColor);

    return (
        <button
            onClick={() => {
                if (!disabled && URL !== "#") {
                    window.location.href = URL;
                }
            }}
            className={`btn ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={disabled}
            style={{
                backgroundColor: bgColor,
                color: txtColor
            }}
        >
            {text}
        </button>
    );
}

Button.propTypes = {
    text: PropTypes.string,
    METHOD: PropTypes.string,
    URL: PropTypes.string,
    className: PropTypes.string,
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,
    disabled: PropTypes.bool,
}; 