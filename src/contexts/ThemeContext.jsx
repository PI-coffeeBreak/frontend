import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../consts";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const colorThemeBaseUrl = `${baseUrl}/ui/color-theme/color-theme`;

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
            const response = await axios.get(colorThemeBaseUrl);

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
            console.log("CSS variables updated with theme colors.");
        } catch (error) {
            console.error("Error fetching theme colors:", error);
        }
    };

    // Update theme colors on the server
    const updateThemeColors = async (newTheme) => {
        try {
            console.log("Updating theme colors on the server:", newTheme);

            const transformedTheme = Object.keys(newTheme).reduce((acc, key) => {
                const newKey = key.replace(/-/g, "_"); // Convert hyphens to underscores
                acc[newKey] = newTheme[key];
                return acc;
            }, {});

            const response = await axios.put(colorThemeBaseUrl, transformedTheme);
            console.log("Server response after updating theme colors:", response.data);

            const updatedTheme = Object.keys(response.data).reduce((acc, key) => {
                const newKey = key.replace(/_/g, "-"); // Convert underscores to hyphens
                acc[newKey] = response.data[key];
                return acc;
            }, {});
            console.log("Updated theme colors from server:", updatedTheme);

            setTheme(updatedTheme);

            // Apply the updated theme to CSS variables
            Object.keys(updatedTheme).forEach((key) => {
                document.documentElement.style.setProperty(`--color-${key}`, updatedTheme[key]);
            });
            console.log("CSS variables updated with new theme colors.");
        } catch (error) {
            console.error("Error updating theme colors:", error);
        }
    };

    useEffect(() => {
        fetchThemeColors();
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, fetchThemeColors, updateThemeColors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);