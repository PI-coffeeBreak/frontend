import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

export function ComposedText({ 
  title,
  description,
  name,
  default: defaultValue = { name: "", content: "" },
  value: controlledValue,
  onChange,
  required = false
}) {
  const [composedValue, setComposedValue] = useState(() => {
    if (controlledValue !== undefined) return controlledValue;
    return defaultValue || { name: "", content: "" };
  });

  useEffect(() => {
    if (controlledValue !== undefined) {
      setComposedValue(controlledValue);
    }
  }, [controlledValue]);

  const handleNameChange = (e) => {
    const newValue = {
      ...composedValue,
      name: e.target.value
    };
    setComposedValue(newValue);
    
    if (onChange) {
      onChange({
        target: {
          name,
          value: newValue,
          type: 'composedText'
        }
      });
    }
  };

  const handleContentChange = (e) => {
    const newValue = {
      ...composedValue,
      content: e.target.value
    };
    setComposedValue(newValue);
    
    if (onChange) {
      onChange({
        target: {
          name,
          value: newValue,
          type: 'composedText'
        }
      });
    }
  };

  return (
    <div className="form-control w-full mb-4 px-2 flex flex-col">
      <label className="label">
        <span className="label-text font-medium">
          {title}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      
      {description && (
        <span className="text-sm text-base-content/70">{description}</span>
      )}

      <div className="space-y-2">
        {/* Template Name Input */}
        <div>
          <label htmlFor={`${name}-name-input`} className="text-xs text-base-content/70 mb-1 block">
            Template Name
          </label>
          <input
            id={`${name}-name-input`}
            type="text"
            className="input input-bordered w-full"
            placeholder="Enter template name"
            value={composedValue.name}
            onChange={handleNameChange}
            name={`${name}-name`}
            required={required}
          />
        </div>

        {/* Template Text Textarea */}
        <div>
          <label htmlFor={`${name}-content-input`} className="text-xs text-base-content/70 mb-1 block">
            Template Content
          </label>
          <textarea
            id={`${name}-content-input`}
            className="textarea textarea-bordered w-full h-32"
            placeholder="Enter content..."
            value={composedValue.content}
            onChange={handleContentChange}
            name={`${name}-content`}
            required={required}
          />
        </div>
      </div>
      
      {/* Hidden input to store the full object value when submitting forms */}
      <input 
        type="hidden" 
        name={name} 
        value={JSON.stringify(composedValue)} 
      />
    </div>
  );
}

ComposedText.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  name: PropTypes.string.isRequired,
  default: PropTypes.shape({
    name: PropTypes.string,
    content: PropTypes.string
  }),
  value: PropTypes.shape({
    name: PropTypes.string,
    content: PropTypes.string
  }),
  onChange: PropTypes.func,
  required: PropTypes.bool
};

export default ComposedText;