import React from "react";
import PropTypes from "prop-types";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export function Image({
    src = "https://via.placeholder.com/150",
    alt = "Placeholder",
    className = "",
}) {
    // Handle Media object type and empty values
    const imgSrc = typeof src === 'object' && src?.uuid
        ? `${baseUrl}/media/${src.uuid}`
        : src || "https://via.placeholder.com/150";

    return <img src={imgSrc} alt={alt} className={`rounded shadow ${className}`} />;
}

Image.propTypes = {
    src: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            uuid: PropTypes.string
        })
    ]),
    alt: PropTypes.string,
    className: PropTypes.string,
}; 