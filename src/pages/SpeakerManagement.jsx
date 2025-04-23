import React, { useEffect, useState } from 'react';
import { FiUser, FiRefreshCw, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { useSpeakers } from '../contexts/SpeakerContext';

const SpeakerManagement = () => {
  const { speakers, loading, error, fetchSpeakers, addSpeaker, deleteSpeaker } = useSpeakers();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    image: null
  });

  useEffect(() => {
    fetchSpeakers();
  }, []); // Only fetch on mount

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await addSpeaker(formData);
    
    if (result.success) {
      // Show success toast
      const toast = document.getElementById('success-toast');
      if (toast) toast.click();
      
      // Reset form
      setFormData({ name: '', title: '', image: null });
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } else {
      // Show error toast
      const toast = document.getElementById('error-toast');
      if (toast) toast.click();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this speaker?')) {
      const result = await deleteSpeaker(id);
      if (result.success) {
        const toast = document.getElementById('success-toast');
        if (toast) toast.click();
      } else {
        const toast = document.getElementById('error-toast');
        if (toast) toast.click();
      }
    }
  };

  // Function to generate initials from name
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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Speaker Management</h1>
      
      <form onSubmit={handleSubmit} className="card bg-base-200 p-6 mb-8">
        <div className="form-control w-full max-w-md mb-4">
          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input
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
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter speaker description"
            className="textarea textarea-bordered w-full h-24"
            required
          />
        </div>

        <div className="form-control w-full max-w-md mb-6">
          <label className="label">
            <span className="label-text">Image</span>
          </label>
          <input
            type="file"
            name="image"
            onChange={handleInputChange}
            accept="image/*"
            className="file-input file-input-bordered w-full"
          />
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

      {/* Success Toast */}
      <div className="toast toast-end">
        <div id="success-toast" className="alert alert-success hidden">
          <span>Operation completed successfully!</span>
        </div>
      </div>

      {/* Error Toast */}
      <div className="toast toast-end">
        <div id="error-toast" className="alert alert-error hidden">
          <span>{error || 'Operation failed. Please try again.'}</span>
        </div>
      </div>
    </div>
  );
};

export default SpeakerManagement; 