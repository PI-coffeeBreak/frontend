import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { axiosWithAuth } from '../utils/axiosWithAuth';
import { useKeycloak } from "@react-keycloak/web";

const SpeakerContext = createContext();

export const SpeakerProvider = ({ children }) => {
  const { keycloak } = useKeycloak();
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSpeakers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosWithAuth(keycloak).get('/speaker-presentation-plugin/speakers/');
      setSpeakers(response.data || []);
    } catch (err) {
      setError('Failed to fetch speakers. Please try again.');
      console.error('Error fetching speakers:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      // Step 1: Register media to get UUID
      const registerResponse = await axiosWithAuth(keycloak).post('/media/register');
      const { uuid } = registerResponse.data;

      // Step 2: Upload the file using the UUID
      const formData = new FormData();
      formData.append('file', file);

      await axiosWithAuth(keycloak).post(`/media/${uuid}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return uuid;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const addSpeaker = async (speakerData) => {
    setLoading(true);
    try {
      let imageUuid = null;

      if (speakerData.image) {
        imageUuid = await uploadImage(speakerData.image);
      }

      // Log the data being sent
      console.log('Sending speaker data:', {
        name: speakerData.name,
        description: speakerData.title || '',
        image: imageUuid || '',
      });

      await axiosWithAuth(keycloak).post('/speaker-presentation-plugin/speakers/', {
        name: speakerData.name,
        description: speakerData.title || '',
        image: imageUuid || '',
      });

      await fetchSpeakers();
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to add speaker';
      setError(errorMessage);
      console.error('Error adding speaker:', err);
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
        image: imageUuid || '',
      };

      await axiosWithAuth(keycloak).put(`/speaker-presentation-plugin/speakers/${id}`, updatedSpeakerData);
      await fetchSpeakers();
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to update speaker';
      setError(errorMessage);
      console.error('Error updating speaker:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteSpeaker = async (id) => {
    setLoading(true);
    try {
      await axiosWithAuth(keycloak).delete(`/speaker-presentation-plugin/speakers/${id}`);
      await fetchSpeakers();
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete speaker';
      setError(errorMessage);
      console.error('Error deleting speaker:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Fetch speakers when authenticated
  useEffect(() => {
    if (keycloak?.authenticated) {
      fetchSpeakers();
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