import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { baseUrl } from "../consts";
import { axiosWithAuth } from "../utils/axiosWithAuth";
import { useKeycloak } from "@react-keycloak/web";

const PluginsContext = createContext();

export const PluginsProvider = ({ children }) => {
    const pluginsBaseUrl = `${baseUrl}/plugins`;
    const pluginsConfigBaseUrl = `${baseUrl}/ui/plugin-config`;
    const settingsBaseUrl = `${baseUrl}/plugins/settings`;
    const submitSettingsBaseUrl = `${baseUrl}/plugins/submit-settings`;
    const { keycloak } = useKeycloak();

    const [plugins, setPlugins] = useState([]);
    const [pluginsConfig, setPluginsConfig] = useState([]);
    const [pluginSettings, setPluginSettings] = useState({});

    // Fetch plugins
    const fetchPlugins = async () => {
        try {
            const response = await axiosWithAuth(keycloak).get(`${pluginsBaseUrl}/`);
            setPlugins(response.data);
        } catch (error) {
            console.error("Error fetching plugins:", error);
        }
    };

    // Fetch plugin configurations
    const fetchPluginsConfig = async () => {
        try {
            const response = await axiosWithAuth(keycloak).get(`${pluginsConfigBaseUrl}/`);
            setPluginsConfig(response.data);
        } catch (error) {
            console.error("Error fetching plugin configurations:", error);
        }
    };

    // Toggle plugin (load/unload)
    const togglePlugin = async (plugin) => {
        const endpoint = plugin.is_loaded ? `${pluginsBaseUrl}/unload` : `${pluginsBaseUrl}/load`;

        try {
            await axiosWithAuth(keycloak).post(endpoint, { plugin_name: plugin.title });
            // Update the local state
            setPlugins(prevPlugins =>
                prevPlugins.map(p =>
                    p.title === plugin.title ? {
                        ...p,
                        is_loaded: !p.is_loaded
                    } : p
                )
            );
        } catch (error) {
            console.error(`Error ${plugin.is_loaded ? "unloading" : "loading"} plugin ${plugin.name}:`, error);
        }
    };

    const fetchPluginSettings = useCallback(async (pluginTitle) => {
        if (!pluginTitle) return null;
        
        try {
            const response = await axiosWithAuth(keycloak).get(`${settingsBaseUrl}/${pluginTitle}`);
            const settingsData = response.data;
            
            // Update the plugin settings state
            setPluginSettings(prev => ({
                ...prev,
                [pluginTitle]: settingsData
            }));
            
            return settingsData;
        } catch (error) {
            console.error(`Error fetching settings for plugin ${pluginTitle}:`, error);
            return null;
        }
    }, [keycloak, settingsBaseUrl]);

    const submitPluginSettings = useCallback(async (pluginTitle, settings) => {
        try {
            const response = await axiosWithAuth(keycloak).post(`${submitSettingsBaseUrl}/${pluginTitle}`, {
                settings: settings,
            });
            
            setPluginSettings(prev => ({
                ...prev,
                [pluginTitle]: settings
            }));
            
            await Promise.all([fetchPlugins(), fetchPluginsConfig()]);
            
            return response.data;
        } catch (error) {
            console.error(`Error submitting settings for plugin ${pluginTitle}:`, error);
            throw error;
        }
    }, [keycloak, submitSettingsBaseUrl, fetchPlugins, fetchPluginsConfig]);

    const processPluginFormData = useCallback((formData) => {
        const formEntries = Array.from(formData.entries());
        const newSettings = {};
        const checkboxGroups = {};
        
        formEntries.forEach(([key, value]) => {
            // Handle checkbox arrays
            const checkboxMatch = key.match(/^(.+)\[(\d+)\]$/);
            if (checkboxMatch) {
                const baseKey = checkboxMatch[1];
                if (!checkboxGroups[baseKey]) {
                    checkboxGroups[baseKey] = [];
                }
                checkboxGroups[baseKey].push(value);
                return;
            }
            
            // Handle toggle values (convert string "true"/"false" to boolean)
            if (value === "true" || value === "false") {
                newSettings[key] = value === "true";
                return;
            }
            
            // Regular inputs
            newSettings[key] = value;
        });
        
        // Merge checkbox groups into settings
        Object.entries(checkboxGroups).forEach(([key, values]) => {
            newSettings[key] = values;
        });
        
        return newSettings;
    }, []);

    useEffect(() => {
        if (keycloak?.authenticated) {
            fetchPlugins();
            fetchPluginsConfig();
        }
    }, [keycloak?.authenticated]);

    // Memoize the context value
    const contextValue = useMemo(
        () => ({
            plugins,
            pluginsConfig,
            pluginSettings,
            fetchPlugins,
            fetchPluginsConfig,
            togglePlugin,
            fetchPluginSettings,
            submitPluginSettings,
            processPluginFormData
        }),
        [plugins, pluginsConfig, pluginSettings]
    );

    return (
        <PluginsContext.Provider value={contextValue}>
            {children}
        </PluginsContext.Provider>
    );
};

PluginsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const usePlugins = () => useContext(PluginsContext);