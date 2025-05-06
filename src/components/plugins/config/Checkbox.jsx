import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

export function Checkbox({ 
  title, 
  description,
  options = [], 
  default: defaultValues = [],
  value,
  onChange,
  name,
  required = false 
}) {
  const [selectedOptions, setSelectedOptions] = useState(value || [...defaultValues]);
  
  // Keep internal state in sync with external value (for controlled component)
  useEffect(() => {
    if (value !== undefined) {
      setSelectedOptions(value);
    }
  }, [value]);
  
  const handleOptionChange = (option) => {
    const newSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option];
    
    setSelectedOptions(newSelectedOptions);
    
    if (onChange) {
      onChange({
        target: {
          name,
          value: newSelectedOptions,
          type: 'checkbox'
        }
      });
    }
  };

  return (
    <div className="form-control w-full mb-4 px-2 flex flex-col">
      <div className="flex flex-col">
        <label className="label">
          <span className="label-text font-medium">
            {title}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
        {description && (
          <span className="text-sm text-base-content/70">{description}</span>
        )}
      </div>

      <div className="space-y-2">
        {options.map((option, idx) => (
          <label 
            key={idx} 
            className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded-md transition-colors"
          >
            <input 
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={selectedOptions.includes(option)}
              onChange={() => handleOptionChange(option)}
              name={`${name}[${idx}]`}
              value={option}
            />
            <span className="label-text">{option}</span>
          </label>
        ))}
      </div>

      {/* Hidden inputs to ensure all selected values are submitted in a form */}
      {selectedOptions.map((option, idx) => (
        <input 
          key={idx}
          type="hidden"
          name={name}
          value={option}
        />
      ))}
    </div>
  );
}

Checkbox.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
  default: PropTypes.arrayOf(PropTypes.string),
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool
};

export default Checkbox;