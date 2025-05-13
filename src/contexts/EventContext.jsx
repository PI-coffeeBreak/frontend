import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { useKeycloak } from "@react-keycloak/web";
import { baseUrl } from "../consts";
import { axiosWithAuth } from "../utils/axiosWithAuth";

const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const { keycloak } = useKeycloak();
    
    const [eventInfo, setEventInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get event information
    const getEventInfo = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosWithAuth(keycloak).get(`${baseUrl}/event-info/event`);
            console.log("Event info fetched successfully:", response.data);
            setEventInfo(response.data);
            return response.data;
        } catch (err) {
            console.error("Error fetching event info:", err);
            setError("Failed to fetch event information. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Update event information
    const updateEventInfo = async (eventData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosWithAuth(keycloak).put(`${baseUrl}/event-info/event`, eventData);
            console.log("Event info updated successfully:", response.data);
            setEventInfo(response.data);
            return response.data;
        } catch (err) {
            console.error("Error updating event info:", err);
            setError("Failed to update event information. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const uploadApplicationIcon = async(src, sizes, type) => {
        setIsLoading(true);
        setError(null);
        try {

            const payload = {
                "src": baseUrl + "/media/" + src,
                "sizes": sizes,
                "type": type
            }

            const response = await axiosWithAuth(keycloak).post(`${baseUrl}/manifest/icon`, payload);

            console.log("File uploaded successfully:", response.data);
            return response.data;
        } catch (err) {
            console.error("Error uploading file:", err);
            setError("Failed to upload file. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    // Auto-fetch event info when the context mounts
    useEffect(() => {
        if (keycloak?.authenticated) {
            getEventInfo();
        }
    }, [keycloak?.authenticated]);

    const contextValue = useMemo(() => ({
        eventInfo,
        isLoading,
        error,
        getEventInfo,
        updateEventInfo,
        uploadApplicationIcon,
    }), [eventInfo, isLoading, error]);

    return (
        <EventContext.Provider value={contextValue}>
            {children}
        </EventContext.Provider>
    );
};

EventProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useEvent = () => useContext(EventContext);