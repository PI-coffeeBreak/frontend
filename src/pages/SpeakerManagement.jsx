import React, { useEffect, useState } from 'react';
import { FiUser, FiRefreshCw, FiTrash2, FiSearch, FiEdit, FiPlus } from 'react-icons/fi';
import { useSpeakers } from '../contexts/SpeakerContext';
import { useNotification } from '../contexts/NotificationContext';
import { useActivities } from '../contexts/ActivitiesContext';
import { useMedia } from '../contexts/MediaContext';

const SpeakerManagement = () => {
  const { speakers, loading, error, fetchSpeakers, addSpeaker, updateSpeaker, deleteSpeaker } = useSpeakers();
  const { activities, fetchActivities } = useActivities();
  const { showNotification } = useNotification();
  const { uploadMedia, getMediaUrl } = useMedia();

  const [formData, setFormData] = useState({
    name: '',
    title: '',
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
  const itemsPerPage = 7;

  // Add sorting state
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchSpeakers();
    fetchActivities();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      if (files && files[0]) {
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
      title: '',
      image: null,
      activity_id: null,
    });
    setImagePreview(null);
    setActivitySearchQuery('');
    setEditMode(false);
    setEditingSpeakerId(null);

    // Reset file input
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
      title: speaker.description || '',
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
      let imageToUpload = null;
      
      const speakerSubmitData = {
        name: formData.name,
        title: formData.title,
        activity_id: formData.activity_id || null,
      };

      // Handle image logic based on state
      if (formData.image instanceof File) {
        imageToUpload = formData.image;
        console.log('New image selected for upload:', formData.image.name);
      } else if (editMode && formData.image_uuid) {
        console.log('Keeping existing image by omitting field, UUID:', formData.image_uuid);
      } else {
        // No image
        speakerSubmitData.image = null;
        console.log('No image for this speaker');
      }
      
      console.log('Speaker submit data:', speakerSubmitData);

      try {
        let result;
        if (editMode) {
          result = await updateSpeaker(editingSpeakerId, speakerSubmitData);
        } else {
          result = await addSpeaker(speakerSubmitData);
        }

        // Handle image upload if needed
        if (result.success && imageToUpload) {
          try {
            // Get UUID from the API response
            const imageUuid = result.data.image;
            console.log('Uploading image with UUID from response:', imageUuid);
            
            if (!imageUuid) {
              console.error('No image UUID received from API');
              showNotification('Error: No image UUID received from API', 'error');
              return;
            }
            
            // Make sure the file is valid
            if (!(imageToUpload instanceof File)) {
              console.error('Invalid file object:', imageToUpload);
              showNotification('Error: Invalid file object', 'error');
              return;
            }
            
            const isUpdate = editMode;
            console.log(`Uploading media with isUpdate=${isUpdate}`);
            
            try {
              // Try with PUT first (update existing)
              const uploadResult = await uploadMedia(imageUuid, imageToUpload, true);
              console.log('Image upload successful using PUT');
              showNotification('Image uploaded successfully', 'success');
            } catch (putError) {
              console.error('PUT failed, trying with POST:', putError);
              
              // If PUT fails, try with POST as fallback
              try {
                const uploadResult = await uploadMedia(imageUuid, imageToUpload, false);
                console.log('Image upload successful using POST');
                showNotification('Image uploaded successfully', 'success');
              } catch (postError) {
                console.error('Both PUT and POST failed:', postError);
                showNotification(`Speaker ${editMode ? 'updated' : 'created'}, but image upload failed`, 'warning');
              }
            }
          } catch (imageError) {
            console.error('Image upload failed:', imageError);
            showNotification(`Speaker ${editMode ? 'updated' : 'created'}, but image upload failed`, 'warning');
          }
        }

        if (result.success) {
          showNotification(`Speaker ${editMode ? 'updated' : 'added'} successfully!`, 'success');
          resetForm();
          setShowSpeakerModal(false);
          // Make sure to refresh speakers after changes
          await fetchSpeakers();
        } else {
          showNotification(result.error || `Failed to ${editMode ? 'update' : 'add'} speaker`, 'error');
        }
      } catch (apiError) {
        console.error('API request failed:', apiError);
        showNotification(`Failed to ${editMode ? 'update' : 'create'} speaker`, 'error');
      }
    } catch (error) {
      console.error('Speaker submission error:', error);
      showNotification(`An error occurred while ${editMode ? 'updating' : 'adding'} the speaker`, 'error');
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

  const filteredSpeakers = Array.isArray(speakers) 
    ? speakers.filter(speaker => {
        const matchesSearch = searchQuery === '' || 
          speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (speaker.description && speaker.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesActivity = filterActivity === null || speaker.activity_id === filterActivity;
        
        return matchesSearch && matchesActivity;
      })
    : [];

  // Sort the filtered speakers
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

  // Calculate pagination
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
        <button onClick={handleShowAddModal} className="btn btn-primary">
          <FiPlus className="mr-2" />
          Add Speaker
        </button>
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

      {/* Speaker Form Modal (for both Add and Edit) */}
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
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter speaker description"
                  className="textarea textarea-bordered w-full h-24"
                  required
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
                        <div className="w-24 h-24 rounded-full bg-base-300 flex items-center justify-center">
                          {formData.name ? getInitials(formData.name) : 'No Image'}
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
          <div className="modal-backdrop" onClick={() => setShowSpeakerModal(false)}></div>
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
                      Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="uppercase text-xs font-semibold text-base-content/60 cursor-pointer"
                      onClick={() => handleSort('description')}
                    >
                      Description {sortField === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="uppercase text-xs font-semibold text-base-content/60 cursor-pointer"
                      onClick={() => handleSort('activity')}
                    >
                      Activity {sortField === 'activity' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="uppercase text-xs font-semibold text-base-content/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(paginatedSpeakers) && paginatedSpeakers.map((speaker) => (
                    <tr key={speaker.id}>
                      <td>
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg font-semibold">
                            {speaker.image_uuid ? (
                              <img
                                src={getMediaUrl(speaker.image_uuid)}
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

          {/* Add pagination controls below the table */}
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
      </div>
    </div>
  );
};

export default SpeakerManagement;