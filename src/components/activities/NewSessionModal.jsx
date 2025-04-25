import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Modal } from "../common/Modal";
import { useForm } from "../../hooks/useForm";
import { useActivities } from "../../contexts/ActivitiesContext";
import { useNotification } from "../../contexts/NotificationContext";
import { FiUpload } from "react-icons/fi";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";

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


export function NewSessionModal({ isOpen, onClose, onSubmit }) {
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleChangeWithStop = (e) => {
    stopPropagation(e);
    handleChange(e);
  };

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
    requires_registration: false,
    max_participants: ""
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

  useEffect(() => {
    if (activityTypes?.length > 0 && !values.type_id) {
      setFieldValue('type_id', activityTypes[0]?.id || "");
    }
  }, [activityTypes, values.type_id, setFieldValue]);

  const validate = () => {
    const newErrors = {};
    
    if (!values.name.trim()) newErrors.name = "Name is required";
    if (!values.description.trim()) newErrors.description = "Description is required";
    if (!values.type_id) newErrors.type_id = "Type is required";

    if (values.date) {
      validateDate(values.date, newErrors);
    }

    if (values.is_online && !values.meeting_link) {
      newErrors.meeting_link = "Meeting link is required for online sessions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDate = (date, errors) => {
    try {
      const sessionDate = new Date(date);
      if (sessionDate < new Date()) {
        errors.date = "Date cannot be in the past";
      }
    } catch (e) {
      errors.date = "Invalid date format";
        showNotification("Invalid date format", "error");
        console.error("Invalid date format:", e);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFile(file)) return;
    
    handleFileChange(e);
    setImagePreview(URL.createObjectURL(file));
  };

  const validateFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Image size must be less than 5MB", "error");
      return false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showNotification("Only JPEG, PNG and WebP images are allowed", "error");
      return false;
    }
    
    return true;
  };

  const formatDataForSubmission = () => {
    let maxParticipants = 0;
    if (values.requires_registration && values.max_participants) {
      const parsedValue = parseInt(values.max_participants, 10);
      maxParticipants = !isNaN(parsedValue) ? parsedValue : 0;
    }

    return {
      name: values.name,
      description: values.description,
      date: values.date ? new Date(values.date).toISOString() : undefined,
      duration: parseInt(values.duration, 10),
      type_id: typeof values.type_id === 'string' ? parseInt(values.type_id, 10) : values.type_id,
      topic: values.topic || "",
      speaker: values.speaker || "",
      facilitator: values.facilitator || "",
      requires_registration: values.requires_registration || false,
      max_participants: maxParticipants,
      ...(imagePreview && { image: values.image })
    };
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
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

  const renderTypeSelector = () => {
    if (isAddingTypeInline) {
      return renderTypeCreator();
    }
    
    return (
      <div className="">
        <select
          id="type_id"
          name="type_id"
          value={values.type_id}
          onChange={handleChangeWithStop}
          className="select w-full"
        >
          <option value="" disabled>Select a type</option>
          {activityTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.type}
            </option>
          ))}
        </select>
      </div>
    );
  };

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

  const renderImageUploader = () => {
    const fileInputRef = useRef(null);
    
    const handleBrowseClick = () => {
      fileInputRef.current?.click();
    };
    
    const handleDrop = (event) => {
      event.preventDefault();
      event.stopPropagation();
  
      const file = event.dataTransfer.files[0];
      if (file) {
        handleFileSelect({ target: { files: [file] } });
      }
    };
    
    const handleClearFile = () => {
      setImagePreview(null);
      setFieldValue('image', null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    
    return (
      <div>
        {!imagePreview ? (
          <button
            type="button"
            className="w-full border-dashed border-2 rounded-xl p-4 text-center bg-transparent border-gray-400"
            onClick={handleBrowseClick}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="rounded-full bg-base-content w-16 h-16 mx-auto my-4 flex items-center justify-center">
              <FiUpload className="text-base-100 text-2xl" aria-hidden="true" />
            </div>
            
            <p>
              Drag and drop your image here or
              {' '}
              <span className="text-primary font-bold">Browse</span>
            </p>
            
            <p className="text-sm text-gray-400">
              Maximum file size: 5MB (JPG, PNG or WebP)
            </p>
          </button>
        ) : (
          <div className="bg-base-200 w-full p-4 rounded-lg relative">
            <button
              onClick={handleClearFile}
              className="text-primary hover:text-error absolute right-3 top-3"
              type="button"
              aria-label="Remove image"
            >
              <FaTrash aria-hidden="true" />
              <span className="sr-only">Remove image</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 overflow-hidden rounded-md">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <p className="font-medium">Image selected</p>
                <p className="text-sm text-gray-500">
                  Click to remove and upload a different image
                </p>
              </div>
            </div>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          id="image"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Create New Session"
      description=""
    >
      {loading ? (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <form onSubmit={handleSubmitForm}>
          <div className="space-y-2">
            <FormField label="Name" id="name" required error={errors.name}>
              <input
                type="text"
                id="name"
                name="name"
                value={values.name}
                onChange={handleChangeWithStop}
                placeholder="Enter the session title"
                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
              />
            </FormField>
            <FormField label="Description" id="description" required error={errors.description}>
              <textarea
                id="description"
                name="description"
                value={values.description}
                onChange={handleChangeWithStop}
                placeholder="Enter the session description"
                className={`textarea textarea-bordered w-full h-24 ${errors.description ? 'textarea-error' : ''}`}
              />
            </FormField>
            <FormField label="Type" id="type_id" required error={errors.type_id}>
              <div className={`relative ${errors.type_id ? 'border-error' : 'border-base-300'}`}>
                {renderTypeSelector()}
              </div>
            </FormField>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Date & Time" id="date" error={errors.date}>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={values.date}
                  onChange={handleChangeWithStop}
                  className={`input input-bordered w-full ${errors.date ? 'input-error' : ''}`}
                />
              </FormField>
              
              <FormField label="Duration (minutes)" id="duration">
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={values.duration}
                  onChange={handleChangeWithStop}
                  min="1"
                  className="input input-bordered w-full"
                />
              </FormField>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Registration" id="requires_registration">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requires_registration"
                    name="requires_registration"
                    checked={values.requires_registration}
                    onChange={handleChangeWithStop}
                    className="checkbox checkbox-primary mr-2"
                  />
                  <label htmlFor="requires_registration" className="block font-medium">
                    Require registration
                  </label>
                </div>
              </FormField>
              
              <FormField label="Maximum participants" id="max_participants">
                <input
                  type="number"
                  id="max_participants"
                  name="max_participants"
                  value={values.max_participants === 0 ? "" : values.max_participants}
                  onChange={handleChangeWithStop}
                  min="0"
                  disabled={!values.requires_registration}
                  className="input input-bordered w-full"
                  placeholder="Enter the maximum number of participants"
                />
              </FormField>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Activity Owner" id="activity_owner">
                <input
                  type="text"
                  id="activity_owner"
                  name="activity_owner"
                  value={values.speaker}
                  onChange={handleChangeWithStop}
                  placeholder="Enter the activity owner name"
                  className="input input-bordered w-full"
                />
              </FormField>
              <FormField label="Topic" id="topic">
                <input
                    type="text"
                    id="topic"
                    name="topic"
                    value={values.topic}
                    onChange={handleChangeWithStop}
                    placeholder="Enter the session topic"
                    className="input input-bordered w-full"
                />
              </FormField>
            </div>

            <FormField label="Image" id="image">
              {renderImageUploader()}
            </FormField>
          </div>

          <div className="mt-6 flex justify-end gap-2">
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