import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

export function NumberInput({
  title,
  description,
  min,
  max,
  step = 1,
  default: defaultValue = null,
  value: controlledValue,
  onChange,
  name,
  required = false,
  placeholder = ""
}) {
  const [inputValue, setInputValue] = useState(() => {
    if (controlledValue !== undefined) return controlledValue;
    if (defaultValue !== null) return defaultValue;
    return "";
  });

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInputValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = (e) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);
    
    if (onChange) {
      const numValue = rawValue === "" ? "" : Number(rawValue);
      onChange({
        target: {
          name: name,
          value: numValue,
          type: 'number'
        }
      });
    }
  };

  return (
    <div className="form-control w-full mb-4">
      <label htmlFor={`number-input-${name}`} className="label">
        <span className="label-text font-medium">
          {title}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>

      {description && (
        <span className="text-sm text-base-content/70 mb-2">{description}</span>
      )}

      <input
        id={`number-input-${name}`}
        type="number"
        className="input input-bordered w-full"
        value={inputValue === null ? "" : inputValue}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        name={name}
        required={required}
        placeholder={placeholder}
      />

      {min !== undefined && max !== undefined && (
        <div className="flex justify-between text-xs text-base-content/70 mt-1">
          <span>Min: {min}</span>
          <span>Max: {max}</span>
        </div>
      )}
    </div>
  );
}

NumberInput.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  default: PropTypes.number,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  onChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
  placeholder: PropTypes.string
};

export default NumberInput;