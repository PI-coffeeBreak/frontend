import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { baseUrl } from "../consts";

const ActivitiesContext = createContext();

export const ActivitiesProvider = ({ children }) => {
    const activitiesBaseUrl = `${baseUrl}/activities`;
    const activityTypesBaseUrl = `${baseUrl}/activity-types`;

    const [activities, setActivities] = useState([]);
    const [activityTypes, setActivityTypes] = useState([]);
    const [calendarActivities, setCalendarActivities] = useState([]);
    const [outsideActivities, setOutsideActivities] = useState([]);

    const fetchActivities = async () => {
        try {
            const response = await axios.get(activitiesBaseUrl);
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
        }
    };

    const fetchActivityTypes = async () => {
        try {
            const response = await axios.get(activityTypesBaseUrl);
            setActivityTypes(response.data);
        } catch (error) {
            console.error("Error fetching activity types:", error);
        }
    };

    const updateActivity = async (activityId, updates) => {
        try {
            const activity = activities.find((act) => act.id === activityId);

            if (!activity) {
                throw new Error(`Activity with ID ${activityId} not found.`);
            }

            const updatedActivity = { ...activity, ...updates };

            await axios.put(`${activitiesBaseUrl}/${activityId}`, updatedActivity);

            fetchActivities();
        } catch (error) {
            console.error("Error updating activity:", error);
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

    useEffect(() => {
        fetchActivities();
        fetchActivityTypes();
    }, []);

    // Memoize the value object to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ({
            activities,
            activityTypes,
            calendarActivities,
            outsideActivities,
            fetchActivities,
            fetchActivityTypes,
            updateActivity,
            moveActivityToCalendar,
            removeActivityFromCalendar,
            getActivityTypeID,
            getActivityType,
            setCalendarActivities,
            setOutsideActivities,
        }),
        [
            activities,
            activityTypes,
            calendarActivities,
            outsideActivities,
        ] // Dependencies
    );

    return (
        <ActivitiesContext.Provider value={contextValue}>
            {children}
        </ActivitiesContext.Provider>
    );
};

// Add PropTypes validation for the `children` prop
ActivitiesProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useActivities = () => useContext(ActivitiesContext);