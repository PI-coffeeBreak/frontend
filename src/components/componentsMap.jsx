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
    labelColor = "text-white",
    backgroundColor = "bg-primary",
    disabled = false,
    className = "",
}) {
    return (
        <a
            href={URL}
            method={METHOD}
            className={`btn ${backgroundColor} ${labelColor} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={(e) => disabled && e.preventDefault()} // Prevent action if disabled
        >
            {text}
        </a>
    );
}

export function Text({
    content = "Default Text",
    color = "text-black",
    bold = false,
    italic = false,
    underline = false,
    className = "",
}) {
    const fontStyle = `${bold ? "font-bold" : ""} ${italic ? "italic" : ""} ${underline ? "underline" : ""}`;
    return <p className={`${color} ${fontStyle} ${className}`}>{content}</p>;
}

export function Heading({
    text = "Default Heading",
    level = 2,
    color = "text-black",
    bold = false,
    italic = false,
    underline = false,
    className = "",
}) {
    const Tag = `h${level}`;
    const fontStyle = `${bold ? "font-bold" : ""} ${italic ? "italic" : ""} ${underline ? "underline" : ""}`;
    return <Tag className={`${color} ${fontStyle} ${className}`}>{text}</Tag>;
}