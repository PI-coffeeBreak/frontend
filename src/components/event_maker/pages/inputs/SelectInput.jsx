import React from "react";
import PropTypes from "prop-types";

export const SelectInput = ({ label, name, value, options, onChange }) => (
    <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700">{label}</label>
        <select
            name={name}
            value={value || ""}
            onChange={onChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

SelectInput.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    onChange: PropTypes.func.isRequired,
};