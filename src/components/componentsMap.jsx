export function Title({ text = "Default Title", className = "" }) {
    return <h1 className={`text-2xl font-bold ${className}`}>{text}</h1>;
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

export function Text({ content = "Default Text", className = "" }) {
    return <p className={`text-gray-700 ${className}`}>{content}</p>;
}

export function Heading({ text = "Default Heading", level = 2, className = "" }) {
    const Tag = `h${level}`;
    return <Tag className={`font-semibold ${className}`}>{text}</Tag>;
}