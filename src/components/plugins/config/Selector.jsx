import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

export function Selector({ 
  title, 
  description,
  options = [],
  default: defaultValue = "",
  value: controlledValue,
  onChange,
  name,
  required = false
}) {
  const [selectedValue, setSelectedValue] = useState(() => {
    if (controlledValue !== undefined) return controlledValue;
    return defaultValue;
  });

  useEffect(() => {
    if (controlledValue !== undefined) {
      setSelectedValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setSelectedValue(newValue);
    
    if (onChange) {
      onChange({
        target: {
          name,
          value: newValue,
          type: 'select'
        }
      });
    }
  };

  return (
    <div className="form-control w-full mb-4 px-2 flex flex-col">
      <label htmlFor={`selector-${name}`} className="label">
        <span className="label-text font-medium">
          {title}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      
      {description && (
        <span className="text-sm text-base-content/70">{description}</span>
      )}
      
      <select 
        id={`selector-${name}`}
        className="select select-bordered w-full" 
        value={selectedValue}
        onChange={handleChange}
        name={name}
        required={required}
      >
        <option value="" disabled>Select an option</option>
        {Array.isArray(options) && options.map(option => {
          const value = typeof option === 'object' ? option.value : option;
          const label = typeof option === 'object' ? option.label : option;
          
          return (
            <option key={`${name}-${value}`} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
}

Selector.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  options: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      })
    ),
  ]),
  default: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool
};

export default Selector;