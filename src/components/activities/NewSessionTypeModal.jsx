import { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../common/Modal";
import { useForm } from "../../hooks/useForm";
import { useActivities } from "../../contexts/ActivitiesContext";
import { useNotification } from "../../contexts/NotificationContext";

/**
 * Modal for creating a new session type
 */
export function NewSessionTypeModal({ isOpen, onClose, onSubmit }) {
  const initialValues = {
    type: "",
  };

  const { handleChange, values, resetForm, errors, setErrors } = useForm(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();

  const validate = () => {
    const newErrors = {};
    
    if (!values.type.trim()) {
      newErrors.type = "Session type is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({ type: values.type.trim() });
      resetForm();
      showNotification("Session type created successfully", "success");
    } catch (error) {
      console.error("Error creating session type:", error);
      showNotification(
        error.response?.data?.message || "Failed to create session type",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    resetForm();
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Create New Session Type"
    >
      <div className="">
        <form onSubmit={handleSubmitForm}>
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium mb-1">
              Session Type <span className="text-error">*</span>
            </label>
            <input
              type="text"
              id="type"
              name="type"
              value={values.type}
              onChange={handleChange}
              className={`input input-bordered w-full ${errors.type ? 'input-error' : ''}`}
              placeholder="Enter session type name"
            />
            {errors.type && <p className="text-error text-sm mt-1">{errors.type}</p>}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Creating...
                </>
              ) : (
                "Create Type"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

NewSessionTypeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}; 