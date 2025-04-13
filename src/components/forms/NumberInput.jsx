import React from "react";
import PropTypes from "prop-types";

export function NumberInput({
    name,
    value,
    onChange,
    label,
    placeholder,
    min,
    max,
    step,
    required,
    className = "",
    disabled = false,
}) {
    return (
        <div className="form-control w-full">
            {label && (
                <label className="label">
                    <span className="label-text">{label}{required && " *"}</span>
                </label>
            )}
            <input
                type="number"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                required={required}
                disabled={disabled}
                className={`input input-bordered w-full ${className}`}
            />
        </div>
    );
}

NumberInput.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    required: PropTypes.bool,
    className: PropTypes.string,
    disabled: PropTypes.bool,
}; 