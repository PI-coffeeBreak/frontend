import React from "react";

export function Title({
    text = "Default Title",
    color = "text-black",
    bold = false,
    italic = false,
    underline = false,
    className = "",
}) {
    const fontStyle = `${bold ? "font-bold" : ""} ${italic ? "italic" : ""} ${underline ? "underline" : ""}`;
    return <h1 className={`text-2xl ${color} ${fontStyle} ${className}`}>{text}</h1>;
}

export function Image({
    src = "https://via.placeholder.com/150",
    alt = "Placeholder",
    className = "",
}) {
    return <img src={src} alt={alt} className={`rounded shadow ${className}`} />;
}

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

export function Heading({
    text = "Default Heading",
    level = 2,
    color = "black", // Default to "black"
    bold = false,
    italic = false,
    underline = false,
    className = "",
}) {
    const Tag = `h${level}`;
    const fontStyle = `${bold ? "font-bold" : ""} ${italic ? "italic" : ""} ${underline ? "underline" : ""}`;
    const colorClass = `text-${color}`; // Dynamically apply the Tailwind class for text color
    return <Tag className={`${colorClass} ${fontStyle} ${className}`}>{text}</Tag>;
}

// Map component names without "Component" suffix
export const componentMap = {
    TitleComponent: Title,
    ImageComponent: Image,
    ButtonComponent: Button,
    TextComponent: Text,
    HeadingComponent: Heading,
};