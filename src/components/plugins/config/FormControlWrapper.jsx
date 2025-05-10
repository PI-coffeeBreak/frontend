import React from "react";
import PropTypes from "prop-types";

function FormControlWrapper({ title, description, required, children }) {
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
      {children}
    </div>
  );
}

FormControlWrapper.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  required: PropTypes.bool,
  children: PropTypes.node.isRequired
};

export default FormControlWrapper;