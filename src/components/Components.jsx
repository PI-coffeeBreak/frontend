import React, { useContext } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../contexts/ThemeContext";

// Helper to get color value from theme
const getThemeColor = (theme, colorKey) => {
    // If the color is a theme key (e.g., "primary"), return the theme value
    if (theme[colorKey]) {
        return theme[colorKey];
    }
    // If it's a direct color (e.g., "#FF0000"), return it as is
    if (colorKey.startsWith('#')) {
        return colorKey;
    }
    // Default fallback
    return theme["base-content"];
};

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

export function Image({
    src = "https://via.placeholder.com/150",
    alt = "Placeholder",
    className = "",
}) {
    return <img src={src} alt={alt} className={`rounded shadow ${className}`} />;
}

Image.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    className: PropTypes.string,
};

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
    const bgColor = getThemeColor(theme, backgroundColor);
    const txtColor = getThemeColor(theme, textColor);

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

export function Text({
    text = "Default Text",
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
        <p 
            className={`${fontStyle} ${className}`}
            style={{ color: textColor }}
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

export const componentList = [
    { name: "Title", title: "Title Component", component: Title },
    { name: "Image", title: "Image Component", component: Image },
    { name: "Button", title: "Button Component", component: Button },
    { name: "Text", title: "Text Component", component: Text },
];