import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { baseUrl } from "../consts";
import { axiosWithAuth } from "../utils/axiosWithAuth";
import { useKeycloak } from "@react-keycloak/web";

const PluginsContext = createContext();

// Format plugin name: replace - and _ with spaces and capitalize first letter of each word
const formatPluginName = (name) => {
    return name
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export const PluginsProvider = ({ children }) => {
    const pluginsBaseUrl = `${baseUrl}/plugins`;
    const pluginsConfigBaseUrl = `${baseUrl}/ui/plugin-config`;
    const { keycloak } = useKeycloak();

    const [plugins, setPlugins] = useState([]);
    const [pluginsConfig, setPluginsConfig] = useState([]);

    // Fetch plugins
    const fetchPlugins = async () => {
        try {
            const response = await axiosWithAuth(keycloak).get(pluginsBaseUrl);
            const formattedPlugins = response.data.map(plugin => ({
                ...plugin,
                formatted_name: formatPluginName(plugin.name)
            }));
            setPlugins(formattedPlugins);
        } catch (error) {
            console.error("Error fetching plugins:", error);
        }
    };

    // Fetch plugin configurations
    const fetchPluginsConfig = async () => {
        try {
            const response = await axiosWithAuth(keycloak).get(pluginsConfigBaseUrl);
            setPluginsConfig(response.data);
        } catch (error) {
            console.error("Error fetching plugin configurations:", error);
        }
    };

    // Toggle plugin (load/unload)
    const togglePlugin = async (plugin) => {
        const endpoint = plugin.is_loaded ? `${pluginsBaseUrl}/unload` : `${pluginsBaseUrl}/load`;

        try {
            await axiosWithAuth(keycloak).post(endpoint, { plugin_name: plugin.name });

            // Update the local state
            setPlugins((prevPlugins) =>
                prevPlugins.map((p) =>
                    p.name === plugin.name ? {
                        ...p,
                        is_loaded: !p.is_loaded,
                        formatted_name: formatPluginName(p.name)
                    } : p
                )
            );

            console.log(`Plugin ${plugin.formatted_name} ${plugin.is_loaded ? "unloaded" : "loaded"} successfully.`);
        } catch (error) {
            console.error(`Error ${plugin.is_loaded ? "unloading" : "loading"} plugin ${plugin.formatted_name}:`, error);
        }
    };

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
            fetchPlugins,
            fetchPluginsConfig,
            togglePlugin,
        }),
        [plugins, pluginsConfig]
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