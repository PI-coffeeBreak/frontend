import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

export function Radio({ 
  title, 
  description, 
  options = [], 
  default: defaultValue = null,
  value: controlledValue,
  onChange, 
  name,
  required = false
}) {
  const [selectedValue, setSelectedValue] = useState(controlledValue !== undefined ? controlledValue : defaultValue);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setSelectedValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = (optionValue) => {
    setSelectedValue(optionValue);
    
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: optionValue,
          type: 'radio'
        }
      });
    }
  };

  return (
    <div className="form-control w-full mb-4">
      <div className="flex flex-col mb-2">
        <label className="label">
          <span className="label-text font-medium">
            {title}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
        {description && (
          <span className="text-sm text-base-content/70 mt-1">{description}</span>
        )}
      </div>

      <div className="space-y-2 mt-2">
        {options.map((option, idx) => (
          <label 
            key={idx} 
            className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded-md transition-colors"
          >
            <input 
              type="radio" 
              className="radio radio-primary" 
              checked={selectedValue === option}
              onChange={() => handleChange(option)}
              name={name}
              value={option}
              required={required && idx === 0}
            />
            <span className="label-text">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

Radio.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
  default: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool
};

export default Radio;