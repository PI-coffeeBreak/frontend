import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useKeycloak } from '@react-keycloak/web';
import { axiosWithAuth } from '../utils/axiosWithAuth';
import { getApiBaseUrl } from '../utils/api';
import { useNotification } from './NotificationContext';

const SponsorsContext = createContext();

export function SponsorsProvider({ children }) {
  // State management - keep only what's needed for sponsor and level operations
  const [sponsors, setSponsors] = useState([]);
  const [levels, setLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Authentication and notification
  const { keycloak } = useKeycloak();
  const { showNotification } = useNotification();

  const baseUrl = getApiBaseUrl();
  
  // API endpoints
  const levelApiUrl = `${baseUrl}/sponsors-promotion-plugin/sponsors/levels/`;
  const sponsorApiUrl = `${baseUrl}/sponsors-promotion-plugin/sponsors/`;
  
  // Fetch levels from API
  const fetchLevels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axiosWithAuth(keycloak).get(levelApiUrl);
      setLevels(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching levels:", err);
      setError(err);
      showNotification("Failed to load sponsor levels", "error");
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch sponsors from API
  const fetchSponsors = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axiosWithAuth(keycloak).get(sponsorApiUrl);
      setSponsors(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching sponsors:", err);
      setError(err);
      showNotification("Failed to load sponsors", "error");
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add new level
  const addLevel = async (levelName) => {
    if (!levelName.trim()) {
      showNotification("Level name cannot be empty", "error");
      return null;
    }
    
    try {
      const response = await axiosWithAuth(keycloak).post(levelApiUrl, {
        name: levelName
      });
      
      setLevels(prevLevels => [...prevLevels, response.data]);
      showNotification(`Level "${levelName}" created successfully`, "success");
      return response.data;
    } catch (err) {
      console.error("Error creating level:", err);
      showNotification("Failed to create sponsor level", "error");
      return null;
    }
  };
  
  // Delete level
  const deleteLevel = async (levelId) => {
    const hasSponsors = sponsors.some(sponsor => sponsor.level_id === levelId);
    
    if (hasSponsors) {
      showNotification("Cannot delete a level that has sponsors associated with it", "error");
      return false;
    }
    
    try {
      await axiosWithAuth(keycloak).delete(`${levelApiUrl}/${levelId}`);
      setLevels(prevLevels => prevLevels.filter(level => level.id !== levelId));
      showNotification("Sponsor level deleted successfully", "success");
      return true;
    } catch (err) {
      console.error("Error deleting level:", err);
      showNotification("Failed to delete sponsor level", "error");
      return false;
    }
  };
  
  // Add new sponsor
  const addSponsor = async (sponsorData) => {
    if (!sponsorData.name.trim()) {
      showNotification("Sponsor name cannot be empty", "error");
      return null;
    }
    
    if (!sponsorData.level_id) {
      showNotification("Please select a sponsor level", "error");
      return null;
    }
    
    try {
      const response = await axiosWithAuth(keycloak).post(sponsorApiUrl, sponsorData);
      setSponsors(prevSponsors => [...prevSponsors, response.data]);
      showNotification(`Sponsor "${sponsorData.name}" created successfully`, "success");
      return response.data;
    } catch (err) {
      console.error("Error creating sponsor:", err);
      showNotification("Failed to create sponsor", "error");
      return null;
    }
  };
  
  // Update existing sponsor
  const updateSponsor = async (sponsorId, sponsorData) => {
    if (!sponsorData.name.trim()) {
      showNotification("Sponsor name cannot be empty", "error");
      return null;
    }
    
    try {
      const response = await axiosWithAuth(keycloak).put(
        `${sponsorApiUrl}/${sponsorId}`, 
        sponsorData
      );
      
      setSponsors(prevSponsors => 
        prevSponsors.map(sponsor => sponsor.id === sponsorId ? response.data : sponsor)
      );
      
      showNotification(`Sponsor "${sponsorData.name}" updated successfully`, "success");
      return response.data;
    } catch (err) {
      console.error("Error updating sponsor:", err);
      showNotification("Failed to update sponsor", "error");
      return null;
    }
  };
  
  // Delete sponsor
  const deleteSponsor = async (sponsorId) => {
    try {
      await axiosWithAuth(keycloak).delete(`${sponsorApiUrl}/${sponsorId}`);
      setSponsors(prevSponsors => prevSponsors.filter(sponsor => sponsor.id !== sponsorId));
      showNotification("Sponsor deleted successfully", "success");
      return true;
    } catch (err) {
      console.error("Error deleting sponsor:", err);
      showNotification("Failed to delete sponsor", "error");
      return false;
    }
  };
  
  // Group sponsors by level - helper function
  const sponsorsByLevel = useMemo(() => {
    return levels.map(level => ({
      ...level,
      sponsors: sponsors.filter(sponsor => sponsor.level_id === level.id)
    }));
  }, [sponsors, levels]);
  
  // Initialize data
  useEffect(() => {
    if (keycloak?.authenticated) {
      fetchLevels();
      fetchSponsors();
    }
  }, [keycloak?.authenticated]);
  
  // Create context value
  const contextValue = useMemo(() => ({
    // Data
    sponsors,
    levels,
    sponsorsByLevel,
    isLoading,
    error,
    
    // Operations
    fetchSponsors,
    fetchLevels,
    addLevel,
    deleteLevel,
    addSponsor,
    updateSponsor,
    deleteSponsor
  }), [
    sponsors, 
    levels, 
    sponsorsByLevel, 
    isLoading, 
    error
  ]);
  
  return (
    <SponsorsContext.Provider value={contextValue}>
      {children}
    </SponsorsContext.Provider>
  );
}

SponsorsProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use the sponsors context
export const useSponsors = () => {
  const context = useContext(SponsorsContext);
  if (context === undefined) {
    throw new Error('useSponsors must be used within a SponsorsProvider');
  }
  return context;
};