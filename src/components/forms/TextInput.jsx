import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

export function TextInput({ 
  title,
  description,
  default: defaultValue = "",
  value: controlledValue,
  onChange,
  name,
  required = false,
  placeholder = ""
}) {
  const [inputValue, setInputValue] = useState(() => {
    if (controlledValue !== undefined) return controlledValue;
    return defaultValue;
  });

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInputValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (onChange) {
      onChange({
        target: {
          name,
          value: newValue,
          type: 'text'
        }
      });
    }
  };

  return (
    <div className="form-control w-full mb-4 px-2 flex flex-col">
      <label htmlFor={`text-input-${name}`} className="label">
        <span className="label-text font-medium">
          {title}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      
      {description && (
        <span className="text-sm text-base-content/70">{description}</span>
      )}
      
      <input
        id={`text-input-${name}`}
        type="text"
        name={name}
        value={inputValue}
        onChange={handleChange}
        className="input input-bordered w-full"
        placeholder={placeholder || description}
        required={required}
      />
    </div>
  );
}

TextInput.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  default: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
  placeholder: PropTypes.string
};

export default TextInput;