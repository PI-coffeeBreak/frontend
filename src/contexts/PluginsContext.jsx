import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../consts";

const PluginsContext = createContext();

export const PluginsProvider = ({ children }) => {
    const pluginsBaseUrl = `${baseUrl}/plugins`;
    const pluginsConfigBaseUrl = `${baseUrl}/ui/plugin-config`;

    const [plugins, setPlugins] = useState([]);
    const [pluginsConfig, setPluginsConfig] = useState([]);

    // Fetch plugins
    const fetchPlugins = async () => {
        try {
            const response = await axios.get(pluginsBaseUrl);
            setPlugins(response.data);
        } catch (error) {
            console.error("Error fetching plugins:", error);
        }
    };

    // Fetch plugin configurations
    const fetchPluginsConfig = async () => {
        try {
            const response = await axios.get(pluginsConfigBaseUrl);
            setPluginsConfig(response.data);
        } catch (error) {
            console.error("Error fetching plugin configurations:", error);
        }
    };

    // Toggle plugin (load/unload)
    const togglePlugin = async (plugin) => {
        const endpoint = plugin.is_loaded ? `${pluginsBaseUrl}/unload` : `${pluginsBaseUrl}/load`;

        try {
            await axios.post(endpoint, { plugin_name: plugin.name });

            // Update the local state
            setPlugins((prevPlugins) =>
                prevPlugins.map((p) =>
                    p.name === plugin.name ? { ...p, is_loaded: !p.is_loaded } : p
                )
            );

            console.log(`Plugin ${plugin.name} ${plugin.is_loaded ? "unloaded" : "loaded"} successfully.`);
        } catch (error) {
            console.error(`Error ${plugin.is_loaded ? "unloading" : "loading"} plugin ${plugin.name}:`, error);
        }
    };

    useEffect(() => {
        fetchPlugins();
        fetchPluginsConfig();
    }, []);

    return (
        <PluginsContext.Provider
            value={{
                plugins,
                pluginsConfig,
                fetchPlugins,
                fetchPluginsConfig,
                togglePlugin,
            }}
        >
            {children}
        </PluginsContext.Provider>
    );
};

export const usePlugins = () => useContext(PluginsContext);