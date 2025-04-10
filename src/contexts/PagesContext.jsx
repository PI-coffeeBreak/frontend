import React, { createContext, useContext, useState, useMemo } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { baseUrl } from "../consts";

const PagesContext = createContext();

export const PagesProvider = ({ children }) => {
    const [pages, setPages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Method to fetch pages from the server
    const getPages = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseUrl}/pages`);
            console.log("Pages fetched successfully:", response.data);
            setPages(response.data);
            return response.data;
        } catch (err) {
            console.error("Error fetching pages:", err);
            setError("Failed to fetch pages. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const savePage = async (pageData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${baseUrl}/pages`, pageData);
            console.log("Page saved successfully:", response.data);
            setPages((prevPages) => [...prevPages, response.data]);
            return response.data;
        } catch (err) {
            console.error("Error saving page:", err);
            setError("Failed to save page. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    
    const updatePage = async (pageId, updatedData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${baseUrl}/pages/${pageId}`, updatedData);
            console.log("Page updated successfully:", response.data);
            setPages((prevPages) =>
                prevPages.map((page) => (page.id === pageId ? response.data : page))
            );
            return response.data;
        } catch (err) {
            console.error("Error updating page:", err);
            setError("Failed to update page. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deletePage = async (pageId) => {
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`${baseUrl}/pages/${pageId}`);
            setPages((prevPages) => prevPages.filter((page) => page.id !== pageId));
            console.log(`Page with ID ${pageId} deleted successfully.`);
            return true;
        } catch (err) {
            console.error("Error deleting page:", err);
            setError("Failed to delete page. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const togglePageEnabled = async (pageId, isEnabled) => {
        setIsLoading(true);
        setError(null);
        try {
            // implement when backend is ready
            // const response = await axios.patch(`${baseUrl}/pages/${pageId}`, { enabled: isEnabled });
            console.log(`Page with ID ${pageId} updated successfully:`, response.data);
            // setPages((prevPages) =>
            //     prevPages.map((page) =>
            //         page.id === pageId ? { ...page, enabled: response.data.enabled } : page
            //     )
            // );
        } catch (err) {
            console.error("Error updating page enabled state:", err);
            setError("Failed to update page. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const findPageIdByTitle = (title) => {
        const page = pages.find((p) => p.title === title);
        console.log("Page ID found:", page ? page.id : "not found");
        return page ? page.id : null;
    };

    // Memoize the context value
    const contextValue = useMemo(
        () => ({
            pages,
            getPages,
            savePage,
            updatePage,
            deletePage,
            togglePageEnabled,
            findPageIdByTitle,
            isLoading,
            error,
        }),
        [pages, isLoading, error]
    );

    return (
        <PagesContext.Provider value={contextValue}>
            {children}
        </PagesContext.Provider>
    );
};

PagesProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const usePages = () => useContext(PagesContext);