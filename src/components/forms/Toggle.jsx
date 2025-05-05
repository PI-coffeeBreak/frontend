import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

export function Toggle({ 
  title, 
  description, 
  text, 
  default: defaultValue = false,
  value: controlledValue,
  onChange, 
  name,
  required = false
}) {
  const [isChecked, setIsChecked] = useState(() => {
    if (controlledValue !== undefined) return controlledValue;
    return defaultValue;
  });

  useEffect(() => {
    if (controlledValue !== undefined) {
      setIsChecked(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: newValue,
          type: 'checkbox'
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

      <label className="flex cursor-pointer items-center gap-3 hover:bg-base-200 p-2 rounded-md transition-colors">
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={isChecked}
          onChange={handleChange}
          name={name}
          required={required}
        />
        <span className="label-text">{text}</span>
      </label>
    </div>
  );
}

Toggle.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  text: PropTypes.string.isRequired,
  default: PropTypes.bool,
  value: PropTypes.bool,
  onChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool
};

export default Toggle;