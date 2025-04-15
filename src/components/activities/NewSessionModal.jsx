import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../common/Modal";
import { useForm } from "../../hooks/useForm";
import { useActivities } from "../../contexts/ActivitiesContext";
import { useNotification } from "../../contexts/NotificationContext";
import { FaCloudUploadAlt, FaExclamationTriangle } from "react-icons/fa";

// Extract form fields into a separate component
const FormField = ({ label, id, type = "text", required = false, error, children }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium mb-1">
      {label} {required && <span className="text-error">*</span>}
    </label>
    {children}
    {error && <p className="text-error text-sm mt-1">{error}</p>}
  </div>
);

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  children: PropTypes.node.isRequired
};

/**
 * Modal for creating a new activity/session
 */
export function NewSessionModal({ isOpen, onClose, onSubmit }) {
  // Get activity types from context
  const { activityTypes, loading, createActivityType } = useActivities();
  const { showNotification } = useNotification();
  
  const initialValues = {
    name: "",
    description: "",
    date: "",
    duration: 30,
    type_id: "",
    topic: "",
    speaker: "",
    facilitator: "",
    image: null,
  };

  const { 
    values, 
    handleChange, 
    handleFileChange, 
    resetForm, 
    errors, 
    setErrors,
    setFieldValue
  } = useForm(initialValues);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingTypeInline, setIsAddingTypeInline] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [isAddingType, setIsAddingType] = useState(false);

  // Set default type_id when activityTypes are loaded
  useEffect(() => {
    if (activityTypes?.length > 0 && !values.type_id) {
      setFieldValue('type_id', activityTypes[0]?.id || "");
    }
  }, [activityTypes, values.type_id, setFieldValue]);

  // Extract validation to a separate function
  const validate = () => {
    const newErrors = {};
    
    if (!values.name.trim()) newErrors.name = "Name is required";
    if (!values.description.trim()) newErrors.description = "Description is required";
    if (!values.type_id) newErrors.type_id = "Type is required";
    
    // Validate date if present
    if (values.date) {
      validateDate(values.date, newErrors);
    }
    
    // Validate meeting link if session is online
    if (values.is_online && !values.meeting_link) {
      newErrors.meeting_link = "Meeting link is required for online sessions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Extract date validation
  const validateDate = (date, errors) => {
    try {
      const sessionDate = new Date(date);
      if (sessionDate < new Date()) {
        errors.date = "Date cannot be in the past";
      }
    } catch (e) {
      errors.date = "Invalid date format";
    }
  };

  // Extract file handling
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size and type
    if (!validateFile(file)) return;
    
    handleFileChange(e);
    setImagePreview(URL.createObjectURL(file));
  };

  // Extract file validation
  const validateFile = (file) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Image size must be less than 5MB", "error");
      return false;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showNotification("Only JPEG, PNG and WebP images are allowed", "error");
      return false;
    }
    
    return true;
  };

  // Extract data formatting
  const formatDataForSubmission = () => {
    return {
      name: values.name,
      description: values.description,
      date: values.date ? new Date(values.date).toISOString() : undefined,
      duration: parseInt(values.duration, 10),
      type_id: typeof values.type_id === 'string' ? parseInt(values.type_id, 10) : values.type_id,
      topic: values.topic || "",
      speaker: values.speaker || "",
      facilitator: values.facilitator || "",
      ...(imagePreview && { image: values.image })
    };
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      // Format data according to API expectations
      const formattedData = formatDataForSubmission();

      console.log("Submitting session data:", formattedData);
      
      await onSubmit(formattedData);
      resetForm();
      setImagePreview(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      showNotification(
        error.response?.data?.message || "Failed to create session",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    resetForm();
    setImagePreview(null);
    setErrors({});
    onClose();
  };

  const handleSaveInlineType = async () => {
    if (!newTypeName.trim()) return;
    
    setIsAddingType(true);
    
    try {
      const typeData = { type: newTypeName.trim() };
      const newType = await createActivityType(typeData);
      
      setFieldValue('type_id', newType.id);
      setNewTypeName("");
      setIsAddingTypeInline(false);
      
      showNotification(`Activity type "${newTypeName}" was created successfully`, "success");
    } catch (error) {
      console.error("Error creating activity type:", error);
      showNotification("Failed to create activity type", "error");
    } finally {
      setIsAddingType(false);
    }
  };

  // Extract type selector to a separate component
  const renderTypeSelector = () => {
    if (isAddingTypeInline) {
      return renderTypeCreator();
    }
    
    return (
      <div className="border rounded-lg overflow-hidden">
        <select
          id="type_id"
          name="type_id"
          value={values.type_id}
          onChange={handleChange}
          className={`select w-full border-none ${errors.type_id ? 'select-error' : ''}`}
        >
          <option value="" disabled>Select a type</option>
          {activityTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.type}
            </option>
          ))}
        </select>
        
        <div className="border-t border-base-300 px-3 py-2">
          <button
            type="button"
            className="btn btn-sm btn-ghost btn-block text-primary justify-start px-0"
            onClick={() => {
              setIsAddingTypeInline(true);
              setNewTypeName("");
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-4 h-4 mr-2 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add New Type
          </button>
        </div>
      </div>
    );
  };

  // Extract type creator to a separate component
  const renderTypeCreator = () => {
    return (
      <div className="flex items-center border rounded-lg overflow-hidden">
        <input
          type="text"
          placeholder="Enter new type name"
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          className="input input-sm flex-grow border-none focus:outline-none"
        />
        {isAddingType ? (
          <span className="loading loading-spinner loading-sm mx-2"></span>
        ) : (
          <div className="flex border-l">
            <button
              type="button"
              className="btn btn-sm btn-ghost px-2"
              onClick={() => setIsAddingTypeInline(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary px-2"
              onClick={handleSaveInlineType}
              disabled={!newTypeName.trim()}
            >
              Save
            </button>
          </div>
        )}
      </div>
    );
  };

  // Extract image upload to a separate component
  const renderImageUploader = () => {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input
          type="file"
          id="image"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {!imagePreview ? (
          <button
            type="button"
            onClick={() => document.getElementById('image').click()}
            className="w-full h-full py-4 flex flex-col items-center cursor-pointer bg-transparent"
            aria-label="Upload image"
          >
            <FaCloudUploadAlt className="mx-auto text-3xl text-gray-400" />
            <p className="mt-2">Click to upload an image</p>
            <p className="text-xs text-gray-500">JPG, PNG or WebP (max 5MB)</p>
          </button>
        ) : (
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded-lg" 
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-error text-white rounded-full p-1"
              onClick={() => {
                setImagePreview(null);
                setFieldValue('image', null);
              }}
              aria-label="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Create New Session"
      description="Fill in the details to create a new session."
    >
      {loading ? (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <form onSubmit={handleSubmitForm}>
          <div className="space-y-4">
            {/* Name field */}
            <FormField label="Name" id="name" required error={errors.name}>
              <input
                type="text"
                id="name"
                name="name"
                value={values.name}
                onChange={handleChange}
                placeholder="Enter the session title"
                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
              />
            </FormField>

            {/* Description field */}
            <FormField label="Description" id="description" required error={errors.description}>
              <textarea
                id="description"
                name="description"
                value={values.description}
                onChange={handleChange}
                placeholder="Enter the session description"
                className={`textarea textarea-bordered w-full h-24 ${errors.description ? 'textarea-error' : ''}`}
              />
            </FormField>

            {/* Type field with inline create option */}
            <FormField label="Type" id="type_id" required error={errors.type_id}>
              <div className={`relative ${errors.type_id ? 'border-error' : 'border-base-300'}`}>
                {renderTypeSelector()}
              </div>
            </FormField>

            {/* Date and Duration fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Date & Time" id="date" error={errors.date}>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={values.date}
                  onChange={handleChange}
                  className={`input input-bordered w-full ${errors.date ? 'input-error' : ''}`}
                />
              </FormField>
              
              <FormField label="Duration (minutes)" id="duration">
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={values.duration}
                  onChange={handleChange}
                  min="1"
                  className="input input-bordered w-full"
                />
              </FormField>
            </div>

            {/* Registration Options */}
            <div className="bg-base-200 p-3 rounded-lg">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="requires_registration"
                  name="requires_registration"
                  checked={values.requires_registration}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                <label htmlFor="requires_registration" className="ml-2 block font-medium">
                  Require registration
                </label>
              </div>

              {values.requires_registration && (
                <div>
                  <label htmlFor="max_participants" className="block text-sm font-medium mb-1">
                    Maximum participants (0 = unlimited)
                  </label>
                  <input
                    type="number"
                    id="max_participants"
                    name="max_participants"
                    value={values.max_participants}
                    onChange={handleChange}
                    min="0"
                    className="input input-bordered w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set to 0 for unlimited participants
                  </p>
                </div>
              )}
            </div>

            {/* Topic field */}
            <FormField label="Topic" id="topic">
              <input
                type="text"
                id="topic"
                name="topic"
                value={values.topic}
                onChange={handleChange}
                placeholder="Enter the session topic"
                className="input input-bordered w-full"
              />
            </FormField>

            {/* Speaker and Facilitator fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Speaker" id="speaker">
                <input
                  type="text"
                  id="speaker"
                  name="speaker"
                  value={values.speaker}
                  onChange={handleChange}
                  placeholder="Enter the speaker's name"
                  className="input input-bordered w-full"
                />
              </FormField>
              
              <FormField label="Facilitator" id="facilitator">
                <input
                  type="text"
                  id="facilitator"
                  name="facilitator"
                  value={values.facilitator}
                  onChange={handleChange}
                  placeholder="Enter the facilitator's name"
                  className="input input-bordered w-full"
                />
              </FormField>
            </div>

            {/* Image field */}
            <FormField label="Image" id="image">
              {renderImageUploader()}
            </FormField>

            {/* Required fields note */}
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <FaExclamationTriangle />
              <span>Fields marked with <span className="text-error">*</span> are required</span>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Session"
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

NewSessionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default NewSessionModal;