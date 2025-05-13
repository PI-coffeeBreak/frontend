import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { baseUrl } from "../consts";
import { useKeycloak } from "@react-keycloak/web";
import { axiosWithAuth } from '../utils/axiosWithAuth';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const colorThemeBaseUrl = `${baseUrl}/ui/color-theme/color-theme`;
    const { keycloak } = useKeycloak();

    const initialTheme = {
        "base-100": "#f3faff",
        "base-200": "#d6d6d3",
        "base-300": "#d6d6d3",
        "base-content": "#726d65",
        "primary": "#4f2b1d",
        "primary-content": "#f3faff",
        "secondary": "#c6baa2",
        "secondary-content": "#f1fbfb",
        "accent": "#faa275",
        "accent-content": "#f3fbf6",
        "neutral": "#caa751",
        "neutral-content": "#f3faff",
        "info": "#00b2dd",
        "info-content": "#f2fafd",
        "success": "#0cae00",
        "success-content": "#f5faf4",
        "warning": "#fbad00",
        "warning-content": "#221300",
        "error": "#ff1300",
        "error-content": "#fff6f4",
    };

    const [theme, setTheme] = useState(initialTheme);

    // Fetch theme colors from the server
    const fetchThemeColors = async () => {
        try {
            const response = await axiosWithAuth(keycloak).get(colorThemeBaseUrl);

            const transformedTheme = Object.keys(response.data).reduce((acc, key) => {
                const newKey = key.replace(/_/g, "-"); // Convert underscores to hyphens
                acc[newKey] = response.data[key];
                return acc;
            }, {});

            setTheme(transformedTheme);

            // Apply the theme to CSS variables
            Object.keys(transformedTheme).forEach((key) => {
                document.documentElement.style.setProperty(`--color-${key}`, transformedTheme[key]);
            });
        } catch (error) {
            console.error("Error fetching theme colors:", error);
        }
    };

    // Update theme colors on the server
    const updateThemeColors = async (newTheme) => {
        try {

            const transformedTheme = Object.keys(newTheme).reduce((acc, key) => {
                const newKey = key.replace(/-/g, "_"); // Convert hyphens to underscores
                acc[newKey] = newTheme[key];
                return acc;
            }, {});

            const response = await axiosWithAuth(keycloak).put(colorThemeBaseUrl, transformedTheme);

            const updatedTheme = Object.keys(response.data).reduce((acc, key) => {
                const newKey = key.replace(/_/g, "-"); // Convert underscores to hyphens
                acc[newKey] = response.data[key];
                return acc;
            }, {});

            setTheme(updatedTheme);

            // Apply the updated theme to CSS variables
            Object.keys(updatedTheme).forEach((key) => {
                document.documentElement.style.setProperty(`--color-${key}`, updatedTheme[key]);
            });
        } catch (error) {
            console.error("Error updating theme colors:", error);
        }
    };

    useEffect(() => {
        fetchThemeColors();
    }, []);

    // Memoize the context value
    const contextValue = useMemo(
        () => ({
            initialTheme,
            theme,
            setTheme,
            fetchThemeColors,
            updateThemeColors,
        }),
        [theme]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useTheme = () => useContext(ThemeContext);