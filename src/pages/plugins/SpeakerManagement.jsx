import React, { useEffect, useState } from 'react';
import { FiUser, FiRefreshCw, FiTrash2, FiSearch, FiEdit, FiPlus, FiDownload } from 'react-icons/fi';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useActivities } from '../../contexts/ActivitiesContext.jsx';
import { useMedia } from '../../contexts/MediaContext.jsx';
import { axiosWithAuth } from '../../utils/axiosWithAuth.js';
import { useKeycloak } from "@react-keycloak/web";
import { baseUrl } from '../../consts.js';

const API_ENDPOINTS = {
  SPEAKERS: `${baseUrl}/speaker-presentation-plugin/speakers/`,
};

const truncateText = (text, maxLength = 80) => {
  if (!text || text.length <= maxLength) return text;
  
  const lastSpace = text.substring(0, maxLength).lastIndexOf(' ');
  const truncated = text.substring(0, lastSpace > 0 ? lastSpace : maxLength);
  
  return `${truncated}...`;
};

const prepareImageUpload = (formData, editMode) => {
  if (formData.image instanceof File) {
    console.log('New image selected for upload:', formData.image.name);
    return formData.image;
  } 
  
  if (editMode && formData.image_uuid) {
    console.log('Keeping existing image by omitting field, UUID:', formData.image_uuid);
  } else {
    console.log('No image for this speaker');
  }
  
  return null;
};

const prepareSpeakerData = (formData, imageToUpload) => {
  const speakerData = {
    name: formData.name,
    role: formData.role,
    description: formData.description,
    activity_id: formData.activity_id || null,
  };

  if (!imageToUpload && !formData.image_uuid) {
    speakerData.image = null;
  }
  
  return speakerData;
};

const SpeakerManagement = () => {
  const { keycloak } = useKeycloak();
  const { activities, fetchActivities } = useActivities();
  const { showNotification } = useNotification();
  const { uploadMedia, getMediaUrl } = useMedia();

  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    image: null,
    activity_id: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editingSpeakerId, setEditingSpeakerId] = useState(null);
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterActivity, setFilterActivity] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    message: '',
    onConfirm: null,
  });

  const fetchSpeakers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching speakers from: ${API_ENDPOINTS.SPEAKERS}`);
      
      const response = await axiosWithAuth(keycloak).get(API_ENDPOINTS.SPEAKERS);
      
      if (Array.isArray(response.data)) {
        const normalizedSpeakers = response.data.map(speaker => ({
          id: speaker.id,
          name: speaker.name || 'Unnamed Speaker',
          role: speaker.role || '',
          description: speaker.description || '',
          image_uuid: speaker.image,
          activity_id: speaker.activity_id
        }));
        setSpeakers(normalizedSpeakers);
        console.log(`Successfully loaded ${normalizedSpeakers.length} speakers`);
      } else if (response.data && typeof response.data === 'object') {
        const dataArray = response.data.results || response.data.items || [];
        const normalizedSpeakers = dataArray.map(speaker => ({
          id: speaker.id,
          name: speaker.name || 'Unnamed Speaker',
          role: speaker.role || '',
          description: speaker.description || '',
          image_uuid: speaker.image,
          activity_id: speaker.activity_id
        }));
        setSpeakers(normalizedSpeakers);
        console.log(`Successfully loaded ${normalizedSpeakers.length} speakers from nested data`);
      } else {
        console.error('Unexpected API response structure:', response.data);
        setSpeakers([]);
      }
    } catch (err) {
      setError('Failed to fetch speakers. Please try again.');
      
      if (err.response) {
        console.error(`API error ${err.response.status}:`, err.response.data);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error setting up request:', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const addSpeaker = async (speakerData) => {
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        name: speakerData.name,
        role: speakerData.role || '',
        description: speakerData.description || '',
        activity_id: speakerData.activity_id || null
      };
      
      const response = await axiosWithAuth(keycloak).post(API_ENDPOINTS.SPEAKERS, payload);
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error in addSpeaker:', err);
      
      if (err.response) {
        console.error(`API Error (${err.response.status}):`, err.response.data);
      }
      
      const errorMessage = err.response?.data?.detail || 'Failed to add speaker';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateSpeaker = async (id, speakerData) => {
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        name: speakerData.name,
        role: speakerData.role || '',
        description: speakerData.description || '',
        activity_id: speakerData.activity_id || null,
      };
      
      if (speakerData.image === null) {
        payload.image = null;
      } else if (speakerData.image && speakerData.image !== 'keep') {
        payload.image = speakerData.image;
      }
      
      console.log(`Updating speaker ${id} with data:`, payload);
      
      const response = await axiosWithAuth(keycloak).patch(
        `${API_ENDPOINTS.SPEAKERS}${id}/`, 
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error in updateSpeaker:', err);
      
      if (err.response) {
        console.error(`API Error (${err.response.status}):`, err.response.data);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error setting up request:', err.message);
      }
      
      const errorMessage = err.response?.data?.detail || 'Failed to update speaker';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteSpeaker = async (id) => {
    setLoading(true);
    try {
      await axiosWithAuth(keycloak).delete(`${API_ENDPOINTS.SPEAKERS}${id}/`);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete speaker';
      setError(errorMessage);
      
      if (err.response) {
        console.error(`Delete speaker error ${err.response.status}:`, err.response.data);
      } else if (err.request) {
        console.error('No response received when deleting speaker:', err.request);
      } else {
        console.error('Error setting up delete speaker request:', err.message);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (keycloak?.authenticated) {
      console.log('Authenticated, fetching speakers');
      fetchSpeakers();
      fetchActivities();
    } else {
      console.log('Not authenticated yet, waiting...');
    }
  }, [keycloak?.authenticated]);
  
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      if (files?.[0]) {
        setFormData((prev) => ({ ...prev, [name]: files[0] }));

        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleActivitySearch = (e) => {
    setActivitySearchQuery(e.target.value);
    setShowActivityDropdown(true);
  };

  const selectActivity = (activity) => {
    setFormData((prev) => ({
      ...prev,
      activity_id: activity.id,
    }));
    setActivitySearchQuery(activity.name);
    setShowActivityDropdown(false);
  };

  const clearSelectedActivity = () => {
    setFormData((prev) => ({ ...prev, activity_id: null }));
    setActivitySearchQuery('');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      description: '',
      image: null,
      activity_id: null,
    });
    setImagePreview(null);
    setActivitySearchQuery('');
    setEditMode(false);
    setEditingSpeakerId(null);

    const fileInput = document.getElementById('speaker-image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleShowAddModal = () => {
    resetForm();
    setEditMode(false);
    setShowSpeakerModal(true);
  };

  const handleEdit = (speaker) => {
    const activityName = speaker.activity_id
      ? activities.find((a) => a.id === speaker.activity_id)?.name || ''
      : '';

    setFormData({
      name: speaker.name || '',
      role: speaker.role || '',
      description: speaker.description || '',
      image: null,
      image_uuid: speaker.image_uuid,
      activity_id: speaker.activity_id || null,
    });

    setActivitySearchQuery(activityName);

    if (speaker.image_uuid) {
      setImagePreview(getMediaUrl(speaker.image_uuid));
    } else {
      setImagePreview(null);
    }

    setEditMode(true);
    setEditingSpeakerId(speaker.id);

    setShowSpeakerModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showNotification('Speaker name is required', 'error');
      return;
    }

    showNotification(`${editMode ? 'Updating' : 'Adding'} speaker...`, 'info');

    try {
      const imageToUpload = prepareImageUpload(formData, editMode);
      const speakerData = prepareSpeakerData(formData, imageToUpload);
      
      const result = editMode
        ? await updateSpeaker(editingSpeakerId, speakerData)
        : await addSpeaker(speakerData);

      if (!result.success) {
        showNotification(result.error || `Failed to ${editMode ? 'update' : 'add'} speaker`, 'error');
        return;
      }

      if (result.success && imageToUpload) {
        await handleImageUpload(result.data.image, imageToUpload);
      }

      showNotification(`Speaker ${editMode ? 'updated' : 'added'} successfully!`, 'success');
      resetForm();
      setShowSpeakerModal(false);
      await fetchSpeakers();
      
    } catch (error) {
      console.error('Speaker submission error:', error);
      showNotification(`An error occurred while ${editMode ? 'updating' : 'adding'} the speaker`, 'error');
    }
  };

  const uploadSpeakerImage = async (imageUuid, imageFile) => {
    try {
      await uploadMedia(imageUuid, imageFile, true);
      console.log('Image upload successful using PUT');
      showNotification('Image uploaded successfully', 'success');
    } catch (putError) {
      console.error('PUT failed, trying with POST:', putError);
      
      try {
        await uploadMedia(imageUuid, imageFile, false);
        console.log('Image upload successful using POST');
        showNotification('Image uploaded successfully', 'success');
      } catch (postError) {
        console.error('Both PUT and POST failed:', postError);
        showNotification('Speaker saved, but image upload failed', 'warning');
      }
    }
  };

  const handleImageUpload = async (imageUuid, imageFile) => {
    if (!imageUuid) {
      console.error('No image UUID received from API');
      showNotification('Error: No image UUID received from API', 'error');
      return;
    }
    
    if (!(imageFile instanceof File)) {
      console.error('Invalid file object:', imageFile);
      showNotification('Error: Invalid file object', 'error');
      return;
    }
    
    await uploadSpeakerImage(imageUuid, imageFile);
  };

  const showConfirmation = (message, onConfirm) => {
    setConfirmModal({
      show: true,
      message,
      onConfirm,
    });
  };

  const handleDelete = (id) => {
    showConfirmation(
      'Are you sure you want to delete this speaker?',
      async () => {
        const result = await deleteSpeaker(id);
        if (result.success) {
          showNotification('Speaker deleted successfully!', 'success');
          await fetchSpeakers();
        } else {
          showNotification(result.error || 'Failed to delete speaker', 'error');
        }
      }
    );
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const exportSpeakers = () => {
    const exportData = speakers.map(speaker => ({
      name: speaker.name,
      description: speaker.description,
      activity: activities.find(a => a.id === speaker.activity_id)?.name || '',
      image_url: speaker.image_uuid ? getMediaUrl(speaker.image_uuid) : ''
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'speakers-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredSpeakers = Array.isArray(speakers) 
    ? speakers.filter(speaker => {
        const matchesSearch = searchQuery === '' || 
          speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (speaker.description?.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesActivity = filterActivity === null || speaker.activity_id === filterActivity;
        
        return matchesSearch && matchesActivity;
      })
    : [];

  const sortedSpeakers = [...filteredSpeakers].sort((a, b) => {
    let fieldA = a[sortField === 'description' ? 'description' : sortField];
    let fieldB = b[sortField === 'description' ? 'description' : sortField];
    
    if (sortField === 'activity') {
      fieldA = activities.find(act => act.id === a.activity_id)?.name || '';
      fieldB = activities.find(act => act.id === b.activity_id)?.name || '';
    }
    
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil((sortedSpeakers?.length || 0) / itemsPerPage);
  const paginatedSpeakers = sortedSpeakers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        <button className="btn btn-primary" onClick={fetchSpeakers}>
          <FiRefreshCw className="mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  const filteredActivities = activities.filter((activity) =>
    activity.name.toLowerCase().includes(activitySearchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Speaker Management</h1>
        <div className="flex gap-2">
          <button onClick={exportSpeakers} className="btn btn-outline">
            <FiDownload className="mr-2" />
            Export
          </button>
          <button onClick={handleShowAddModal} className="btn btn-primary">
            <FiPlus className="mr-2" />
            Add Speaker
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="form-control flex-1">
          <div className="input-group">
            <input
              type="text"
              placeholder="Search speakers..."
              className="input input-bordered w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <select 
          className="select select-bordered max-w-xs"
          value={filterActivity || ''}
          onChange={(e) => setFilterActivity(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">All Activities</option>
          {activities.map(activity => (
            <option key={activity.id} value={activity.id}>{activity.name}</option>
          ))}
        </select>
      </div>

      {showSpeakerModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editMode ? 'Edit Speaker' : 'Add New Speaker'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-control w-full mb-4">
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

              <div className="form-control w-full mb-4">
                <label htmlFor="speaker-description" className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  id="speaker-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter speaker description"
                  className="textarea textarea-bordered w-full h-24"
                  required
                />
              </div>

              <div className="form-control w-full mb-4">
                <label htmlFor="speaker-role" className="label">
                  <span className="label-text">Role</span>
                </label>
                <input
                  id="speaker-role"
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="Enter speaker role"
                  className="input input-bordered w-full"
                />
              </div>
              
              <div className="form-control w-full mb-4">
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
                    <ul className="menu dropdown-content z-[2] p-2 shadow bg-base-100 rounded-box w-full mt-1 max-h-60 overflow-auto">
                      {filteredActivities.length > 0 ? (
                        filteredActivities.map((activity) => (
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
                    <span className="badge badge-primary flex items-center gap-1">
                      <span className="text-xs opacity-80">Activity:</span>
                      {activities.find((a) => a.id === formData.activity_id)?.name || formData.activity_id}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-control w-full mb-6">
                <label htmlFor="speaker-image" className="label flex justify-between">
                  <span className="label-text">Image</span>
                  {imagePreview && (
                    <button 
                      type="button" 
                      className="btn btn-xs btn-ghost"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, image: null }));
                        setImagePreview(null);
                        document.getElementById('speaker-image').value = '';
                        if (editMode) {
                          setFormData(prev => ({ ...prev, image_uuid: null }));
                        }
                      }}
                    >
                      Clear Image
                    </button>
                  )}
                </label>
                
                <div className="flex gap-4 items-start">
                  <div>
                    {imagePreview ? (
                      <div className="avatar mb-2">
                        <div className="w-24 h-24 rounded-full">
                          <img src={imagePreview} alt="Preview" className="object-cover" />
                        </div>
                      </div>
                    ) : (
                      <div className="avatar mb-2">
                        <div className="w-24 h-24 rounded-full bg-base-300 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-base-content text-xl font-medium leading-none">
                              {formData.name ? getInitials(formData.name) : 'NA'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <input
                      id="speaker-image"
                      type="file"
                      name="image"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="file-input file-input-bordered w-full"
                    />
                    <p className="text-xs text-base-content/70 mt-1">
                      Recommended: Square image, at least 300x300px
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    resetForm();
                    setShowSpeakerModal(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {editMode ? 'Save Changes' : 'Add Speaker'}
                </button>
              </div>
            </form>
          </div>
          <button 
            className="modal-backdrop" 
            onClick={() => setShowSpeakerModal(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowSpeakerModal(false);
              }
            }}
            aria-label="Close modal"
          ></button>
        </div>
      )}

      {confirmModal.show && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirmation</h3>
            <p className="py-4">{confirmModal.message}</p>
            <div className="modal-action">
              <button 
                className="btn btn-ghost" 
                onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setConfirmModal({ show: false, message: '', onConfirm: null });
                  }
                }
                }
                tabIndex={0}
                aria-label="Cancel confirmation"
              >
                Cancel
              </button>
              <button 
                className="btn btn-error" 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ show: false, message: '', onConfirm: null });
                }}
              >
                Confirm
              </button>
            </div>
          </div>
          <button 
            className="modal-backdrop" 
            onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setConfirmModal({ show: false, message: '', onConfirm: null });
              }
            }}
            aria-label="Close confirmation modal"
          ></button>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-2xl font-semibold mb-6">All Speakers</h2>

          {!speakers || speakers.length === 0 ? (
            <div className="text-center py-8">
              <div className="alert alert-info">
                <FiUser className="w-6 h-6" />
                <span>No speakers found. Add your first speaker using the button above.</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="uppercase text-xs font-semibold text-base-content/60">Photo</th>
                    <th 
                      className="uppercase text-xs font-semibold text-base-content/60 cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Name {getSortIndicator('name')}
                    </th>
                    <th 
                      className="uppercase text-xs font-semibold text-base-content/60 cursor-pointer"
                      onClick={() => handleSort('role')}
                    >
                      Role {getSortIndicator('role')}
                    </th>
                    <th 
                      className="uppercase text-xs font-semibold text-base-content/60 cursor-pointer"
                      onClick={() => handleSort('description')}
                    >
                      Description {getSortIndicator('description')}
                    </th>
                    <th 
                      className="uppercase text-xs font-semibold text-base-content/60 cursor-pointer"
                      onClick={() => handleSort('activity')}
                    >
                      Activity {getSortIndicator('activity')}
                    </th>
                    <th className="uppercase text-xs font-semibold text-base-content/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(paginatedSpeakers) && paginatedSpeakers.map((speaker) => (
                    <tr key={speaker.id}>
                      <td>
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                            {speaker.image_uuid ? (
                              <img
                                src={getMediaUrl(speaker.image_uuid)}
                                alt={speaker.name}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  console.log('Image load error for:', speaker.name, speaker.image_uuid);
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `<span class="flex h-full w-full items-center justify-center text-lg font-medium">${getInitials(speaker.name)}</span>`;
                                }}
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-lg font-medium">
                                {getInitials(speaker.name)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="font-medium">{speaker.name}</td>
                      <td className="text-base-content/70">{speaker.role}</td>
                      <td className="text-base-content/70">{truncateText(speaker.description)}</td>
                      <td className="text-base-content/70">
                        {speaker.activity_id
                          ? activities.find((a) => a.id === speaker.activity_id)?.name ||
                            `Activity #${speaker.activity_id}`
                          : '—'}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(speaker)}
                            className="btn btn-primary btn-sm"
                            aria-label={`Edit ${speaker.name}`}
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(speaker.id)}
                            className="btn btn-error btn-sm"
                            aria-label={`Delete ${speaker.name}`}
                          >
                            <FiTrash2 className="w-4 h-4" />
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

      <div className="flex justify-center mt-6">
        <div className="join">
          <button 
            className="join-item btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            «
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button 
              key={page}
              className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          
          <button 
            className="join-item btn"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeakerManagement;