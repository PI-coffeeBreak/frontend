import { useState, useCallback } from 'react';

/**
 * Custom hook to manage form state and validation
 * 
 * @param {Object} initialValues - Initial values for the form
 * @returns {Object} Form state and handlers
 */
export function useForm(initialValues = {}) {
  // State for form values
  const [values, setValues] = useState(initialValues);
  
  // State for validation errors
  const [errors, setErrors] = useState({});
  
  // State for tracking touched fields (for validation)
  const [touched, setTouched] = useState({});

  /**
   * Handle change for text inputs, checkboxes, selects, etc.
   * 
   * @param {Event} e - Change event from form element
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    // Determine the new value based on input type
    let newValue;
    
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'number' && value !== '') {
      newValue = Number(value);
    } else {
      newValue = value;
    }
    
    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Clear error for this field when it changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Handle file input changes
   * 
   * @param {Event} e - Change event from file input
   */
  const handleFileChange = useCallback((e) => {
    const { name, files } = e.target;
    
    if (files && files.length > 0) {
      setValues(prev => ({
        ...prev,
        [name]: files[0]
      }));
      
      // Mark field as touched
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
      
      // Clear error for this field
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  }, [errors]);

  /**
   * Set a specific field value programmatically
   * 
   * @param {string} name - Field name
   * @param {any} value - Field value
   */
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when it changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Update multiple fields at once
   * 
   * @param {Object} fieldValues - Object with field name/value pairs
   */
  const setMultipleValues = useCallback((fieldValues) => {
    setValues(prev => ({
      ...prev,
      ...fieldValues
    }));
    
    // Clear errors for these fields
    const fieldNames = Object.keys(fieldValues);
    if (fieldNames.some(name => errors[name])) {
      setErrors(prev => {
        const newErrors = { ...prev };
        fieldNames.forEach(name => {
          if (newErrors[name]) delete newErrors[name];
        });
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Reset form to initial values
   * 
   * @param {Object} newValues - New values to reset to (optional)
   */
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  /**
   * Validate form using validation schema
   * 
   * @param {Object} validationSchema - Object with validation functions for each field
   * @returns {boolean} Whether form is valid
   */
  const validate = useCallback((validationSchema) => {
    // If no schema provided, return true (valid)
    if (!validationSchema) return true;
    
    const newErrors = {};
    
    // Run validation for each field
    Object.keys(validationSchema).forEach(fieldName => {
      // Get validation function for this field
      const validateField = validationSchema[fieldName];
      
      if (typeof validateField === 'function') {
        // Get error message (if any) from validation function
        const error = validateField(values[fieldName], values);
        if (error) {
          newErrors[fieldName] = error;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  /**
   * Mark all fields as touched (useful when submitting)
   */
  const touchAll = useCallback(() => {
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    
    setTouched(allTouched);
  }, [values]);

  /**
   * Mark a specific field as touched
   * 
   * @param {string} name - Field name
   */
  const touchField = useCallback((name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  return {
    // Form state
    values,
    errors,
    touched,
    
    // Field handlers
    handleChange,
    handleFileChange,
    setFieldValue,
    setMultipleValues,
    
    // Form-level handlers
    setValues,
    setErrors,
    resetForm,
    validate,
    touchAll,
    touchField,
    
    // Utility
    isValid: Object.keys(errors).length === 0
  };
}