import React, { createContext, useContext, useState, useEffect } from "react";
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
            // Find the activity to update
            const activity = activities.find((act) => act.id === activityId);

            if (!activity) {
                throw new Error(`Activity with ID ${activityId} not found.`);
            }

            // Merge the updates into the full activity object
            const updatedActivity = { ...activity, ...updates };

            // Send the full activity object in the PUT request
            const response = await axios.put(`${activitiesBaseUrl}/${activityId}`, updatedActivity);

            // Refresh activities after a successful update
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

        for (let i = 0; i < activityTypes.length; i++) {
            if (activityTypes[i].type.toLowerCase() === normalizedType) {
                return activityTypes[i].id;
            }
        }

        return "Type not found";
    };

    const getActivityType = (typeId) => {
        for (let i = 0; i < activityTypes.length; i++) {
            if (activityTypes[i].id === typeId) {
                return activityTypes[i].type;
            }
        }

        return "Type not found";
    };

    useEffect(() => {
        fetchActivities();
        fetchActivityTypes();
    }, []);

    return (
        <ActivitiesContext.Provider
            value={{
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
            }}
        >
            {children}
        </ActivitiesContext.Provider>
    );
};

export const useActivities = () => useContext(ActivitiesContext);