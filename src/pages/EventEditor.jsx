import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEvent } from "../contexts/EventContext";
import { useNotification } from "../contexts/NotificationContext";
import { useKeycloak } from "@react-keycloak/web";
import { baseUrl } from "../consts";
import { axiosWithAuth } from "../utils/axiosWithAuth";
import axios from "axios";
import { FaRegCalendarAlt, FaMapMarkerAlt, FaImage, FaInfoCircle } from "react-icons/fa";
import PropTypes from "prop-types";

export function EventEditor() {
  const { eventInfo, isLoading: isEventLoading, updateEventInfo } = useEvent();
  const { showNotification } = useNotification();
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  
  const fileInputRef = useRef(null);
  const locationTimeoutRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    image: null
  });
  
  const [errors, setErrors] = useState({});

  // Initialize form with event data
  useEffect(() => {
    if (eventInfo) {
      setFormData({
        eventName: eventInfo.name || "",
        description: eventInfo.description || "",
        startDate: eventInfo.start_time ? formatDateForInput(eventInfo.start_time) : "",
        endDate: eventInfo.end_time ? formatDateForInput(eventInfo.end_time) : "",
        location: eventInfo.location || "",
        image: null // We don't load the image itself, just display it
      });
      
      // Set image preview if available
      if (eventInfo.image_id) {
        setImagePreview(`${baseUrl}/media/${eventInfo.image_id}`);
      }
    }
  }, [eventInfo]);
  
  // Helper function to format date for datetime-local input
  const formatDateForInput = (isoString) => {
    const date = new Date(isoString);
    return date.toISOString().slice(0, 16); // Format as "YYYY-MM-DDThh:mm"
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.eventName) newErrors.eventName = "Event name is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    if (!formData.location) newErrors.location = "Location is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleLocationChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, location: value }));
    
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }
    
    if (value.length < 3) {
      setLocationSuggestions([]);
      return;
    }
    
    setIsLoadingLocations(true);
    
    locationTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await axios.get(`https://api.geoapify.com/v1/geocode/autocomplete`, {
          params: {
            text: value,
            apiKey: import.meta.env.VITE_GEOAPIFY_API_KEY,
            format: 'json'
          }
        });
        
        const suggestions = response.data.results.map(result => ({
          name: result.formatted,
          lat: result.lat,
          lon: result.lon
        }));
        
        setLocationSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    }, 300);
  };
  
  const handleLocationSelect = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      location: suggestion.name
    }));
    setLocationSuggestions([]);
  };
  
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification("Image size should be less than 5MB", "error");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        showNotification("Please upload an image file", "error");
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    
    // If we have an existing image from the server, don't clear the preview
    if (!eventInfo?.image_id) {
      setImagePreview(null);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification("Please correct the errors in the form", "error");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update event info
      const eventData = {
        name: formData.eventName,
        description: formData.description,
        start_time: formData.startDate,
        end_time: formData.endDate,
        location: formData.location,
      };
      
      await updateEventInfo(eventData);
      
      // Upload new image if selected
      if (formData.image) {
        try {
          const imageFormData = new FormData();
          imageFormData.append('file', formData.image);
          
          // Upload using the existing image ID or get a new one
          const imageId = eventInfo?.image_id;
          
          await axiosWithAuth(keycloak).post(
            `${baseUrl}/media/${imageId}`,
            imageFormData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          showNotification("Event updated but image upload failed", "warning");
          setIsSubmitting(false);
          return;
        }
      }
      
      showNotification("Event updated successfully", "success");
      navigate('/instantiate/eventmaker');
    } catch (error) {
      console.error('Error updating event:', error);
      showNotification(error.response?.data?.message || "Failed to update event", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderLocationSuggestions = () => {
    if (!locationSuggestions.length && !isLoadingLocations) return null;
    
    return (
      <div className="absolute w-full mt-1 bg-base-100 rounded-xl shadow-lg z-50 max-h-60 overflow-auto">
        {isLoadingLocations ? (
          <div className="p-4 text-center">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : (
          locationSuggestions.map((suggestion, index) => (
            <button
              key={`location-${suggestion.lat}-${suggestion.lon}`}
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-base-200 cursor-pointer"
              onClick={() => handleLocationSelect(suggestion)}
            >
              {suggestion.name}
            </button>
          ))
        )}
      </div>
    );
  };
  
  if (isEventLoading) {
    return (
      <div className="flex justify-center items-center min-h-svh">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  
  return (
    <div className="w-full min-h-svh p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-primary">Event Settings</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <FaInfoCircle className="text-primary" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                  <label htmlFor="eventName" className="block mb-2 font-medium">
                    Event Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="eventName"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    placeholder="Enter the name of your event"
                    className={`input input-bordered w-full ${errors.eventName ? 'input-error' : ''}`}
                  />
                  {errors.eventName && <p className="text-error text-sm mt-1">{errors.eventName}</p>}
                </div>
                
                <div>
                  <label htmlFor="description" className="block mb-2 font-medium">
                    Description <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your event"
                    className={`textarea textarea-bordered w-full h-32 ${errors.description ? 'textarea-error' : ''}`}
                  />
                  {errors.description && <p className="text-error text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Date and Time */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <FaRegCalendarAlt className="text-primary" />
                Date and Time
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="startDate" className="block mb-2 font-medium">
                    Start Date & Time <span className="text-error">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full ${errors.startDate ? 'input-error' : ''}`}
                  />
                  {errors.startDate && <p className="text-error text-sm mt-1">{errors.startDate}</p>}
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block mb-2 font-medium">
                    End Date & Time <span className="text-error">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full ${errors.endDate ? 'input-error' : ''}`}
                  />
                  {errors.endDate && <p className="text-error text-sm mt-1">{errors.endDate}</p>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary" />
                Location
              </h2>
              
              <div className="mt-4 relative">
                <label htmlFor="location" className="block mb-2 font-medium">
                  Event Location <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleLocationChange}
                  placeholder="Enter the event venue or address"
                  className={`input input-bordered w-full ${errors.location ? 'input-error' : ''}`}
                  autoComplete="off"
                />
                {errors.location && <p className="text-error text-sm mt-1">{errors.location}</p>}
                {renderLocationSuggestions()}
              </div>
            </div>
          </div>
          
          {/* Event Image */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <FaImage className="text-primary" />
                Event Image
              </h2>
              
              <div className="mt-4">
                <label htmlFor="eventImage" className="block mb-2 font-medium">
                  Event Logo
                </label>
                
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  id="eventImage"
                  name="eventImage"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  aria-label="Select event logo image"
                />
                
                {/* Accessible button to trigger file input */}
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="btn btn-outline w-full mb-3"
                  aria-controls="eventImage"
                >
                  {imagePreview ? "Change Image" : "Select Image"}
                </button>
                
                {/* Preview container */}
                {imagePreview && (
                  <div className="relative w-full h-48 bg-base-100 rounded-lg overflow-hidden border border-base-300">
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-full h-full object-contain"
                    />
                    
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 btn btn-circle btn-sm btn-error"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                    
                    <p className="text-center text-xs text-base-content/70 mt-2">
                      Recommended size: 1200 x 630 pixels
                    </p>
                  </div>
                )}
                
                {/* Empty state */}
                {!imagePreview && (
                  <div className="w-full h-48 bg-base-100 rounded-lg border-2 border-dashed border-base-300 flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-base-content/50 text-center">No image selected</p>
                    <p className="text-base-content/30 text-xs mt-1">Maximum size: 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/instantiate/eventmaker')}
              className="btn btn-outline"
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
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventEditor;

EventEditor.propTypes = {
  eventInfo: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    start_time: PropTypes.string,
    end_time: PropTypes.string,
    location: PropTypes.string,
    image_id: PropTypes.string
  }),
};