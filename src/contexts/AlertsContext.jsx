import React, { createContext, useContext, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useKeycloak } from "@react-keycloak/web";
import { baseUrl } from "../consts";
import { axiosWithAuth } from "../utils/axiosWithAuth";

const AlertsContext = createContext();

export const AlertsProvider = ({ children }) => {
    const alertsBaseUrl = `${baseUrl}/alert-system-plugin`;
    const { keycloak } = useKeycloak();
    
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get all alert templates
    const getAlertTemplates = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosWithAuth(keycloak).get(`${alertsBaseUrl}/template/`);
            setTemplates(response.data);
            return response.data;
        } catch (err) {
            setError("Failed to fetch alert templates. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Get a specific template by ID
    const getAlertTemplate = async (templateId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosWithAuth(keycloak).get(`${alertsBaseUrl}/template/${templateId}`);
            return response.data;
        } catch (err) {
            console.error(`Error fetching alert template with ID ${templateId}:`, err);
            setError("Failed to fetch alert template. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Create a new alert template
    const createAlertTemplate = async (templateData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosWithAuth(keycloak).post(`${alertsBaseUrl}/template/`, templateData);
            setTemplates(prevTemplates => [...prevTemplates, response.data]);
            return response.data;
        } catch (err) {
            console.error("Error creating alert template:", err);
            setError("Failed to create alert template. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Create a new alert
    const createAlert = async (alertData) => {
        setIsLoading(true);
        setError(null);
        try {
            // Based on swagger docs, we need to format the data properly
            const formattedData = {
                message: alertData.message,
                high_priority: alertData.priority === "High"
            };

            const response = await axiosWithAuth(keycloak).post(`${alertsBaseUrl}/alert/`, formattedData);

            return response.data;
        } catch (err) {
            console.error("Error creating alert:", err);
            setError("Failed to create alert. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Update an existing alert template
    const updateAlertTemplate = async (templateId, templateData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosWithAuth(keycloak).put(`${alertsBaseUrl}/template/${templateId}`, templateData);
            
            setTemplates(prevTemplates => 
                prevTemplates.map(template => 
                    template.id === templateId ? response.data : template
                )
            );
            
            return response.data;
        } catch (err) {
            console.error(`Error updating alert template with ID ${templateId}:`, err);
            setError("Failed to update alert template. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Delete an alert template
    const deleteAlertTemplate = async (templateId) => {
        setIsLoading(true);
        setError(null);
        try {
            await axiosWithAuth(keycloak).delete(`${alertsBaseUrl}/template/${templateId}`);
            
            setTemplates(prevTemplates => 
                prevTemplates.filter(template => template.id !== templateId)
            );
            
            return true;
        } catch (err) {
            console.error(`Error deleting alert template with ID ${templateId}:`, err);
            setError("Failed to delete alert template. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const contextValue = useMemo(() => ({
        templates,
        isLoading,
        error,
        getAlertTemplates,
        getAlertTemplate,
        createAlertTemplate,
        updateAlertTemplate,
        deleteAlertTemplate,
        createAlert
    }), [templates, isLoading, error]);

    return (
        <AlertsContext.Provider value={contextValue}>
            {children}
        </AlertsContext.Provider>
    );
};

AlertsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAlerts = () => useContext(AlertsContext); 