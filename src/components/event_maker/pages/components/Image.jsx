import React from "react";
import PropTypes from "prop-types";
import { baseUrl } from "../../../../consts";
import { useMedia } from "../../../../contexts/MediaContext";

export function Image({
    src = "https://via.placeholder.com/150",
    alt = "Placeholder",
    className = "",
}) {
    const { getMediaUrl } = useMedia();

    // Handle Media object type and empty values
    let imgSrc;
    
    if (typeof src === 'object' && src?.uuid) {
        // Use Media context for UUID-based media
        imgSrc = getMediaUrl(src.uuid);
    } else if (typeof src === 'string' && src.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // It's a UUID string, use Media context
        imgSrc = getMediaUrl(src);
    } else {
        // Use the provided src or fallback
        imgSrc = src || "https://via.placeholder.com/150";
    }

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