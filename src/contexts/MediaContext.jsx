import React, { createContext, useContext, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useKeycloak } from "@react-keycloak/web";
import { baseUrl } from "../consts";
import { axiosWithAuth } from "../utils/axiosWithAuth";
import { useEvent } from "./EventContext";

const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
    const { keycloak } = useKeycloak();
    const { eventInfo } = useEvent();
    
    const [media, setMedia] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get media by UUID
    const getMedia = async (uuid) => {
        setIsLoading(true);
        setError(null);
        try {
            if (media[uuid]) {
                setIsLoading(false);
                return media[uuid];
            }

            const response = await axiosWithAuth(keycloak).get(`${baseUrl}/media/${uuid}`);
            console.log(`Media with UUID ${uuid} fetched successfully:`, response.data);

            setMedia(prevMedia => ({
                ...prevMedia,
                [uuid]: response.data
            }));
            
            return response.data;
        } catch (err) {
            console.error(`Error fetching media with UUID ${uuid}:`, err);
            setError(`Failed to fetch media. Please try again.`);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Get event image using event info
    const getEventImage = async () => {
        setIsLoading(true);
        setError(null);
        
        if (!eventInfo?.image_id) {
            setIsLoading(false);
            setError("No event image available");
            return null;
        }
        
        try {
            return await getMedia(eventInfo.image_id);
        } catch (err) {
            console.error("Error fetching event image:", err);
            setError("Failed to fetch event image. Please try again.");
            throw err;
        }
    };

    // Get media URL
    const getMediaUrl = (uuid) => {
        if (!uuid) return null;
        return `${baseUrl}/media/${uuid}`;
    };

    // Register new media
    const registerMedia = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosWithAuth(keycloak).post(`${baseUrl}/media/register`);
            console.log('Media registered with UUID:', response.data.uuid);
            return response.data;
        } catch (err) {
            console.error('Error registering media:', err);
            setError('Failed to register media');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Upload media file
    const uploadMedia = async (uuid, file, isUpdate = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const method = isUpdate ? 'put' : 'post';
            
            await axiosWithAuth(keycloak)[method](
                `${baseUrl}/media/${uuid}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            
            setMedia(prevMedia => {
                const updatedMedia = {...prevMedia};
                delete updatedMedia[uuid];
                return updatedMedia;
            });
            
            console.log(`Media ${isUpdate ? 'updated' : 'uploaded'} successfully`);
            return true;
        } catch (err) {
            console.error(`Error ${isUpdate ? 'updating' : 'uploading'} media:`, err);
            setError(`Failed to ${isUpdate ? 'update' : 'upload'} media`);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Delete media by UUID
    const deleteMedia = async (uuid) => {
        if (!uuid) return false;
        
        setIsLoading(true);
        setError(null);
        try {
            await axiosWithAuth(keycloak).delete(`${baseUrl}/media/${uuid}`);
            
            setMedia(prevMedia => {
                const updatedMedia = {...prevMedia};
                delete updatedMedia[uuid];
                return updatedMedia;
            });
            
            console.log(`Media ${uuid} deleted successfully`);
            return true;
        } catch (err) {
            console.error('Error deleting media:', err);
            setError('Failed to delete media');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const contextValue = useMemo(() => ({
        media,
        isLoading,
        error,
        getMedia,
        getEventImage,
        getMediaUrl,
        registerMedia,
        uploadMedia,
        deleteMedia,
    }), [media, isLoading, error, eventInfo]);

    return (
        <MediaContext.Provider value={contextValue}>
            {children}
        </MediaContext.Provider>
    );
};

MediaProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useMedia = () => useContext(MediaContext);