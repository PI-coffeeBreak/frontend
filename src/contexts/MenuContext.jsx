import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { baseUrl } from "../consts";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
    const menuBaseUrl = `${baseUrl}/ui/menu`;
    
    const [menuOptions, setMenuOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch main menu
    const getMenuOptions = async () => {
        setIsLoading(true);
        setError(null);
        console.log("Starting to fetch menu options...");
        try {
            const response = await axios.get(`${menuBaseUrl}/`);
            console.log("Menu API response:", response.data);
            
            // Handle different response structures
            let options = [];
            if (response.data.options && Array.isArray(response.data.options)) {
                // If API returns { options: [...] }
                options = response.data.options;
                console.log("Extracted options from response.data.options:", options);
            } else if (Array.isArray(response.data)) {
                // If API returns direct array
                options = response.data;
                console.log("Using direct array from response.data:", options);
            } else {
                console.warn("Unexpected menu data format:", response.data);
                options = []; // Fallback to empty array
            }
            
            console.log("Setting menuOptions state to:", options);
            setMenuOptions(options);
            return options;
        } catch (err) {
            console.error("Error fetching menu options:", err);
            setError("Failed to fetch menu options. Please try again.");
            setMenuOptions([]); // Set to empty array on error
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Add a new menu option
    const addMenuOption = async (optionData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${menuBaseUrl}/option`, optionData);
            console.log("Menu option added successfully:", response.data);
            
            // Create a completely new array for state update
            const newOption = response.data;
            setMenuOptions(prevOptions => [...(prevOptions || []), newOption]);
            
            return response.data;
        } catch (err) {
            console.error("Error adding menu option:", err);
            setError("Failed to add menu option. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Update an existing menu option
    const updateMenuOption = async (optionId, updatedData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${menuBaseUrl}/option/${optionId}`, updatedData);
            
            // Create a completely new array with the updated option
            setMenuOptions(prevOptions => {
                if (!prevOptions || !Array.isArray(prevOptions)) return [];
                
                return prevOptions.map(option => {
                    if (option.id === optionId) {
                        // Return a completely new object
                        return { ...option, ...updatedData };
                    }
                    return option;
                });
            });
            
            return response.data;
        } catch (err) {
            console.error(`Error updating menu option with ID ${optionId}:`, err);
            setError("Failed to update menu option. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Delete a menu option
    const deleteMenuOption = async (optionId) => {
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`${menuBaseUrl}/option/${optionId}`);
            console.log(`Menu option with ID ${optionId} deleted successfully.`);
            
            // Create a completely new array without the deleted option
            setMenuOptions(prevOptions => {
                if (!prevOptions || !Array.isArray(prevOptions)) return [];
                return prevOptions.filter(option => option.id !== optionId);
            });
            
            return true;
        } catch (err) {
            console.error(`Error deleting menu option with ID ${optionId}:`, err);
            setError("Failed to delete menu option. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Update menu options order
    const updateMenuOptionsOrder = async (reorderedOptions) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log("Reordered options:", reorderedOptions);
            const response = await axios.put(`${menuBaseUrl}/options`, reorderedOptions);
            console.log("Menu options order updated successfully:", response.data);
            
            // Update the local state with the reordered menu options
            setMenuOptions(reorderedOptions);
            
            return response.data;
        } catch (err) {
            console.error("Error updating menu options order:", err);
            setError("Failed to update menu options order. Please try again.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize by fetching the menu options
    useEffect(() => {
        getMenuOptions();
    }, []);

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ({
            menuOptions,
            isLoading,
            error,
            getMenuOptions,
            addMenuOption,
            updateMenuOption,
            deleteMenuOption,
            updateMenuOptionsOrder,
        }),
        [menuOptions, isLoading, error]
    );

    return (
        <MenuContext.Provider value={contextValue}>
            {children}
        </MenuContext.Provider>
    );
};

MenuProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useMenus = () => useContext(MenuContext);