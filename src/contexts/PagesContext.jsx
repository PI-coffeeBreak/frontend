import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { baseUrl } from "../consts";

const PagesContext = createContext();

export const PagesProvider = ({ children }) => {
    const [pages, setPages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const savePage = async (pageData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${baseUrl}/pages`, pageData);
            console.log("Page saved successfully:", response.data);
            setPages((prevPages) => [...prevPages, response.data]);
        } catch (err) {
            console.error("Error saving page:", err);
            setError("Failed to save page. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PagesContext.Provider value={{ pages, savePage, isLoading, error }}>
            {children}
        </PagesContext.Provider>
    );
};

export const usePages = () => useContext(PagesContext);