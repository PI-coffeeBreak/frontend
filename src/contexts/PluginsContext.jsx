import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { baseUrl } from "../consts";
import { useKeycloak } from "@react-keycloak/web";

const PluginsContext = createContext();

export const PluginsProvider = ({ children }) => {
    const pluginsBaseUrl = `${baseUrl}/plugins`;
    const pluginsConfigBaseUrl = `${baseUrl}/ui/plugin-config`;
    const { keycloak } = useKeycloak();

    const [plugins, setPlugins] = useState([]);
    const [pluginsConfig, setPluginsConfig] = useState([]);

    // Configure axios with authentication header
    const axiosWithAuth = () => {
        const token = keycloak?.token;
        return axios.create({
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
            },
        });
    };

    // Fetch plugins
    const fetchPlugins = async () => {
        try {
            const response = await axiosWithAuth().get(pluginsBaseUrl);
            setPlugins(response.data);
        } catch (error) {
            console.error("Error fetching plugins:", error);
        }
    };

    // Fetch plugin configurations
    const fetchPluginsConfig = async () => {
        try {
            const response = await axiosWithAuth().get(pluginsConfigBaseUrl);
            setPluginsConfig(response.data);
        } catch (error) {
            console.error("Error fetching plugin configurations:", error);
        }
    };

    // Toggle plugin (load/unload)
    const togglePlugin = async (plugin) => {
        const endpoint = plugin.is_loaded ? `${pluginsBaseUrl}/unload` : `${pluginsBaseUrl}/load`;

        try {
            await axiosWithAuth().post(endpoint, { plugin_name: plugin.name });

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