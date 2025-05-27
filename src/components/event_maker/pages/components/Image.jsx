import React from "react";
import PropTypes from "prop-types";
import { baseUrl } from "../../../../consts";
import { useMedia } from "../../../../contexts/MediaContext";

export function Image({
    src = "https://via.placeholder.com/150",
    alt = "Placeholder",
    className = "",
    maxHeight = "300px", // Default max height
}) {
    const { getMediaUrl } = useMedia();

    // Handle Media object type and empty values
    let imgSrc;
    
    if (typeof src === 'object' && src?.uuid) {
        // Use Media context for UUID-based media
        imgSrc = getMediaUrl(src.uuid);
    } else if (typeof src === 'string' && RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i).exec(src)) {
        // It's a UUID string, use Media context
        imgSrc = getMediaUrl(src);
    } else {
        // Use the provided src or fallback
        imgSrc = src || "https://via.placeholder.com/150";
    }

    return (
        <img 
            src={imgSrc} 
            alt={alt} 
            className={`rounded shadow ${className}`}
            style={{
                maxHeight,
                width: 'auto',
                objectFit: 'contain'
            }}
        />
    );
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
    maxHeight: PropTypes.string,
}; 