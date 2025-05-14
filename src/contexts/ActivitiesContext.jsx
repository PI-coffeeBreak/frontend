import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { baseUrl } from "../consts";
import { useKeycloak } from "@react-keycloak/web";
import { axiosWithAuth } from '../utils/axiosWithAuth';

const ActivitiesContext = createContext();

export const ActivitiesProvider = ({ children }) => {
    const activitiesBaseUrl = `${baseUrl}/activities`;
    const activityTypesBaseUrl = `${baseUrl}/activity-types`;
    const { keycloak, initialized } = useKeycloak();

    const [activities, setActivities] = useState([]);
    const [activityTypes, setActivityTypes] = useState([]);
    const [calendarActivities, setCalendarActivities] = useState([]);
    const [outsideActivities, setOutsideActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchActivities = async () => {
        if (!initialized || !keycloak?.authenticated) {
            console.log("Keycloak not initialized or user not authenticated");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosWithAuth(keycloak).get(`${activitiesBaseUrl}/`);
            const data = response.data;

            const calendarEvents = data.filter(
                (activity) => activity.date && new Date(activity.date).getTime() > 0
            );
            const outsideEvents = data.filter(
                (activity) => !activity.date || new Date(activity.date).getTime() <= 0
            );

            setActivities(data);
            setCalendarActivities(calendarEvents);
            setOutsideActivities(outsideEvents);
        } catch (error) {
            console.error("Error fetching activities:", error);
            setError("Failed to fetch activities. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchActivityTypes = async () => {
        if (!initialized || !keycloak?.authenticated) {
            console.log("Keycloak not initialized or user not authenticated");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosWithAuth(keycloak).get(`${activityTypesBaseUrl}/`);
            setActivityTypes(response.data);
        } catch (error) {
            console.error("Error fetching activity types:", error);
            setError("Failed to fetch activity types. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const updateActivity = async (activityId, updates) => {
        if (!initialized || !keycloak?.authenticated) {
            console.log("Keycloak not initialized or user not authenticated");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const activity = activities.find((act) => act.id === activityId);

            if (!activity) {
                throw new Error(`Activity with ID ${activityId} not found.`);
            }

            const updatedActivity = { ...activity, ...updates };

            await axiosWithAuth(keycloak).put(`${activitiesBaseUrl}/${activityId}`, updatedActivity);

            await fetchActivities();
        } catch (error) {
            console.error("Error updating activity:", error);
            setError("Failed to update activity. Please try again.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const moveActivityToCalendar = async (activityId, newStartTime) => {
        await updateActivity(activityId, { date: newStartTime });
    };

    const removeActivityFromCalendar = async (activityId) => {
        await updateActivity(activityId, { date: null });
    };

    const getActivityTypeID = (type) => {
        const normalizedType = type.trim().toLowerCase();

        for (const activityType of activityTypes) {
            if (activityType.type.toLowerCase() === normalizedType) {
                return activityType.id;
            }
        }

        return "Type not found";
    };

    const getActivityType = (typeId) => {
        for (const activityType of activityTypes) {
            if (activityType.id === typeId) {
                return activityType.type;
            }
        }

        return "Type not found";
    };

    const createActivityType = async (typeData) => {
        if (!initialized || !keycloak?.authenticated) {
            console.log("Keycloak not initialized or user not authenticated");
            return null;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosWithAuth(keycloak).post(`${baseUrl}/activity-types/`, typeData);
            setActivityTypes(prev => [...prev, response.data]);
            return response.data;
        } catch (error) {
            console.error("Error creating activity type:", error);
            setError("Failed to create activity type. Please try again.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const createActivitiesBatch = async (activitiesData) => {
        if (!initialized || !keycloak?.authenticated) {
            console.log("Keycloak not initialized or user not authenticated");
            return null;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosWithAuth(keycloak).post(
                `${baseUrl}/activities/batch/`,
                activitiesData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error importing activities:", error);
            setError("Failed to import activities. Please try again.");

            if (error.response?.data?.detail) {
                const errorMessages = Array.isArray(error.response.data.detail)
                    ? error.response.data.detail.map(err => `${err.loc.join('.')} - ${err.msg}`).join('\n')
                    : error.response.data.detail;
                console.error(errorMessages);
            } else {
                console.error(error.response?.data?.message || "Failed to import activities");
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const createActivity = async (activityData) => {
        if (!initialized || !keycloak?.authenticated) {
            console.log("Keycloak not initialized or user not authenticated");
            return null;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosWithAuth(keycloak).post(
                `${baseUrl}/activities/`,
                activityData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error creating activity:", error);
            setError("Failed to create activity. Please try again.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const deleteActivity = async (activityId) => {
        if (!initialized || !keycloak?.authenticated) {
            console.log("Keycloak not initialized or user not authenticated");
            return null;
        }

        setIsLoading(true);
        setError(null);
        try {
            await axiosWithAuth(keycloak).delete(`${activitiesBaseUrl}/${activityId}`);

            setActivities(prev => prev.filter(activity => activity.id !== activityId));
            setCalendarActivities(prev => prev.filter(activity => activity.id !== activityId));
            setOutsideActivities(prev => prev.filter(activity => activity.id !== activityId));
            
            return true;
        } catch (error) {
            console.error("Error deleting activity:", error);
            setError("Failed to delete activity. Please try again.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data when Keycloak is initialized and authenticated
    useEffect(() => {
        if (initialized && keycloak?.authenticated) {
            fetchActivities();
            fetchActivityTypes();
        }
    }, [initialized, keycloak?.authenticated]);

    // Memoize the value object to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ({
            activities,
            activityTypes,
            calendarActivities,
            outsideActivities,
            isLoading,
            error,
            fetchActivities,
            fetchActivityTypes,
            updateActivity,
            moveActivityToCalendar,
            removeActivityFromCalendar,
            getActivityTypeID,
            getActivityType,
            createActivitiesBatch,
            createActivity,
            setCalendarActivities,
            setOutsideActivities,
            createActivityType,
            deleteActivity,
        }),
        [
            activities,
            activityTypes,
            calendarActivities,
            outsideActivities,
            isLoading,
            error
        ]
    );

    return (
        <ActivitiesContext.Provider value={contextValue}>
            {children}
        </ActivitiesContext.Provider>
    );
};

ActivitiesProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useActivities = () => useContext(ActivitiesContext);