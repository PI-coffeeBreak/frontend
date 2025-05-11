import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEvent } from "../contexts/EventContext";
import { useMedia } from "../contexts/MediaContext";
import { useNotification } from "../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { FaRegCalendarAlt, FaMapMarkerAlt, FaImage, FaInfoCircle, FaMobileAlt } from "react-icons/fa";
import PropTypes from "prop-types";
import { renderLocationSuggestions as renderLocationSuggestionsUtil } from '../utils/LocationUtils';
import { ImagePlaceholder } from '../components/common/ImagePlaceholder.jsx';
import { ImageError } from '../components/event_maker/ImageError.jsx';

export function EventEditor() {
    const { t } = useTranslation();
    const { 
        eventInfo, 
        isLoading: isEventLoading, 
        updateEventInfo,
        getEventInfo,
    } = useEvent();
    const { getMediaUrl, registerMedia, uploadMedia, deleteMedia } = useMedia();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    
    const fileInputRef = useRef(null);
    const locationTimeoutRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageError, setImageError] = useState(false);
    
    const [formData, setFormData] = useState({
        eventName: "",
        description: "",
        startDate: "",
        endDate: "",
        location: "",
        image: null,
        removeImage: false,
        pwaIcon192: null,
        pwaIcon512: null,
        removePwaIcon192: false,
        removePwaIcon512: false
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
            image: null,
            removeImage: false,
            pwaIcon192: null,
            pwaIcon512: null,
            removePwaIcon192: false,
            removePwaIcon512: false
        });
        
        // Set image preview if available
        if (eventInfo.image_id) {
            setImagePreview(getMediaUrl(eventInfo.image_id));
            setImageError(false); // Reset error state when changing image
        } else {
            setImagePreview(null);
        }

        // Set PWA icon previews if available
        if (eventInfo.pwa_icon_192_id) {
            setPwaIcon192Preview(getMediaUrl(eventInfo.pwa_icon_192_id));
        } else {
            setPwaIcon192Preview(null);
        }
        
        if (eventInfo.pwa_icon_512_id) {
            setPwaIcon512Preview(getMediaUrl(eventInfo.pwa_icon_512_id));
        } else {
            setPwaIcon512Preview(null);
        }
        }
    }, [eventInfo, getMediaUrl]);
    
    // Helper function to format date for datetime-local input
    const formatDateForInput = (isoString) => {
        const date = new Date(isoString);
        return date.toISOString().slice(0, 16); // Format as "YYYY-MM-DDThh:mm"
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.eventName) newErrors.eventName = t('eventEditor.basicInfo.eventName.required');
        if (!formData.description) newErrors.description = t('eventEditor.basicInfo.description.required');
        if (!formData.startDate) newErrors.startDate = t('eventEditor.dateTime.startDate.required');
        if (!formData.endDate) newErrors.endDate = t('eventEditor.dateTime.endDate.required');
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            newErrors.endDate = t('eventEditor.dateTime.endDate.invalid');
        }
        if (!formData.location) newErrors.location = t('eventEditor.location.required');
        
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
                showNotification(t('common.media.sizeError'), "error");
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                showNotification(t('common.media.typeError'), "error");
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                image: file,
                removeImage: false
            }));
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setImageError(false);
            };
            reader.readAsDataURL(file);
        }
    };
  
    const removeImage = () => {
        setFormData(prev => ({
        ...prev,
        image: null,
        removeImage: true
        }));
        
        // Clear image preview
        setImagePreview(null);
        setImageError(false);
        
        if (fileInputRef.current) {
        fileInputRef.current.value = '';
        }
    };

    const renderImageContent = () => {
        if (!imagePreview) {
            return <ImagePlaceholder />;
        }
        
        if (imageError) {
            return <ImageError />;
        }
        
        return (
            <>
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src={imagePreview}
                        alt={t('common.media.imageAlt')}
                        className="max-w-full max-h-full object-contain"
                        onError={() => {
                            console.error("Failed to load preview image");
                            setImageError(true);
                        }}
                    />
                </div>
                <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 btn btn-circle btn-sm btn-error z-10"
                    aria-label={t('common.media.removeImage')}
                >
                    ×
                </button>
            </>
        );
    };
  
    // Add new state for PWA icons
    const pwaIcon192InputRef = useRef(null);
    const pwaIcon512InputRef = useRef(null);
    const [pwaIcon192Preview, setPwaIcon192Preview] = useState(null);
    const [pwaIcon512Preview, setPwaIcon512Preview] = useState(null);
    const [pwaIcon192Error, setPwaIcon192Error] = useState(false);
    const [pwaIcon512Error, setPwaIcon512Error] = useState(false);

    const handlePwaIcon192Click = () => {
        pwaIcon192InputRef.current?.click();
    };

    const handlePwaIcon512Click = () => {
        pwaIcon512InputRef.current?.click();
    };

    const handlePwaIcon192Change = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                showNotification(t('common.media.sizeError'), "error");
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                showNotification(t('common.media.typeError'), "error");
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                pwaIcon192: file,
                removePwaIcon192: false
            }));
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPwaIcon192Preview(reader.result);
                setPwaIcon192Error(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePwaIcon512Change = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                showNotification(t('common.media.sizeError'), "error");
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                showNotification(t('common.media.typeError'), "error");
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                pwaIcon512: file,
                removePwaIcon512: false
            }));
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPwaIcon512Preview(reader.result);
                setPwaIcon512Error(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePwaIcon192 = () => {
        setFormData(prev => ({
            ...prev,
            pwaIcon192: null,
            removePwaIcon192: true
        }));
        
        // Clear image preview
        setPwaIcon192Preview(null);
        setPwaIcon192Error(false);
        
        if (pwaIcon192InputRef.current) {
            pwaIcon192InputRef.current.value = '';
        }
    };

    const removePwaIcon512 = () => {
        setFormData(prev => ({
            ...prev,
            pwaIcon512: null,
            removePwaIcon512: true
        }));
        
        // Clear image preview
        setPwaIcon512Preview(null);
        setPwaIcon512Error(false);
        
        if (pwaIcon512InputRef.current) {
            pwaIcon512InputRef.current.value = '';
        }
    };

    const renderPwaIcon192Content = () => {
        if (!pwaIcon192Preview) {
            return <ImagePlaceholder />;
        }
        
        if (pwaIcon192Error) {
            return <ImageError />;
        }
        
        return (
            <>
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src={pwaIcon192Preview}
                        alt={t('common.media.pwaIcon192Alt') || "192x192 PWA Icon"}
                        className="max-w-full max-h-full object-contain"
                        onError={() => {
                            console.error("Failed to load PWA 192x192 icon preview");
                            setPwaIcon192Error(true);
                        }}
                    />
                </div>
                <button
                    type="button"
                    onClick={removePwaIcon192}
                    className="absolute top-2 right-2 btn btn-circle btn-sm btn-error z-10"
                    aria-label={t('common.media.removeImage')}
                >
                    ×
                </button>
            </>
        );
    };

    const renderPwaIcon512Content = () => {
        if (!pwaIcon512Preview) {
            return <ImagePlaceholder />;
        }
        
        if (pwaIcon512Error) {
            return <ImageError />;
        }
        
        return (
            <>
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src={pwaIcon512Preview}
                        alt={t('common.media.pwaIcon512Alt') || "512x512 PWA Icon"}
                        className="max-w-full max-h-full object-contain"
                        onError={() => {
                            console.error("Failed to load PWA 512x512 icon preview");
                            setPwaIcon512Error(true);
                        }}
                    />
                </div>
                <button
                    type="button"
                    onClick={removePwaIcon512}
                    className="absolute top-2 right-2 btn btn-circle btn-sm btn-error z-10"
                    aria-label={t('common.media.removeImage')}
                >
                    ×
                </button>
            </>
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showNotification(t('eventEditor.validation.requiredFields'), "error");
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const eventData = {
                name: formData.eventName,
                description: formData.description,
                start_time: formData.startDate,
                end_time: formData.endDate,
                location: formData.location,
            };

            // Get current image ID and track if this is a first-time image upload
            let imageId = eventInfo?.image_id;
            let oldImageId = imageId;
            let pwaIcon192Id = eventInfo?.pwa_icon_192_id;
            let oldPwaIcon192Id = pwaIcon192Id;
            let pwaIcon512Id = eventInfo?.pwa_icon_512_id;
            let oldPwaIcon512Id = pwaIcon512Id;
            
            // Handle image changes
            if (formData.image) {
                try {
                    // Check if we're updating existing image or adding new one
                    const isUpdate = !!eventInfo?.image_id;
                    
                    // If updating existing image, use that ID, otherwise register new one
                    if (!isUpdate) {
                        const mediaData = await registerMedia();
                        imageId = mediaData.uuid;
                        await uploadMedia(imageId, formData.image, false);
                    } else {
                        await uploadMedia(imageId, formData.image, true);
                    }
                    
                    // Update the event data with the image ID
                    eventData.image_id = imageId;
                } catch (imageError) {
                    console.error('Error handling image:', imageError);
                    showNotification(t('eventEditor.image.updateError'), "warning");
                }
            } else if (formData.removeImage) {
                // Set image ID to null if removing
                eventData.image_id = null;
            } else {
                // Keep existing image ID if not changing
                eventData.image_id = imageId;
            }

            // Handle PWA icon 192x192 changes
            if (formData.pwaIcon192) {
                try {
                    // Check if we're updating existing icon or adding new one
                    const isUpdate = !!eventInfo?.pwa_icon_192_id;
                    
                    // If updating existing icon, use that ID, otherwise register new one
                    if (!isUpdate) {
                        const mediaData = await registerMedia();
                        pwaIcon192Id = mediaData.uuid;
                        await uploadMedia(pwaIcon192Id, formData.pwaIcon192, false);
                    } else {
                        await uploadMedia(pwaIcon192Id, formData.pwaIcon192, true);
                    }
                    
                    // Update the event data with the icon ID
                    eventData.pwa_icon_192_id = pwaIcon192Id;
                    
                    // Register icon with manifest
                    try {
                        const iconType = formData.pwaIcon192.type;
                        const manifestPayload = {
                            src: getMediaUrl(pwaIcon192Id),
                            sizes: "192x192",
                            type: iconType || "image/png"
                        };
                        
                        await axios.post(`${import.meta.env.VITE_API_URL}/manifest/icon`, manifestPayload, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                    } catch (manifestError) {
                        console.error('Error registering PWA 192x192 icon with manifest:', manifestError);
                        showNotification(t('eventEditor.pwaImage.manifestError') || 'Failed to register icon with manifest', "warning");
                    }
                } catch (iconError) {
                    console.error('Error handling PWA 192x192 icon:', iconError);
                    showNotification(t('eventEditor.pwaImage.updateError'), "warning");
                }
            } else if (formData.removePwaIcon192) {
                // Set icon ID to null if removing
                eventData.pwa_icon_192_id = null;
            } else {
                // Keep existing icon ID if not changing
                eventData.pwa_icon_192_id = pwaIcon192Id;
            }

            // Handle PWA icon 512x512 changes
            if (formData.pwaIcon512) {
                try {
                    // Check if we're updating existing icon or adding new one
                    const isUpdate = !!eventInfo?.pwa_icon_512_id;
                    
                    // If updating existing icon, use that ID, otherwise register new one
                    if (!isUpdate) {
                        const mediaData = await registerMedia();
                        pwaIcon512Id = mediaData.uuid;
                        await uploadMedia(pwaIcon512Id, formData.pwaIcon512, false);
                    } else {
                        await uploadMedia(pwaIcon512Id, formData.pwaIcon512, true);
                    }
                    
                    // Update the event data with the icon ID
                    eventData.pwa_icon_512_id = pwaIcon512Id;
                    
                    // Register icon with manifest
                    try {
                        const iconType = formData.pwaIcon512.type;
                        const manifestPayload = {
                            src: getMediaUrl(pwaIcon512Id),
                            sizes: "512x512",
                            type: iconType || "image/png"
                        };
                        
                        await axios.post(`${import.meta.env.VITE_API_URL}/manifest/icon`, manifestPayload, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                    } catch (manifestError) {
                        console.error('Error registering PWA 512x512 icon with manifest:', manifestError);
                        showNotification(t('eventEditor.pwaImage.manifestError') || 'Failed to register icon with manifest', "warning");
                    }
                } catch (iconError) {
                    console.error('Error handling PWA 512x512 icon:', iconError);
                    showNotification(t('eventEditor.pwaImage.updateError'), "warning");
                }
            } else if (formData.removePwaIcon512) {
                // Set icon ID to null if removing
                eventData.pwa_icon_512_id = null;
            } else {
                // Keep existing icon ID if not changing
                eventData.pwa_icon_512_id = pwaIcon512Id;
            }
            
            // Update the event with possibly modified data
            await updateEventInfo(eventData);
            
            // Delete the old image if it was removed
            if (formData.removeImage && oldImageId) {
                try {
                    await deleteMedia(oldImageId);
                } catch (deleteError) {
                    console.error('Error deleting old image:', deleteError);
                }
            }

            // Delete the old PWA 192x192 icon if it was removed
            if (formData.removePwaIcon192 && oldPwaIcon192Id) {
                try {
                    await deleteMedia(oldPwaIcon192Id);
                } catch (deleteError) {
                    console.error('Error deleting old PWA 192x192 icon:', deleteError);
                }
            }

            // Delete the old PWA 512x512 icon if it was removed
            if (formData.removePwaIcon512 && oldPwaIcon512Id) {
                try {
                    await deleteMedia(oldPwaIcon512Id);
                } catch (deleteError) {
                    console.error('Error deleting old PWA 512x512 icon:', deleteError);
                }
            }
            
            navigate('/instantiate/eventmaker');
            
            // Refresh event info to get the latest data
            await getEventInfo();
            
            // Show success message
            showNotification(t('eventEditor.success.update'), "success");
        } catch (error) {
            console.error('Error updating event:', error);
            showNotification(error.response?.data?.message || t('eventEditor.error.update'), "error");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const renderLocationSuggestions = () => {
        return renderLocationSuggestionsUtil(
            locationSuggestions,
            isLoadingLocations,
            handleLocationSelect
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
                    <h1 className="text-3xl font-bold text-primary">{t('eventEditor.title')}</h1>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="card bg-base-200 shadow-lg">
                    <div className="card-body">
                    <h2 className="card-title flex items-center gap-2">
                        <FaInfoCircle className="text-primary" />
                        {t('eventEditor.basicInfo.title')}
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-4 mt-4">
                        <div>
                        <label htmlFor="eventName" className="block mb-2 font-medium">
                            {t('eventEditor.basicInfo.eventName.label')} <span className="text-error">*</span>
                        </label>
                        <input
                            type="text"
                            id="eventName"
                            name="eventName"
                            value={formData.eventName}
                            onChange={handleInputChange}
                            placeholder={t('eventEditor.basicInfo.eventName.placeholder')}
                            className={`input input-bordered w-full ${errors.eventName ? 'input-error' : ''}`}
                        />
                        {errors.eventName && <p className="text-error text-sm mt-1">{errors.eventName}</p>}
                        </div>
                        
                        <div>
                        <label htmlFor="description" className="block mb-2 font-medium">
                            {t('eventEditor.basicInfo.description.label')} <span className="text-error">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder={t('eventEditor.basicInfo.description.placeholder')}
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
                        {t('eventEditor.dateTime.title')}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                        <label htmlFor="startDate" className="block mb-2 font-medium">
                            {t('eventEditor.dateTime.startDate.label')} <span className="text-error">*</span>
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
                            {t('eventEditor.dateTime.endDate.label')} <span className="text-error">*</span>
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
                        {t('eventEditor.location.title')}
                    </h2>
                    
                    <div className="mt-4 relative">
                        <label htmlFor="location" className="block mb-2 font-medium">
                            {t('eventEditor.location.label')} <span className="text-error">*</span>
                        </label>
                        <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleLocationChange}
                        placeholder={t('eventEditor.location.placeholder')}
                        className={`input input-bordered w-full ${errors.location ? 'input-error' : ''}`}
                        autoComplete="off"
                        />
                        {errors.location && <p className="text-error text-sm mt-1">{errors.location}</p>}
                        {renderLocationSuggestions()}
                    </div>
                    </div>
                </div>
                
                {/* Event Image and PWA Images - grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Event Image */}
                    <div className="card bg-base-200 shadow-lg">
                        <div className="card-body">
                            <h2 className="card-title flex items-center gap-2">
                                <FaImage className="text-primary" />
                                {t('eventEditor.image.title')}
                            </h2>
                        
                            <div className="mt-4">
                                <label htmlFor="eventImage" className="block mb-2 font-medium">
                                    {t('eventEditor.image.label')}
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
                                />
                                
                                {/* Accessible button to trigger file input */}
                                <button
                                type="button"
                                onClick={handleImageClick}
                                className="btn btn-outline w-full mb-3"
                                aria-controls="eventImage"
                                >
                                {imagePreview ? t('common.media.changeImage') : t('common.media.selectImage')}
                                </button>
                                
                                {/* Image container with extracted rendering logic */}
                                <div className="relative w-full h-48 bg-base-100 rounded-lg overflow-hidden border border-base-300">
                                    {renderImageContent()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PWA Image */}
                    <div className="card bg-base-200 shadow-lg">
                        <div className="card-body">
                            <h2 className="card-title flex items-center gap-2">
                                <FaMobileAlt className="text-primary" />
                                {t('eventEditor.pwaImage.title') || "PWA Images"}
                            </h2>
                        
                            <div className="mt-4 space-y-4">
                                {/* PWA Icon 192x192 */}
                                <div>
                                    <label htmlFor="pwaIcon192" className="block mb-2 font-medium">
                                        {t('eventEditor.pwaImage.icon192.label') || "Icon 192x192"}
                                    </label>
                                    
                                    {/* Hidden file input */}
                                    <input
                                        type="file"
                                        ref={pwaIcon192InputRef}
                                        id="pwaIcon192"
                                        name="pwaIcon192"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePwaIcon192Change}
                                    />
                                    
                                    {/* Accessible button to trigger file input */}
                                    <button
                                        type="button"
                                        onClick={handlePwaIcon192Click}
                                        className="btn btn-outline btn-sm w-full mb-2"
                                        aria-controls="pwaIcon192"
                                    >
                                        {pwaIcon192Preview ? t('common.media.changeImage') : t('common.media.selectImage')}
                                    </button>
                                    
                                    {/* Image container */}
                                    <div className="relative w-full h-24 bg-base-100 rounded-lg overflow-hidden border border-base-300">
                                        {renderPwaIcon192Content()}
                                    </div>
                                </div>
                                
                                {/* PWA Icon 512x512 */}
                                <div>
                                    <label htmlFor="pwaIcon512" className="block mb-2 font-medium">
                                        {t('eventEditor.pwaImage.icon512.label') || "Icon 512x512"}
                                    </label>
                                    
                                    {/* Hidden file input */}
                                    <input
                                        type="file"
                                        ref={pwaIcon512InputRef}
                                        id="pwaIcon512"
                                        name="pwaIcon512"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePwaIcon512Change}
                                    />
                                    
                                    {/* Accessible button to trigger file input */}
                                    <button
                                        type="button"
                                        onClick={handlePwaIcon512Click}
                                        className="btn btn-outline btn-sm w-full mb-2"
                                        aria-controls="pwaIcon512"
                                    >
                                        {pwaIcon512Preview ? t('common.media.changeImage') : t('common.media.selectImage')}
                                    </button>
                                    
                                    {/* Image container */}
                                    <div className="relative w-full h-24 bg-base-100 rounded-lg overflow-hidden border border-base-300">
                                        {renderPwaIcon512Content()}
                                    </div>
                                </div>
                            </div>
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
                        {t('eventEditor.actions.cancel')}
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                {' '}{t('eventEditor.actions.saving')}
                            </>
                        ) : (
                            t('eventEditor.actions.save')
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
        image_id: PropTypes.string,
        pwa_icon_192_id: PropTypes.string,
        pwa_icon_512_id: PropTypes.string
    }),
};