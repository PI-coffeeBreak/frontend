import { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaTrash, FaEdit, FaGlobe } from 'react-icons/fa';
import { useKeycloak } from '@react-keycloak/web';
import { axiosWithAuth } from '../../utils/axiosWithAuth.js';
import { baseUrl } from '../../consts.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';

const API_ENDPOINTS = {
  LEVELS: `${baseUrl}/sponsors-promotion-plugin/sponsors/levels/`,
  SPONSORS: `${baseUrl}/sponsors-promotion-plugin/sponsors/`
};

// Change from default export to named export
export function Sponsors() {
  // State management
  const [sponsors, setSponsors] = useState([]);
  const [levels, setLevels] = useState([]);
  const [isLoading, setIsLoading] = useState({
    sponsors: false,
    levels: false
  });
  const [error, setError] = useState(null);
  const [isAddingLevel, setIsAddingLevel] = useState(false);
  const [isAddingSponsor, setIsAddingSponsor] = useState(false);
  const [isEditingSponsor, setIsEditingSponsor] = useState(false);
  const [newLevelName, setNewLevelName] = useState('');
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  
  // Form state for new/edit sponsor
  const [sponsorForm, setSponsorForm] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    description: '',
    level_id: 0
  });
  
  // Authentication and notification
  const { keycloak } = useKeycloak();
  const { showNotification } = useNotification();
  
  // Group sponsors by level - helper function
  const sponsorsByLevel = useMemo(() => {
    return levels.map(level => ({
      ...level,
      sponsors: sponsors.filter(sponsor => sponsor.level_id === level.id)
    }));
  }, [sponsors, levels]);
  
  // Fetch data on component mount
  useEffect(() => {
    if (keycloak?.authenticated) {
      fetchLevels();
      fetchSponsors();
    }
  }, [keycloak?.authenticated]);
  
  // Fetch levels from API
  const fetchLevels = async () => {
    setIsLoading(prev => ({ ...prev, levels: true }));
    setError(null);
    
    try {
      const response = await axiosWithAuth(keycloak).get(API_ENDPOINTS.LEVELS);
      
      if (Array.isArray(response.data)) {
        setLevels(response.data);
      } else {
        console.error("Unexpected API response structure for levels:", response.data);
        setLevels([]);
      }
    } catch (err) {
      console.error("Error fetching levels:", err);
      
      if (err.response) {
        console.error("API Error Details:", {
          status: err.response.status,
          headers: err.response.headers,
          data: err.response.data
        });
      }
      
      setError("Failed to load sponsor levels");
      showNotification("Failed to load sponsor levels", "error");
    } finally {
      setIsLoading(prev => ({ ...prev, levels: false }));
    }
  };
  
  // Fetch sponsors from API
  const fetchSponsors = async () => {
    setIsLoading(prev => ({ ...prev, sponsors: true }));
    setError(null);
    
    try {
      const response = await axiosWithAuth(keycloak).get(API_ENDPOINTS.SPONSORS);
      
      if (Array.isArray(response.data)) {
        setSponsors(response.data);
      } else {
        console.error("Unexpected API response structure for sponsors:", response.data);
        setSponsors([]);
      }
    } catch (err) {
      console.error("Error fetching sponsors:", err);
      
      if (err.response) {
        console.error("API Error Details:", {
          status: err.response.status,
          headers: err.response.headers,
          data: err.response.data
        });
      }
      
      setError("Failed to load sponsors");
      showNotification("Failed to load sponsors", "error");
    } finally {
      setIsLoading(prev => ({ ...prev, sponsors: false }));
    }
  };
  
  // Add new level
  const handleAddLevel = async () => {
    if (!newLevelName.trim()) {
      showNotification("Level name cannot be empty", "error");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, levels: true }));
    try {
      const response = await axiosWithAuth(keycloak).post(API_ENDPOINTS.LEVELS, {
        name: newLevelName
      });
      
      setLevels(prevLevels => [...prevLevels, response.data]);
      showNotification(`Level "${newLevelName}" created successfully`, "success");
      setNewLevelName('');
      setIsAddingLevel(false);
    } catch (err) {
      console.error("Error creating level:", err);
      
      if (err.response) {
        console.error("API Error Details:", {
          status: err.response.status,
          headers: err.response.headers,
          data: err.response.data
        });
      }
      
      if (err.response?.status === 405) {
        // HTTP 405 means Method Not Allowed
        showNotification("API method not allowed. Please check with your backend team for the correct endpoint format.", "error");
      } else {
        showNotification("Failed to create sponsor level", "error");
      }
    } finally {
      setIsLoading(prev => ({ ...prev, levels: false }));
    }
  };
  
  // Delete sponsor level
  const handleDeleteLevel = async (levelId) => {
    const hasSponsors = sponsors.some(sponsor => sponsor.level_id === levelId);
    
    if (hasSponsors) {
      showNotification("Cannot delete a level that has sponsors associated with it", "error");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this level?")) {
      setIsLoading(prev => ({ ...prev, levels: true }));
      try {
        await axiosWithAuth(keycloak).delete(`${API_ENDPOINTS.LEVELS}${levelId}`);
        setLevels(prevLevels => prevLevels.filter(level => level.id !== levelId));
        showNotification("Sponsor level deleted successfully", "success");
      } catch (err) {
        console.error("Error deleting level:", err);
        
        if (err.response) {
          console.error("API Error Details:", {
            status: err.response.status,
            headers: err.response.headers,
            data: err.response.data
          });
        }
        
        showNotification("Failed to delete sponsor level", "error");
      } finally {
        setIsLoading(prev => ({ ...prev, levels: false }));
      }
    }
  };
  
  // Input change handler for sponsor form
  const handleSponsorInputChange = (e) => {
    const { name, value } = e.target;
    setSponsorForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Create new sponsor
  const handleAddSponsor = async () => {
    if (!sponsorForm.name.trim()) {
      showNotification("Sponsor name cannot be empty", "error");
      return;
    }
    
    if (!sponsorForm.level_id) {
      showNotification("Please select a sponsor level", "error");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, sponsors: true }));
    try {
      const response = await axiosWithAuth(keycloak).post(API_ENDPOINTS.SPONSORS, sponsorForm);
      
      setSponsors(prevSponsors => [...prevSponsors, response.data]);
      showNotification(`Sponsor "${sponsorForm.name}" created successfully`, "success");
      resetSponsorForm();
      setIsAddingSponsor(false);
    } catch (err) {
      console.error("Error creating sponsor:", err);
      
      if (err.response) {
        console.error("API Error Details:", {
          status: err.response.status,
          headers: err.response.headers,
          data: err.response.data
        });
      }
      
      showNotification("Failed to create sponsor", "error");
    } finally {
      setIsLoading(prev => ({ ...prev, sponsors: false }));
    }
  };
  
  // Update existing sponsor
  const handleUpdateSponsor = async () => {
    if (!sponsorForm.name.trim()) {
      showNotification("Sponsor name cannot be empty", "error");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, sponsors: true }));
    try {
      const response = await axiosWithAuth(keycloak).put(
        `${API_ENDPOINTS.SPONSORS}${selectedSponsor.id}`, 
        sponsorForm
      );
      
      setSponsors(prevSponsors => 
        prevSponsors.map(sponsor => 
          sponsor.id === selectedSponsor.id ? response.data : sponsor
        )
      );
      
      showNotification(`Sponsor "${sponsorForm.name}" updated successfully`, "success");
      resetSponsorForm();
      setIsEditingSponsor(false);
      setSelectedSponsor(null);
    } catch (err) {
      console.error("Error updating sponsor:", err);
      
      if (err.response) {
        console.error("API Error Details:", {
          status: err.response.status,
          headers: err.response.headers,
          data: err.response.data
        });
      }
      
      showNotification("Failed to update sponsor", "error");
    } finally {
      setIsLoading(prev => ({ ...prev, sponsors: false }));
    }
  };
  
  // Delete sponsor
  const handleDeleteSponsor = async (sponsorId) => {
    if (window.confirm("Are you sure you want to delete this sponsor?")) {
      setIsLoading(prev => ({ ...prev, sponsors: true }));
      try {
        await axiosWithAuth(keycloak).delete(`${API_ENDPOINTS.SPONSORS}${sponsorId}`);
        setSponsors(prevSponsors => prevSponsors.filter(sponsor => sponsor.id !== sponsorId));
        showNotification("Sponsor deleted successfully", "success");
      } catch (err) {
        console.error("Error deleting sponsor:", err);
        
        if (err.response) {
          console.error("API Error Details:", {
            status: err.response.status,
            headers: err.response.headers,
            data: err.response.data
          });
        }
        
        showNotification("Failed to delete sponsor", "error");
      } finally {
        setIsLoading(prev => ({ ...prev, sponsors: false }));
      }
    }
  };
  
  // Edit sponsor - populate form with existing sponsor data
  const handleEditSponsor = (sponsor) => {
    setSponsorForm({
      name: sponsor.name,
      logo_url: sponsor.logo_url || '',
      website_url: sponsor.website_url || '',
      description: sponsor.description || '',
      level_id: sponsor.level_id
    });
    setSelectedSponsor(sponsor);
    setIsEditingSponsor(true);
  };
  
  // Reset sponsor form
  const resetSponsorForm = () => {
    setSponsorForm({
      name: '',
      logo_url: '',
      website_url: '',
      description: '',
      level_id: levels.length > 0 ? levels[0].id : 0
    });
  };

  return (
    <div className="w-full min-h-svh p-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Sponsors Management</h1>
      
      {/* Levels Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Sponsor Levels</h2>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setIsAddingLevel(true)}
          >
            <FaPlus className="mr-2" /> Add Level
          </button>
        </div>
        
        {isLoading.levels ? (
          <div className="flex justify-center my-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {isAddingLevel && (
              <div className="bg-base-200 p-4 rounded-lg mb-4">
                <h3 className="font-medium mb-2">Create New Level</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter level name"
                    className="input input-bordered flex-1"
                    value={newLevelName}
                    onChange={(e) => setNewLevelName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={handleAddLevel}
                      disabled={!newLevelName.trim()}
                    >
                      Save
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={() => {
                        setIsAddingLevel(false);
                        setNewLevelName('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {levels.length === 0 ? (
              <div className="text-center py-8 bg-base-200 rounded-lg">
                <p className="text-lg text-gray-500">No sponsor levels found</p>
                <p className="text-sm text-gray-400">Create your first sponsor level to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Level Name</th>
                      <th>Sponsors Count</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levels.map((level) => {
                      const sponsorCount = sponsors.filter(s => s.level_id === level.id).length;
                      return (
                        <tr key={level.id}>
                          <td className="font-medium">{level.name}</td>
                          <td>{sponsorCount}</td>
                          <td>
                            <button 
                              className="btn btn-error btn-sm"
                              onClick={() => handleDeleteLevel(level.id)}
                              disabled={sponsorCount > 0}
                              title={sponsorCount > 0 ? "Cannot delete levels with sponsors" : "Delete level"}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Sponsors Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Sponsors</h2>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (levels.length === 0) {
                showNotification("Please create at least one level first", "warning");
                return;
              }
              resetSponsorForm();
              setSponsorForm(prev => ({
                ...prev,
                level_id: levels[0].id
              }));
              setIsAddingSponsor(true);
            }}
          >
            <FaPlus className="mr-2" /> Add Sponsor
          </button>
        </div>
        
        {isLoading.sponsors ? (
          <div className="flex justify-center my-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {/* Sponsor Form (Add/Edit) */}
            {(isAddingSponsor || isEditingSponsor) && (
              <div className="bg-base-200 p-6 rounded-lg mb-6">
                <h3 className="font-medium text-lg mb-4">
                  {isEditingSponsor ? "Edit Sponsor" : "Add New Sponsor"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="name">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={sponsorForm.name}
                      onChange={handleSponsorInputChange}
                      placeholder="Sponsor name"
                      className="input input-bordered w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="level_id">
                      Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="level_id"
                      id="level_id"
                      value={sponsorForm.level_id || ''}
                      onChange={handleSponsorInputChange}
                      className="select select-bordered w-full"
                    >
                      <option value="" disabled>Select a level</option>
                      {levels.map(level => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="website_url">
                      Website URL
                    </label>
                    <input
                      type="url"
                      name="website_url"
                      id="website_url"
                      value={sponsorForm.website_url}
                      onChange={handleSponsorInputChange}
                      placeholder="https://example.com"
                      className="input input-bordered w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="logo_url">
                      Logo URL
                    </label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="url"
                        name="logo_url"
                        id="logo_url"
                        value={sponsorForm.logo_url}
                        onChange={handleSponsorInputChange}
                        placeholder="https://example.com/logo.png"
                        className="input input-bordered w-full"
                      />
                      {sponsorForm.logo_url && (
                        <div className="mt-2">
                          <img 
                            src={sponsorForm.logo_url} 
                            alt="Logo preview" 
                            className="h-16 object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/200x100?text=Invalid+Image+URL";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1" htmlFor="description">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      value={sponsorForm.description}
                      onChange={handleSponsorInputChange}
                      placeholder="Describe the sponsor"
                      className="textarea textarea-bordered w-full h-24"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      setIsAddingSponsor(false);
                      setIsEditingSponsor(false);
                      setSelectedSponsor(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={isEditingSponsor ? handleUpdateSponsor : handleAddSponsor}
                  >
                    {isEditingSponsor ? "Update" : "Save"} Sponsor
                  </button>
                </div>
              </div>
            )}
            
            {/* Sponsors Display */}
            {sponsors.length === 0 ? (
              <div className="text-center py-8 bg-base-200 rounded-lg">
                <p className="text-lg text-gray-500">No sponsors found</p>
                <p className="text-sm text-gray-400">Add your first sponsor to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sponsorsByLevel.map(level => (
                  <div key={level.id} className="bg-base-200 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-primary">{level.name}</h3>
                    
                    {level.sponsors.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No sponsors in this level</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {level.sponsors.map(sponsor => (
                          <div key={sponsor.id} className="bg-base-100 rounded-lg shadow-sm overflow-hidden">
                            <div className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold">{sponsor.name}</h4>
                                <div className="flex gap-1">
                                  <button 
                                    className="btn btn-sm btn-ghost"
                                    onClick={() => handleEditSponsor(sponsor)}
                                    title="Edit"
                                    aria-label={`Edit ${sponsor.name}`}
                                  >
                                    <FaEdit />
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-ghost text-error"
                                    onClick={() => handleDeleteSponsor(sponsor.id)}
                                    title="Delete"
                                    aria-label={`Delete ${sponsor.name}`}
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </div>
                              
                              {sponsor.logo_url && (
                                <div className="h-20 flex items-center justify-center bg-base-200 rounded mb-3">
                                  <img 
                                    src={sponsor.logo_url} 
                                    alt={`${sponsor.name} logo`}
                                    className="max-h-16 max-w-full object-contain"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://placehold.co/200x100?text=Logo+Not+Available";
                                    }}
                                  />
                                </div>
                              )}
                              
                              {sponsor.description && (
                                <p className="text-sm mb-3 text-gray-600 line-clamp-2">
                                  {sponsor.description}
                                </p>
                              )}
                              
                              {sponsor.website_url && (
                                <a 
                                  href={sponsor.website_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-primary flex items-center gap-1"
                                >
                                  <FaGlobe className="w-3 h-3" />
                                  Visit Website
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Sponsors;