import React from "react";
import PropTypes from "prop-types";

export function Alert({
    message = "Default Alert Message",
}) {
    return (
        <div className={`px-4 py-1 bg-warning text-warning-content rounded-xl shadow-lg max-w-4xl`}>
            <div className="text-base">{message}</div>
            <div className="text-xs opacity-75">
                {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
}

Alert.propTypes = {
    message: PropTypes.string,
    className: PropTypes.string,
}; 