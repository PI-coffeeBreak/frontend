import React, { createContext, useContext, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useKeycloak } from "@react-keycloak/web";
import { baseUrl } from "../consts";
import axiosWithAuth from "../utils/axiosWithAuth";

const PagesContext = createContext();

export const PagesProvider = ({ children }) => {
    const [pages, setPages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { keycloak } = useKeycloak();

    // Method to fetch pages from the server
    const getPages = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosWithAuth(keycloak).get(`${baseUrl}/pages/all`);
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
            const api = axiosWithAuth(keycloak);
            const response = await api.post(`${baseUrl}/pages`, pageData);
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
            const response = await axiosWithAuth(keycloak).put(`${baseUrl}/pages/${pageId}`, updatedData);
            setPages((prevPages) =>
                prevPages.map((page) => (page.page_id === pageId ? response.data : page))
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
            const api = axiosWithAuth(keycloak);
            await api.delete(`${baseUrl}/pages/${pageId}`);
            setPages((prevPages) => prevPages.filter((page) => page.page_id !== pageId));
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
            const api = axiosWithAuth(keycloak);
            const response = await api.patch(`${baseUrl}/pages/${pageId}`, { enabled: isEnabled });
            setPages((prevPages) =>
                prevPages.map((page) =>
                    page.page_id === pageId ? { ...page, enabled: response.data.enabled } : page
                )
            );
            return response.data;
        } catch (err) {
            console.error("Error updating page enabled state:", err);
            setError("Failed to update page. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const findPageIdByTitle = (title) => {
        const page = pages.find((p) => p.title === title);
        return page ? page.page_id : null;
    };

    const getPageNames = () => {
        return pages.map((page) => page.title);
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
            getPageNames,
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