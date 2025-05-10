import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import FormControlWrapper from "./FormControlWrapper";

export function Radio({ 
  title, 
  description,
  options = [], 
  default: defaultValue = "",
  value,
  onChange,
  name,
  required = false 
}) {
  const [selectedOption, setSelectedOption] = useState(value !== undefined ? value : defaultValue);
  
  useEffect(() => {
    if (value !== undefined) {
      setSelectedOption(value);
    }
  }, [value]);
  
  const handleOptionChange = (option) => {
    setSelectedOption(option);
    
    if (onChange) {
      onChange({
        target: {
          name,
          value: option,
          type: 'radio'
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
            type="radio"
            className="radio radio-primary"
            checked={selectedOption === option}
            onChange={() => handleOptionChange(option)}
            name={name}
            value={option}
          />
          <span className="label-text">{option}</span>
        </label>
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