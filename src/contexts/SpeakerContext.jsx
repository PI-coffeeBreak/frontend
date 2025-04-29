import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { axiosWithAuth } from '../utils/axiosWithAuth';
import { useKeycloak } from "@react-keycloak/web";
import { baseUrl } from '../consts';

const SpeakerContext = createContext();

const API_ENDPOINTS = {
  SPEAKERS: `${baseUrl}/speaker-presentation-plugin/speakers/`,
  MEDIA_REGISTER: `${baseUrl}/media/register/`,
  MEDIA_UPLOAD: (uuid) => `${baseUrl}/media/${uuid}/`,
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
          image_uuid: speaker.image, // Map API's "image" field to "image_uuid"
          activity_id: speaker.activity_id
        }));
        setSpeakers(normalizedSpeakers);
        console.log(`Successfully loaded ${normalizedSpeakers.length} speakers`);
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object with results property (common API pattern)
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
        // If we can't determine the structure, set an empty array
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

  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      // Step 1: Register media to get UUID
      console.log('Registering media...');
      const registerResponse = await axiosWithAuth(keycloak).post(API_ENDPOINTS.MEDIA_REGISTER);
      const { uuid } = registerResponse.data;
      console.log('Media registered with UUID:', uuid);

      // Step 2: Upload the file using the UUID
      const formData = new FormData();
      formData.append('file', file);

      console.log(`Uploading file to ${API_ENDPOINTS.MEDIA_UPLOAD(uuid)}`);
      await axiosWithAuth(keycloak).post(API_ENDPOINTS.MEDIA_UPLOAD(uuid), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('File upload complete');

      return uuid;
    } catch (error) {
      // Detailed error logging
      if (error.response) {
        console.error(`Image upload error ${error.response.status}:`, error.response.data);
      } else if (error.request) {
        console.error('No response received for image upload:', error.request);
      } else {
        console.error('Error setting up image upload request:', error.message);
      }
      throw new Error('Failed to upload image');
    }
  };

  const addSpeaker = async (speakerData) => {
    setLoading(true);
    setError(null); // Clear previous errors
    
    try {
      let imageUuid = null;

      if (speakerData.image) {
        try {
          imageUuid = await uploadImage(speakerData.image);
        } catch (imageError) {
          console.error('Image upload error:', imageError);
          return { 
            success: false, 
            error: 'Failed to upload image. Please try again with a smaller image or different format.' 
          };
        }
      }

      console.log('Adding speaker with data:', {
        name: speakerData.name,
        description: speakerData.title || '',
        image: imageUuid
      });
      
      // Use consistent endpoint
      await axiosWithAuth(keycloak).post(API_ENDPOINTS.SPEAKERS, {
        name: speakerData.name,
        description: speakerData.title || '', // Title is used as description in the form
        image: imageUuid || null, // Use null instead of empty string if no image
      });

      await fetchSpeakers();
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to add speaker';
      setError(errorMessage);
      
      // Detailed error logging
      if (err.response) {
        console.error(`Add speaker error ${err.response.status}:`, err.response.data);
      } else if (err.request) {
        console.error('No response received when adding speaker:', err.request);
      } else {
        console.error('Error setting up add speaker request:', err.message);
      }
      
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
        image: imageUuid || null, // Use null instead of empty string
      };

      console.log(`Updating speaker ${id} with data:`, updatedSpeakerData);
      
      // Use consistent endpoint format
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
      
      // Use consistent endpoint format
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