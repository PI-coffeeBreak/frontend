import React from "react";
import PropTypes from "prop-types";

function Toggle({ 
  title, 
  description, 
  text, 
  value = false, 
  onChange, 
  name,
  required = false
}) {
  const handleChange = () => {
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: !value,
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
          checked={value}
          onChange={handleChange}
          name={name}
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
  value: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool
};

export default Toggle;