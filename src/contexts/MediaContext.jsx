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
            // Check if we already have this media in state to prevent redundant fetches
            if (media[uuid]) {
                setIsLoading(false);
                return media[uuid];
            }

            const response = await axiosWithAuth(keycloak).get(`${baseUrl}/media/${uuid}`);
            console.log(`Media with UUID ${uuid} fetched successfully:`, response.data);
            
            // Add media to state cache
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

    const contextValue = useMemo(() => ({
        media,
        isLoading,
        error,
        getMedia,
        getEventImage,
        getMediaUrl
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