import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useActivities } from "../../contexts/ActivitiesContext";
import { useMedia } from "../../contexts/MediaContext";
import { useNotification } from "../../contexts/NotificationContext";
import { Modal } from "../common/Modal";
import { FaTrash, FaImage } from "react-icons/fa";
import { utcToLocalDatetimeLocal, localDatetimeLocalToUTC } from '../../utils/date';

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

export function EditActivityModal({ isOpen, onClose, activity }) {
  const { t } = useTranslation();
  const { activityTypes, updateActivity, fetchActivities } = useActivities();
  const { uploadMedia, getMediaUrl } = useMedia();
  const { showNotification } = useNotification();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type_id: "",
    topic: "",
    date: "",
    duration: "",
    image: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleChangeWithStop = (e) => {
    stopPropagation(e);
    handleChange(e);
  };

  useEffect(() => {
    if (activity) {
      let formattedDate = "";
      if (activity.date) {
        formattedDate = utcToLocalDatetimeLocal(activity.date);
        console.log("Formatted date:", formattedDate);
      }
      setFormData({
        name: activity.name || "",
        description: activity.description || "",
        type_id: activity.type_id || "",
        topic: activity.topic || "",
        date: formattedDate,
        duration: activity.duration || "",
        image: null,
      });
      
      // Reset image preview
      setImagePreview(null);
      
      // Set current image URL if it exists
      if (activity.image) {
        const imageUrl = getMediaUrl(activity.image);
        console.log("Setting current image URL:", imageUrl, "Image ID:", activity.image);
        setCurrentImageUrl(imageUrl);
      } else {
        console.log("No image for activity:", activity.id);
        setCurrentImageUrl(null);
      }
    }
  }, [activity, getMediaUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error for this field if any
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = t('validation.required');
    if (!formData.description.trim()) newErrors.description = t('validation.required');
    if (!formData.type_id) newErrors.type_id = t('validation.required');
    
    if (formData.date) {
      const activityDate = new Date(formData.date);

      if (isNaN(activityDate.getTime())) {
        newErrors.date = t('validation.invalidDate');
      } else if (activityDate < new Date()) {
        newErrors.date = t('validation.dateInPast');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFile(file)) return;
    
    setFormData(prev => ({
      ...prev,
      image: file,
    }));
    
    setImagePreview(URL.createObjectURL(file));
  };

  const validateFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      showNotification(t('common.media.sizeError'), "error");
      return false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showNotification(t('common.media.typeError'), "error");
      return false;
    }
    
    return true;
  };

  const buildUpdatePayload = () => {
    const payload = {
      name: formData.name,
      description: formData.description,
      type_id: parseInt(formData.type_id, 10),
      topic: formData.topic || "",
    };

    if (formData.date) payload.date = localDatetimeLocalToUTC(formData.date);
    if (formData.duration) payload.duration = parseInt(formData.duration, 10);

    return payload;
  };

  const updateImageIfNeeded = async (updatedActivity) => {
    if (!formData.image) return;

    try {
      if (activity.image) {
        // Update existing image
        await uploadMedia(activity.image, formData.image, true);
      } else if (updatedActivity?.image) {
        // Upload new image
        await uploadMedia(updatedActivity.image, formData.image, false);
      } else {
        console.error("Updated activity lacks image field");
        showNotification(t('common.media.noImageField'), "warning");
      }
    } catch (imageError) {
      console.error("Error uploading image:", imageError);
      showNotification(t('common.media.uploadError'), "warning");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const updatePayload = buildUpdatePayload();
      const updatedActivity = await updateActivity(activity.id, updatePayload);

      await updateImageIfNeeded(updatedActivity);

      showNotification(t('activities.updateSuccess'), "success");
      handleCloseModal();

      fetchActivities();
    } catch (error) {
      console.error("Error updating activity:", error);
      showNotification(t('activities.updateError'), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setFormData({
      name: "",
      description: "",
      type_id: "",
      topic: "",
      date: "",
      duration: "",
      image: null,
    });
    setImagePreview(null);
    setCurrentImageUrl(null);
    setErrors({});
    onClose();
  };
  
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleClearFile = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const renderImageUploader = () => {
    const handleImageError = (e) => {
      console.error("Error loading image:", e.target.src);
      e.target.onerror = null;
      e.target.src = "https://placehold.co/600x400?text=Image+Not+Available";
    };
    let imageSection;
    if (imagePreview) {
      imageSection = (
        <div className="relative">
          <img
            src={imagePreview}
            alt={t('activities.imageAlt')}
            className="max-h-36 mx-auto rounded"
          />
          <button
            type="button"
            aria-label={t('common.media.removeImage')}
            onClick={(e) => {
              e.stopPropagation();
              handleClearFile();
            }}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm cursor-pointer"
          >
            <FaTrash className="text-error h-3 w-3" />
          </button>
        </div>
      );
    } else if (currentImageUrl) {
      imageSection = (
        <div className="relative">
          <img
            src={currentImageUrl}
            alt={t('activities.imageAlt')}
            className="max-h-36 mx-auto rounded"
            onError={handleImageError}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black opacity-0 hover:opacity-50 transition-opacity">
            <div className="text-white bg-opacity-10 rounded px-2 py-1 text-sm">
              {t('activities.currentImage')}
            </div>
          </div>
        </div>
      );
    } else {
      imageSection = (
        <div className="text-gray-500 py-3">
          <FaImage className="mx-auto h-10 w-10 mb-2" />
          <p className="text-sm">{t('common.media.selectImage')}</p>
        </div>
      );
    }
    return (
      <div className="mt-3">
        <p className="text-sm font-medium mb-2">{t('activities.image')}</p>

        <button
          type="button"
          aria-label={t('common.media.selectImage')}
          className="border border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer"
          onClick={handleBrowseClick}
        >
          {imageSection}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </button>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title={t('activities.editTitle')}
      size="compact"
    >
      <form onSubmit={handleSubmit} className="text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <FormField 
              label={t('activities.name')} 
              id="name" 
              required 
              error={errors.name}
            >
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChangeWithStop}
                className="input input-sm input-bordered w-full"
                required
              />
            </FormField>
          </div>
          
          <div className="md:col-span-2">
            <FormField 
              label={t('activities.description')} 
              id="description" 
              required 
              error={errors.description}
            >
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChangeWithStop}
                className="textarea textarea-bordered w-full"
                rows="2"
                required
              />
            </FormField>
          </div>
          
          <div>
            <FormField 
              label={t('activities.type')} 
              id="type_id" 
              required 
              error={errors.type_id}
            >
              <select
                id="type_id"
                name="type_id"
                value={formData.type_id}
                onChange={handleChangeWithStop}
                className="select select-bordered select-sm w-full"
                required
              >
                <option value="">{t('activities.selectType')}</option>
                {activityTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.type}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          
          <div>
            <FormField 
              label={t('activities.topic')} 
              id="topic"
            >
              <input
                type="text"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChangeWithStop}
                className="input input-sm input-bordered w-full"
              />
            </FormField>
          </div>
          
          <div>
            <FormField 
              label={t('activities.date')} 
              id="date"
              error={errors.date}
            >
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChangeWithStop}
                className="input input-sm input-bordered w-full"
              />
            </FormField>
          </div>
          
          <div>
            <FormField 
              label={t('activities.duration') + ' (min)'} 
              id="duration"
            >
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChangeWithStop}
                className="input input-sm input-bordered w-full"
                min="1"
              />
            </FormField>
          </div>
          
          <div className="md:col-span-2">
            {renderImageUploader()}
          </div>
        </div>
        
        <div className="flex justify-end mt-5 gap-2">
          <button
            type="button"
            onClick={handleCloseModal}
            className="btn btn-ghost btn-sm"
            disabled={isSubmitting}
          >
            {t('common.actions.cancel')}
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                {t('common.actions.saving')}
              </>
            ) : (
              t('common.actions.save')
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

EditActivityModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  activity: PropTypes.object,
}; 