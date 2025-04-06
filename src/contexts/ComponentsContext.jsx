import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { baseUrl } from "../consts";

const ComponentsContext = createContext();

export const ComponentsProvider = ({ children }) => {
    const [components, setComponents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchComponents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseUrl}/components/components`);
            const componentsData = response.data.components;
            console.log("Components fetched successfully:", componentsData);
            setComponents(componentsData);
        } catch (err) {
            console.error("Error fetching components:", err);
            setError("Failed to fetch components. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    // Function to return a simplified list of components
    const getComponentList = () => {
        const componentList = Object.keys(components).map((key) => {
            const { title, description, properties } = components[key];
            return {
                name: key,
                title: title || key,
                description: description || "No description available",
                properties: Object.keys(properties)
                    .filter((propKey) => propKey !== "name" && propKey !== "component_id") // Exclude name and component_id
                    .map((propKey) => ({
                        name: propKey,
                        ...properties[propKey],
                    })),
            };
        });

        console.log("Simplified Component List:", componentList);
        return componentList;
    };

    useEffect(() => {
        fetchComponents();
    }, []);

    // Memoize the value object to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ({
            components,
            isLoading,
            error,
            getComponentList,
        }),
        [components, isLoading, error] // Dependencies
    );

    return (
        <ComponentsContext.Provider value={contextValue}>
            {children}
        </ComponentsContext.Provider>
    );
};

// Add PropTypes validation for the `children` prop
ComponentsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useComponents = () => useContext(ComponentsContext);