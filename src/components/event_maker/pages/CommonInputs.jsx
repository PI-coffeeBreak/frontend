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

export const CheckboxInput = ({ label, name, checked, onChange }) => (
    <label className="flex items-center gap-2">
        <input
            type="checkbox"
            name={name}
            checked={checked || false}
            onChange={onChange}
            className="checkbox checkbox-primary"
        />
        <span className="text-xs font-medium text-gray-700">{label}</span>
    </label>
);

CheckboxInput.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
};

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