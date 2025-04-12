import {useEffect, useState, useRef} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../consts";

export default function EventSetup(){
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);
    const locationTimeoutRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
    
        eventName: '',
        description: '',
    
        startDate: '',
        endDate: '',
        location: '',
        image: null
    });

    const [errors, setErrors] = useState({});

    const validateStep = (step) => {
        const newErrors = {};
        
        switch(step) {
            case 1:
                if (!formData.eventName) newErrors.eventName = 'Event name is required';
                if (!formData.description) newErrors.description = 'Description is required';
                break;
            case 2:
                // Image is optional, so no validation needed
                break;
            case 3:
                if (!formData.startDate) newErrors.startDate = 'Start date is required';
                if (!formData.endDate) newErrors.endDate = 'End date is required';
                if (new Date(formData.endDate) < new Date(formData.startDate)) {
                    newErrors.endDate = 'End date must be after start date';
                }
                if (!formData.location) newErrors.location = 'Location is required';
                break;
        }
        
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

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setSubmitError('Image size should be less than 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setSubmitError('Please upload an image file');
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
            setSubmitError(null);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            image: null
        }));
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateStep(step)) {
            setIsSubmitting(true);
            setSubmitError(null);
            try {
                let imageId = '';
                
                // First upload the image if exists
                if (formData.image) {
                    const imageFormData = new FormData();
                    imageFormData.append('file', formData.image);
                    
                    const imageResponse = await axios.post(`${baseUrl}/event-info/upload`, imageFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    imageId = imageResponse.data.image_id;
                }

                const eventData = {
                    name: formData.eventName,
                    description: formData.description,
                    start_time: formData.startDate,
                    end_time: formData.endDate,
                    location: formData.location,
                    id: 0,
                    image_id: imageId
                };

                const response = await axios.post(`${baseUrl}/event-info/event`, eventData);
                console.log('Event created successfully:', response.data);
                navigate('/instantiate/eventmaker');
            } catch (error) {
                console.error('Error creating event:', error);
                setSubmitError(error.response?.data?.message || 'Failed to create event. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleLocationChange = async (e) => {
        const { value } = e.target;
        console.log('Location input changed:', value);
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
                console.log('Fetching locations for:', value);
                const response = await axios.get(`https://api.geoapify.com/v1/geocode/autocomplete`, {
                    params: {
                        text: value,
                        apiKey: import.meta.env.VITE_GEOAPIFY_API_KEY,
                        format: 'json'
                    }
                });
                
                console.log('API Response:', response.data);
                
                const suggestions = response.data.results.map(result => ({
                    name: result.formatted,
                    lat: result.lat,
                    lon: result.lon
                }));
                
                console.log('Processed suggestions:', suggestions);
                setLocationSuggestions(suggestions);
            } catch (error) {
                console.error('Error fetching location suggestions:', error);
                if (error.response) {
                    console.error('API Error Response:', error.response.data);
                }
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

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div className="w-full">
                        <h2 className="text-2xl font-semibold mb-6">Basic Event Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="eventName" className="block mb-2">
                                    <span className="text-red-600">*</span>Event Name
                                </label>
                                <input
                                    type="text"
                                    id="eventName"
                                    name="eventName"
                                    value={formData.eventName}
                                    onChange={handleInputChange}
                                    placeholder="Enter the name of the event"
                                    className={`p-4 w-full bg-base-200 h-16 rounded-xl ${errors.eventName ? 'border-red-500' : ''}`}
                                />
                                {errors.eventName && <p className="text-red-500 mt-1">{errors.eventName}</p>}
                            </div>
                            <div>
                                <label htmlFor="description" className="block mb-2">
                                    <span className="text-red-600">*</span>Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter a description of the event"
                                    className={`p-4 w-full bg-base-200 h-32 rounded-xl ${errors.description ? 'border-red-500' : ''}`}
                                />
                                {errors.description && <p className="text-red-500 mt-1">{errors.description}</p>}
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="w-full">
                        <h2 className="text-2xl font-semibold mb-6">Event Image</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2">
                                    Upload Event Image
                                </label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <div 
                                    className="w-full h-48 bg-base-200 rounded-xl flex items-center justify-center cursor-pointer relative overflow-hidden"
                                    onClick={handleImageClick}
                                >
                                    {imagePreview ? (
                                        <>
                                            <img 
                                                src={imagePreview} 
                                                alt="Event preview" 
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage();
                                                }}
                                                className="absolute top-2 right-2 btn btn-circle btn-sm btn-error"
                                            >
                                                ×
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <p className="text-base-content/50">Click to upload image</p>
                                            <p className="text-base-content/30 text-sm mt-1">Maximum size: 5MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="w-full">
                        <h2 className="text-2xl font-semibold mb-6">Event Details</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="startDate" className="block mb-2">
                                        <span className="text-red-600">*</span>Start Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="startDate"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className={`p-4 w-full bg-base-200 h-16 rounded-xl ${errors.startDate ? 'border-red-500' : ''}`}
                                    />
                                    {errors.startDate && <p className="text-red-500 mt-1">{errors.startDate}</p>}
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="block mb-2">
                                        <span className="text-red-600">*</span>End Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="endDate"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className={`p-4 w-full bg-base-200 h-16 rounded-xl ${errors.endDate ? 'border-red-500' : ''}`}
                                    />
                                    {errors.endDate && <p className="text-red-500 mt-1">{errors.endDate}</p>}
                                </div>
                            </div>
                            <div className="relative">
                                <label htmlFor="location" className="block mb-2">
                                    <span className="text-red-600">*</span>Event Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleLocationChange}
                                    placeholder="Enter the location of the event"
                                    className={`p-4 w-full bg-base-200 h-16 rounded-xl ${errors.location ? 'border-red-500' : ''}`}
                                    autoComplete="off"
                                />
                                {errors.location && <p className="text-red-500 mt-1">{errors.location}</p>}
                                
                                {/* Location Suggestions Dropdown */}
                                {(locationSuggestions.length > 0 || isLoadingLocations) && (
                                    <div className="absolute w-full mt-1 bg-base-100 rounded-xl shadow-lg z-50 max-h-60 overflow-auto">
                                        {isLoadingLocations ? (
                                            <div className="p-4 text-center">
                                                <span className="loading loading-spinner loading-md"></span>
                                            </div>
                                        ) : (
                                            locationSuggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className="w-full text-left px-4 py-2 hover:bg-base-200 cursor-pointer"
                                                    onClick={() => handleLocationSelect(suggestion)}
                                                >
                                                    {suggestion.name}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return(
        <div className="min-h-screen bg-base-100 py-8">
            {/* Steps indicator */}
            <div className="w-full max-w-4xl mx-auto mb-8">
                <div className="steps steps-horizontal w-full">
                    <div className={`step ${step >= 1 ? 'step-primary' : ''}`}>Basic Info</div>
                    <div className={`step ${step >= 2 ? 'step-primary' : ''}`}>Event Image</div>
                    <div className={`step ${step >= 3 ? 'step-primary' : ''}`}>Details</div>
                </div>
            </div>

            {/* Main form container */}
            <div className="flex items-center justify-center">
                <div className="w-2/5 rounded-xl mx-auto bg-secondary min-h-[600px] z-10 flex flex-col items-center justify-center relative">
                    <div className="w-full px-8">
                        <h1 className="text-5xl text-primary font-bold mb-8">Create your event</h1>
                        
                        {renderStep()}

                        {submitError && (
                            <div className="alert alert-error mt-4">
                                <span>{submitError}</span>
                            </div>
                        )}

                        <div className="flex justify-between mt-8">
                            {step > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="btn btn-outline"
                                    disabled={isSubmitting}
                                >
                                    Back
                                </button>
                            )}
                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="btn btn-primary ml-auto"
                                    disabled={isSubmitting}
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="btn btn-primary ml-auto"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating Event...' : 'Create Event'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}