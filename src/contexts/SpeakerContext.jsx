import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { axiosWithAuth } from '../utils/axiosWithAuth';
import { useKeycloak } from "@react-keycloak/web";
import { baseUrl } from '../consts';

const SpeakerContext = createContext();

const API_ENDPOINTS = {
  SPEAKERS: `${baseUrl}/speaker-presentation-plugin/speakers/`,
};

export const SpeakerProvider = ({ children }) => {
  const { keycloak } = useKeycloak();
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSpeakers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Log URL for debugging
      console.log(`Fetching speakers from: ${API_ENDPOINTS.SPEAKERS}`);
      
      const response = await axiosWithAuth(keycloak).get(API_ENDPOINTS.SPEAKERS);
      
      // Check if response.data exists and is an array
      if (Array.isArray(response.data)) {
        // Transform the data to normalize the field names
        const normalizedSpeakers = response.data.map(speaker => ({
          id: speaker.id,
          name: speaker.name || 'Unnamed Speaker',
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
      
      // Detailed error logging
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
      // Log the exact payload being sent to the API
      const payload = {
        name: speakerData.name,
        description: speakerData.title || '',
        activity_id: speakerData.activity_id || null
      };
      
      console.log('API Payload for creating speaker:', payload);
      console.log('API URL:', API_ENDPOINTS.SPEAKERS);
      
      // Send the request
      const response = await axiosWithAuth(keycloak).post(API_ENDPOINTS.SPEAKERS, payload);
      console.log('API Response from creating speaker:', response.data);
      
      // Refresh the speaker list
      await fetchSpeakers();
      
      // Return success with the created speaker data
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error in addSpeaker:', err);
      
      // More detailed error logging
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
    try {
      let imageUuid = speakerData.image_uuid;

      if (speakerData.image instanceof File) {
        imageUuid = await uploadImage(speakerData.image);
      }

      const updatedSpeakerData = {
        name: speakerData.name,
        description: speakerData.title || '',
        image: imageUuid || null,
      };

      console.log(`Updating speaker ${id} with data:`, updatedSpeakerData);
      
      await axiosWithAuth(keycloak).put(`${API_ENDPOINTS.SPEAKERS}${id}/`, updatedSpeakerData);
      
      await fetchSpeakers();
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to update speaker';
      setError(errorMessage);
      
      // Detailed error logging
      if (err.response) {
        console.error(`Update speaker error ${err.response.status}:`, err.response.data);
      } else if (err.request) {
        console.error('No response received when updating speaker:', err.request);
      } else {
        console.error('Error setting up update speaker request:', err.message);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteSpeaker = async (id) => {
    setLoading(true);
    try {
      console.log(`Deleting speaker ${id}...`);
      
      await axiosWithAuth(keycloak).delete(`${API_ENDPOINTS.SPEAKERS}${id}/`);
      
      console.log('Speaker deleted, refreshing list');
      await fetchSpeakers();
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete speaker';
      setError(errorMessage);
      
      // Detailed error logging
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

  // Fetch speakers when authenticated
  useEffect(() => {
    if (keycloak?.authenticated) {
      console.log('Authenticated, fetching speakers');
      fetchSpeakers();
    } else {
      console.log('Not authenticated yet, waiting...');
    }
  }, [keycloak?.authenticated]);

  // Memoize the context value
  const contextValue = useMemo(
    () => ({
      speakers,
      loading,
      error,
      fetchSpeakers,
      addSpeaker,
      updateSpeaker,
      deleteSpeaker,
    }),
    [speakers, loading, error]
  );

  return (
    <SpeakerContext.Provider value={contextValue}>
      {children}
    </SpeakerContext.Provider>
  );
};

SpeakerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSpeakers = () => {
  const context = useContext(SpeakerContext);
  if (!context) {
    throw new Error('useSpeakers must be used within a SpeakerProvider');
  }
  return context;
};

export default SpeakerProvider;