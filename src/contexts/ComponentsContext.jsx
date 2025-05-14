import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { baseUrl } from "../consts";
import { useKeycloak } from "@react-keycloak/web";
import { axiosWithAuth } from '../utils/axiosWithAuth';
import { useLocation } from "react-router-dom";

const ComponentsContext = createContext();

export const ComponentsProvider = ({ children }) => {
    const [components, setComponents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { keycloak, initialized } = useKeycloak();
    const location = useLocation();

    const shouldRedirectToLogin = () => {
        return location.pathname !== '/';
    };

    const fetchComponents = async () => {
        if (!initialized) {
            console.log("Keycloak not initialized");
            return;
        }

        if (!keycloak?.authenticated && shouldRedirectToLogin()) {
            console.log("User not authenticated, redirecting to login");
            keycloak?.login();
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosWithAuth(keycloak).get(`${baseUrl}/components/`);
            const componentsData = response.data.components;
            setComponents(componentsData);
        } catch (err) {
            console.error("Error fetching components:", err);
            setError("Failed to fetch components. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    // Function to get component schema
    const getComponentSchema = (componentName) => {
        return components[componentName] || null;
    };

    // Function to get default props for a component
    const getDefaultPropsForComponent = (componentName) => {
        const schema = getComponentSchema(componentName);
        if (!schema) return {};

        const defaultProps = { name: componentName };

        // Extract default values from properties
        Object.entries(schema.properties).forEach(([key, prop]) => {
            if (key !== 'name' && key !== 'component_id' && 'default' in prop) {
                defaultProps[key] = prop.default;
            }
        });

        return defaultProps;
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
        return componentList;
    };

    useEffect(() => {
        if (initialized) {
            if (keycloak?.authenticated) {
                fetchComponents();
            } else if (shouldRedirectToLogin()) {
                console.log("User not authenticated, redirecting to login");
                keycloak?.login();
            }
        }
    }, [initialized, keycloak?.authenticated, location.pathname]);

    // Memoize the value object to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ({
            components,
            isLoading,
            error,
            getComponentList,
            getComponentSchema,
            getDefaultPropsForComponent,
        }),
        [components, isLoading, error]
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