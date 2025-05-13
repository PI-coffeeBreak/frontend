import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEvent } from "../contexts/EventContext";
import { useMedia } from "../contexts/MediaContext";
import { useNotification } from "../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { FaRegCalendarAlt, FaMapMarkerAlt, FaImage, FaInfoCircle } from "react-icons/fa";
import PropTypes from "prop-types";
import { renderLocationSuggestions as renderLocationSuggestionsUtil } from '../utils/LocationUtils';
import { ImagePlaceholder } from '../components/common/ImagePlaceholder.jsx';
import { ImageError } from '../components/event_maker/ImageError.jsx';
import {baseUrl} from "../consts.js";

export function EventEditor() {
    const { t } = useTranslation();
    const { 
        eventInfo, 
        isLoading: isEventLoading, 
        updateEventInfo,
        getEventInfo,
    } = useEvent();
    const { getMediaUrl, registerMedia, uploadMedia, deleteMedia } = useMedia();
    const { uploadApplicationIcon } = useEvent();
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
        // --- PWA icons ---
        pwaIcon192: null,
        removePwaIcon192: false,
        pwaIcon512: null,
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
            removeImage: false
        });

        // Set image preview if available
        if (eventInfo.image_id) {
            setImagePreview(getMediaUrl(eventInfo.image_id));
            setImageError(false); // Reset error state when changing image
        } else {
            setImagePreview(null);
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

    const pwaIcon192InputRef = useRef(null);
    const pwaIcon512InputRef = useRef(null);

    const [pwaIcon192Id, setPwaIcon192Id ] = useState(null)
    const [pwaIcon512Id, setPwaIcon512Id ] = useState(null)

    const [pwaIcon192Type, setPwaIcon192Type ] = useState(null)
    const [pwaIcon512Type, setPwaIcon512Type ] = useState(null)

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
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            showNotification(t('common.media.sizeError'), "error");
            return;
        }


        if (!file.type.startsWith('image/')) {
            showNotification(t('common.media.typeError'), "error");
            return;
        }


        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            if (img.width !== 192 || img.height !== 192) {
                showNotification(
                    t('common.media.dimensionError', { width: 192, height: 192 }) ||
                    "Image must be exactly 192×192 pixels",
                    "error"
                );
                setPwaIcon192Error(true);
                if (pwaIcon192InputRef.current) {
                    pwaIcon192InputRef.current.value = '';
                }
                URL.revokeObjectURL(objectUrl);
                return;
            }

            // ✔ All validations passed
            setFormData(prev => ({
                ...prev,
                pwaIcon192: file,
                removePwaIcon192: false
            }));
            setPwaIcon192Preview(objectUrl);
            setPwaIcon192Error(false);

            registerMedia().then((response) => {
                setPwaIcon192Id(response.uuid.toString())
                setPwaIcon192Type(file.type.toString())
                uploadMedia(pwaIcon192Id, file, false);
            })

            setPwaIcon192Preview(baseUrl + "/media/" + pwaIcon192Id);

        };
        img.onerror = () => {
            showNotification(t('common.media.imageLoadError') || "Unable to load the image", "error");
            URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
    };

    const handlePwaIcon512Change = (e) => {
        const file = e.target.files[0];
        if (!file){
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showNotification(t('common.media.sizeError'), "error");
            return;
        }

        // MIME‑type validation
        if (!file.type.startsWith('image/')) {
            showNotification(t('common.media.typeError'), "error");
            return;
        }


        // Pixel‑dimension validation (must be exactly 512×512)
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            if (img.width !== 512 || img.height !== 512) {
                showNotification(
                    t('common.media.dimensionError', { width: 512, height: 512 }) ||
                    "Image must be exactly 512×512 pixels",
                    "error"
                );
                setPwaIcon512Error(true);
                if (pwaIcon512InputRef.current) {
                    pwaIcon512InputRef.current.value = '';
                }
                URL.revokeObjectURL(objectUrl);
                return;
            }

            // ✔ All validations passed
            setFormData(prev => ({
                ...prev,
                pwaIcon512: file,
                removePwaIcon512: false
            }));

            setPwaIcon512Error(false);

            registerMedia().then((response) => {
                setPwaIcon512Id(response.uuid.toString())
                setPwaIcon512Type(file.type.toString())
                uploadMedia(pwaIcon512Id, file, false);
            })

            setPwaIcon512Preview(baseUrl + "/media/" + pwaIcon512Id);

            console.log(pwaIcon192Preview)

        };



        img.onerror = () => {
            showNotification(t('common.media.imageLoadError') || "Unable to load the image", "error");
            URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
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
                start_time: formData.startDate + "Z",
                end_time: formData.endDate + "Z",
                location: formData.location,
            };

            // Get current image ID and track if this is a first-time image upload
            let imageId = eventInfo?.image_id;
            let oldImageId = imageId;

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

            // Update the event with possibly modified data
            await updateEventInfo(eventData);

            await uploadApplicationIcon(pwaIcon512Id, "512x512", pwaIcon512Type);
            await uploadApplicationIcon(pwaIcon192Id, "192x192", pwaIcon192Type);

            // Delete the old image if it was removed
            if (formData.removeImage && oldImageId) {
                try {
                    await deleteMedia(oldImageId);
                } catch (deleteError) {
                    console.error('Error deleting old image:', deleteError);
                }
            }
            navigate('/instantiate/event/info');

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
        <div className="w-full min-h-svh p-2 lg:p-8">
            <h1 className="text-3xl font-bold my-8">{t('eventEditor.title')}</h1>
                <form onSubmit={handleSubmit} className="space-y-16">

                    <div className="grid grid-cols-2">
                        <div>
                            <h2>
                                {t('eventEditor.basicInfo.title')}
                            </h2>
                            <p className="text-sm text-base-content/70 mt-1">Enter the event name, description, start date, and end date</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label htmlFor="eventName" className="block mb-2 font-medium">
                                    <span className="text-error">*</span>{t('eventEditor.basicInfo.eventName.label')}
                                </label>
                                <input
                                    type="text"
                                    id="eventName"
                                    name="eventName"
                                    value={formData.eventName}
                                    onChange={handleInputChange}
                                    placeholder={t('eventEditor.basicInfo.eventName.placeholder')}
                                    className={`input input-bordered rounded-xl w-full ${errors.eventName ? 'input-error' : ''}`}
                                />
                                {errors.eventName && <p className="text-error text-sm mt-1">{errors.eventName}</p>}
                            </div>
                            <div>
                                <label htmlFor="description" className="block mb-2 font-medium">
                                    <span className="text-error">*</span>{t('eventEditor.basicInfo.description.label')}
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder={t('eventEditor.basicInfo.description.placeholder')}
                                    className={`textarea textarea-bordered rounded-xl w-full h-32 ${errors.description ? 'textarea-error' : ''}`}
                                />
                                {errors.description && <p className="text-error text-sm mt-1">{errors.description}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label htmlFor="startDate" className="block mb-2 font-medium">
                                        <span className="text-error">*</span>{t('eventEditor.dateTime.startDate.label')}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="startDate"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className={`input input-bordered rounded-xl w-full ${errors.startDate ? 'input-error' : ''}`}
                                    />
                                    {errors.startDate && <p className="text-error text-sm mt-1">{errors.startDate}</p>}
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="block mb-2 font-medium">
                                        <span className="text-error">*</span>{t('eventEditor.dateTime.endDate.label')}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="endDate"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className={`input input-bordered rounded-xl w-full ${errors.endDate ? 'input-error' : ''}`}
                                    />
                                    {errors.endDate && <p className="text-error text-sm mt-1">{errors.endDate}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="divider"></div>

                    <div className="grid grid-cols-2">
                        <div>
                            <h2>
                                {t('eventEditor.location.title')}
                            </h2>
                            <p className="text-sm text-base-content/70 mt-1">Specify where the event will take place, with location suggestions</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label htmlFor="location" className="block mb-2 font-medium">
                                    <span className="text-error">*</span>{t('eventEditor.location.label')}
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleLocationChange}
                                    placeholder={t('eventEditor.location.placeholder')}
                                    className={`input input-bordered rounded-xl w-full ${errors.location ? 'input-error' : ''}`}
                                    autoComplete="off"
                                />
                                {errors.location && <p className="text-error text-sm mt-1">{errors.location}</p>}
                                {renderLocationSuggestions()}
                            </div>
                        </div>
                    </div>
                    <div className="divider"></div>

                    <div className="grid grid-cols-2">
                        <div>
                            <h2>
                                {t('eventEditor.image.title')}
                            </h2>
                            <p className="text-sm text-base-content/70 mt-1">Upload or change an image for your event</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <label htmlFor="eventImage" className="block mb-2 font-medium">
                                {t('eventEditor.image.label')}
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                id="eventImage"
                                name="eventImage"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            <button
                                type="button"
                                onClick={handleImageClick}
                                className="btn btn-secondary rounded-xl w-full"
                                aria-controls="eventImage"
                            >
                                {imagePreview ? t('common.media.changeImage') : t('common.media.selectImage')}
                            </button>
                            <div className="relative w-full h-48 bg-base-100 rounded-xl overflow-hidden border border-base-300">
                                {renderImageContent()}
                            </div>
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="grid grid-cols-2">
                        <div>
                            <h2>
                                Application Image
                            </h2>
                            <p className="text-sm text-base-content/70 mt-1">Upload or change the application images</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label htmlFor="pwaIcon512" className="block mb-2 font-medium">
                                    512x512 Image
                                </label>
                                <input
                                    type="file"
                                    ref={pwaIcon512InputRef}
                                    id="pwaIcon512"
                                    name="pwaIcon512"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePwaIcon512Change}
                                />
                                <button
                                    type="button"
                                    onClick={handlePwaIcon512Click}
                                    className="btn btn-secondary mb-2 rounded-xl w-full"
                                    aria-controls="pwaIcon512"
                                >
                                    {pwaIcon512Preview ? t('common.media.changeImage') : t('common.media.selectImage')}
                                </button>
                                <div className="relative w-full h-48 bg-base-100 rounded-xl overflow-hidden border border-base-300">
                                    {renderPwaIcon512Content()}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="pwaIcon192" className="block mb-2 font-medium">
                                    192x192 Image
                                </label>
                                <input
                                    type="file"
                                    ref={pwaIcon192InputRef}
                                    id="pwaIcon192"
                                    name="pwaIcon192"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePwaIcon192Change}
                                />
                                <button
                                    type="button"
                                    onClick={handlePwaIcon192Click}
                                    className="btn btn-secondary mb-2 rounded-xl w-full"
                                    aria-controls="pwaIcon192"
                                >
                                    {pwaIcon192Preview ? t('common.media.changeImage') : t('common.media.selectImage')}
                                </button>
                                <div className="relative w-full h-48 bg-base-100 rounded-xl overflow-hidden border border-base-300">
                                    {renderPwaIcon192Content()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="grid grid-cols-2">
                        <div>
                            <h2>
                                Favicon
                            </h2>
                            <p className="text-sm text-base-content/70 mt-1">Upload or change the favicon</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label htmlFor="image512" className="block mb-2 font-medium">
                                    Favicon Image
                                </label>
                                <input
                                    type="file"
                                    id="image512"
                                    name="image512"
                                    accept="image/*"
                                    className="hidden"

                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary mb-2 rounded-xl w-full"
                                    aria-controls="image512"
                                >
                                    Select Image
                                </button>
                                <div className="relative w-full h-48 bg-base-100 rounded-xl overflow-hidden border border-base-300">

                                </div>
                            </div>
                        </div>
                    </div>



                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/instantiate/event/info')}
                            className="btn btn-secondary rounded-xl"
                            disabled={isSubmitting}
                        >
                            {t('eventEditor.actions.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary rounded-xl"
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
    );
}
