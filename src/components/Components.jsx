import React from "react";
import PropTypes from "prop-types";

export function Title({
    text = "Default Title",
    color = "black", // Default to "black"
    bold = false,
    italic = false,
    underline = false,
    className = "",
}) {
    const fontStyle = `${bold ? "font-bold" : ""} ${italic ? "italic" : ""} ${underline ? "underline" : ""}`;
    const colorClass = `text-${color}`; // Dynamically apply the Tailwind class for text color
    return <h1 className={`text-2xl ${colorClass} ${fontStyle} ${className}`}>{text}</h1>;
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
    backgroundColor = "primary", // Background color (e.g., "primary", "success")
    textColor = "primary-content", // Text color (e.g., "primary-content", "white")
    disabled = false,
}) {
    // Map props to Tailwind CSS classes
    const backgroundClass = `btn-${backgroundColor}`;
    const textClass = `text-${textColor}`;

    return (
        <a
            href={URL}
            method={METHOD}
            className={`btn ${backgroundClass} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={(e) => disabled && e.preventDefault()} // Prevent action if disabled
        >
            <span className={textClass}>{text}</span>
        </a>
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
    color = "black", // Default to "black"
    bold = false,
    italic = false,
    underline = false,
    className = "",
}) {
    const fontStyle = `${bold ? "font-bold" : ""} ${italic ? "italic" : ""} ${underline ? "underline" : ""}`;
    const colorClass = `text-${color}`; // Dynamically apply the Tailwind class for text color
    return <p className={`${colorClass} ${fontStyle} ${className}`}>{text}</p>;
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