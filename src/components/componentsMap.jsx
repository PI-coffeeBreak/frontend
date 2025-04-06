export function Title({ text = "Default Title", className = "", bold = false, italic = false }) {
    const fontStyle = `${bold ? "font-bold" : ""} ${italic ? "italic" : ""}`;
    return <h1 className={`text-2xl ${fontStyle} ${className}`}>{text}</h1>;
}

export function Image({ src = "https://via.placeholder.com/150", alt = "Placeholder", className = "" }) {
    return <img src={src} alt={alt} className={`rounded shadow ${className}`} />;
}

export function Button({
    text = "Click Me",
    METHOD = "GET",
    URL = "#",
    labelColor = "text-white",
    backgroundColor = "btn-primary",
}) {
    return (
        <a
            href={URL}
            method={METHOD}
            className={`btn ${backgroundColor} ${labelColor}`}
        >
            {text}
        </a>
    );
}

export function Text({ content = "Default Text", className = "", bold = false, italic = false }) {
    const fontStyle = `${bold ? "font-bold" : ""} ${italic ? "italic" : ""}`;
    return <p className={`${className} ${fontStyle}`}>{content}</p>;
}

export function Heading({ text = "Default Heading", level = 2, className = "", bold = false, italic = false }) {
    const Tag = `h${level}`;
    const fontStyle = `${bold ? "font-bold" : ""} ${italic ? "italic" : ""}`;
    return <Tag className={`${fontStyle} ${className}`}>{text}</Tag>;
}