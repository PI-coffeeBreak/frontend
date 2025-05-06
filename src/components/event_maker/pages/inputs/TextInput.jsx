import React from "react";
import PropTypes from "prop-types";

export const TextInput = ({ label, name, value, onChange }) => (
    <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700">{label}</label>
        <input
            type="text"
            name={name}
            value={value || ""}
            onChange={onChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
        />
    </div>
);

TextInput.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};