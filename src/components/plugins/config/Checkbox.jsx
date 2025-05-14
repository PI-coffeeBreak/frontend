import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import FormControlWrapper from "./FormControlWrapper";

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

  const renderOptions = () => (
    <div className="space-y-2">
      {options.map((option) => (
        <label 
          key={`${name}-${option}`}
          className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded-md transition-colors"
        >
          <input 
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={selectedOptions.includes(option)}
            onChange={() => handleOptionChange(option)}
            name={`${name}[${option}]`}
            value={option}
          />
          <span className="label-text">{option}</span>
        </label>
      ))}

      {/* Hidden inputs to ensure all selected values are submitted in a form */}
      {selectedOptions.map((option) => (
        <input 
          key={`${name}-hidden-${option}`}
          type="hidden"
          name={name}
          value={option}
        />
      ))}
    </div>
  );

  return (
    <FormControlWrapper 
      title={title}
      description={description}
      required={required}
    >
      {renderOptions()}
    </FormControlWrapper>
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