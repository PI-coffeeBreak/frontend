import React, { useEffect, useState } from 'react';
import { FiUser, FiRefreshCw, FiTrash2, FiSearch } from 'react-icons/fi';
import { useSpeakers } from '../contexts/SpeakerContext';
import { useNotification } from '../contexts/NotificationContext';
import { useActivities } from '../contexts/ActivitiesContext';

const SpeakerManagement = () => {
  const { speakers, loading, error, fetchSpeakers, addSpeaker, deleteSpeaker } = useSpeakers();
  const { activities, fetchActivities } = useActivities();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    image: null,
    activity_id: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);

  useEffect(() => {
    fetchSpeakers();
    fetchActivities();
  }, []);

  useEffect(() => {
    console.log("Current speakers:", speakers);
  }, [speakers]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      if (files && files[0]) {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleActivitySearch = (e) => {
    setActivitySearchQuery(e.target.value);
    setShowActivityDropdown(true);
  };

  const selectActivity = (activity) => {
    setFormData(prev => ({ 
      ...prev, 
      activity_id: activity.id 
    }));
    setActivitySearchQuery(activity.name);
    setShowActivityDropdown(false);
  };

  const clearSelectedActivity = () => {
    setFormData(prev => ({ ...prev, activity_id: null }));
    setActivitySearchQuery('');
  };

  const resetForm = () => {
    setFormData({ name: '', title: '', image: null, activity_id: null });
    setImagePreview(null);
    setActivitySearchQuery('');
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showNotification('Speaker name is required', 'error');
      return;
    }
    
    showNotification('Adding speaker...', 'info');
    
    const result = await addSpeaker(formData);
    
    if (result.success) {
      showNotification('Speaker added successfully!', 'success');
      resetForm();
    } else {
      showNotification(result.error || 'Failed to add speaker', 'error');
      console.error('Speaker addition failed:', result);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this speaker?')) {
      const result = await deleteSpeaker(id);
      if (result.success) {
        showNotification('Speaker deleted successfully!', 'success');
      } else {
        showNotification(result.error || 'Failed to delete speaker', 'error');
      }
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="ml-2 text-lg">Loading speakers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="alert alert-error mb-4">
          <FiRefreshCw className="w-6 h-6" />
          <span>{error}</span>
        </div>
        <button 
          className="btn btn-primary"
          onClick={fetchSpeakers}
        >
          <FiRefreshCw className="mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  const filteredActivities = activities.filter(activity =>
    activity.name.toLowerCase().includes(activitySearchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Speaker Management</h1>
      
      <form onSubmit={handleSubmit} className="card bg-base-200 p-6 mb-8">
        <div className="form-control w-full max-w-md mb-4">
          <label htmlFor="speaker-name" className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            id="speaker-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter speaker name"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control w-full max-w-md mb-4">
          <label htmlFor="speaker-description" className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            id="speaker-description"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter speaker description"
            className="textarea textarea-bordered w-full h-24"
            required
          />
        </div>
        
        <div className="form-control w-full max-w-md mb-4">
          <label htmlFor="activity-search" className="label">
            <span className="label-text">Associated Activity (optional)</span>
          </label>
          <div className="relative">
            <div className="input-group w-full">
              <input
                id="activity-search"
                type="text"
                value={activitySearchQuery}
                onChange={handleActivitySearch}
                onClick={() => setShowActivityDropdown(true)}
                placeholder="Search for an activity"
                className="input input-bordered w-full pl-10"
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              {formData.activity_id && (
                <button
                  type="button"
                  className="btn btn-square btn-sm"
                  onClick={clearSelectedActivity}
                >
                  ×
                </button>
              )}
            </div>
            
            {showActivityDropdown && activitySearchQuery && (
              <ul className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-full mt-1 max-h-60 overflow-auto">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map(activity => (
                    <li key={activity.id}>
                      <button
                        type="button"
                        onClick={() => selectActivity(activity)}
                        className="w-full text-left py-2"
                      >
                        {activity.name}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500 py-2 px-4">No activities found</li>
                )}
              </ul>
            )}
          </div>
          {formData.activity_id && (
            <div className="mt-2">
              <span className="badge badge-primary">
                Selected activity ID: {formData.activity_id}
              </span>
            </div>
          )}
        </div>

        <div className="form-control w-full max-w-md mb-6">
          <label htmlFor="speaker-image" className="label">
            <span className="label-text">Image</span>
          </label>
          <input
            id="speaker-image"
            type="file"
            name="image"
            onChange={handleInputChange}
            accept="image/*"
            className="file-input file-input-bordered w-full"
          />
          {imagePreview && (
            <div className="mt-2">
              <div className="avatar">
                <div className="w-24 h-24 rounded-full">
                  <img src={imagePreview} alt="Preview" />
                </div>
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-fit"
          disabled={loading}
        >
          Add Speaker
        </button>
      </form>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-2xl font-semibold mb-6">All Speakers</h2>
          
          {!speakers || speakers.length === 0 ? (
            <div className="text-center py-8">
              <div className="alert alert-info">
                <FiUser className="w-6 h-6" />
                <span>No speakers found. Add your first speaker using the form above.</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="uppercase text-xs font-semibold text-base-content/60">Photo</th>
                    <th className="uppercase text-xs font-semibold text-base-content/60">Name</th>
                    <th className="uppercase text-xs font-semibold text-base-content/60">Description</th>
                    <th className="uppercase text-xs font-semibold text-base-content/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(speakers) && speakers.map((speaker) => (
                    <tr key={speaker.id}>
                      <td>
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg font-semibold">
                            {speaker.image_uuid ? (
                              <img
                                src={`${import.meta.env.VITE_API_BASE_URL}/media/${speaker.image_uuid}`}
                                alt={speaker.name}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  console.log('Image load error for:', speaker.name, speaker.image_uuid);
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.parentElement.textContent = getInitials(speaker.name);
                                }}
                              />
                            ) : (
                              getInitials(speaker.name)
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="font-medium">{speaker.name}</td>
                      <td className="text-base-content/70">{speaker.description}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(speaker.id)}
                            className="btn btn-error btn-sm"
                            aria-label={`Delete ${speaker.name}`}
                          >
                            <FiTrash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeakerManagement;