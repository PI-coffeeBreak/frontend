import React, { createContext, useContext, useState, useEffect } from "react";
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

    useEffect(() => {
        fetchComponents();
    }, []);

    return (
        <ComponentsContext.Provider value={{ components, isLoading, error }}>
            {children}
        </ComponentsContext.Provider>
    );
};

export const useComponents = () => useContext(ComponentsContext);