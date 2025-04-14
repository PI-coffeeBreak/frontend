import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { baseUrl } from "../consts";

// Import all icon libraries
import * as Fa from "react-icons/fa";
import * as Fi from "react-icons/fi";
import * as Ai from "react-icons/ai";
import * as Bi from "react-icons/bi";
import * as Bs from "react-icons/bs";
import * as Ci from "react-icons/ci";
import * as Di from "react-icons/di";
import * as Gi from "react-icons/gi";
import * as Go from "react-icons/go";
import * as Hi from "react-icons/hi";
import * as Im from "react-icons/im";
import * as Io from "react-icons/io";
import * as Io5 from "react-icons/io5";
import * as Md from "react-icons/md";
import * as Ri from "react-icons/ri";
import * as Si from "react-icons/si";
import * as Ti from "react-icons/ti";
import * as Wi from "react-icons/wi";

import { axiosWithAuth } from "../utils/axiosWithAuth";
import { useKeycloak } from "@react-keycloak/web";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
    const menuBaseUrl = `${baseUrl}/ui/menu`;

    const { keycloak } = useKeycloak();

    const [menuOptions, setMenuOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getIconComponent = (iconName) => {
        if (!iconName) return Fa.FaQuestion;

        // 1. Try direct lookup first (most efficient)
        // Go through each icon library and check if the icon exists
        const allLibraries = { Fa, Fi, Ai, Bi, Bs, Ci, Di, Gi, Go, Hi, Im, Io, Io5, Md, Ri, Si, Ti, Wi };

        for (const [, library] of Object.entries(allLibraries)) {
            if (library[iconName]) {
                return library[iconName];
            }
        }

        // 2. If direct lookup fails, try to parse the icon name
        const commonPrefixes = ['Fa', 'Fi', 'Ai', 'Bi', 'Bs', 'Ci', 'Di', 'Gi', 'Go', 'Hi', 'Im', 'Io', 'Io5', 'Md', 'Ri', 'Si', 'Ti', 'Wi'];

        // Find the matching prefix (if any)
        let matchedPrefix = null;
        for (const prefix of commonPrefixes) {
            if (iconName.startsWith(prefix)) {
                matchedPrefix = prefix;
                break;
            }
        }

        if (!matchedPrefix) {
            console.warn(`Could not determine icon library prefix for "${iconName}", using fallback`);
            return Fa.FaQuestion;
        }

        const library = allLibraries[matchedPrefix];

        // 3. Try some common variations
        const variations = [
            iconName,
            `${matchedPrefix}${iconName.substring(matchedPrefix.length)}`,
            `${matchedPrefix}${iconName.substring(matchedPrefix.length).charAt(0).toUpperCase()}${iconName.substring(matchedPrefix.length + 1)}`
        ];

        for (const variation of variations) {
            if (library[variation]) {
                return library[variation];
            }
        }

        // 4. As a last resort, try fuzzy matching
        const iconNameLower = iconName.toLowerCase();
        const libraryKeys = Object.keys(library);

        // Try to find a close match
        const similarIcons = libraryKeys.filter(key =>
            key.toLowerCase().includes(iconNameLower.substring(matchedPrefix.length))
        );

        if (similarIcons.length > 0) {
            // Use the first match
            return library[similarIcons[0]];
        }

        // If all else fails, return fallback
        console.warn(`Icon "${iconName}" not found in any library variation, using fallback.`);
        return Fa.FaQuestion;
    };

    const getMenuOptions = async () => {
        setIsLoading(true);
        setError(null);
        console.log("Starting to fetch menu options...");
        try {
            const response = await axiosWithAuth(keycloak).get(`${menuBaseUrl}/`);
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
            const response = await axiosWithAuth(keycloak).post(`${menuBaseUrl}/option`, optionData);
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
            const response = await axiosWithAuth(keycloak).put(`${menuBaseUrl}/option/${optionId}`, updatedData);
            console.log(`Menu option with ID ${optionId} updated successfully:`, response.data);

            // Create a completely new array with the updated option
            setMenuOptions(prevOptions => {
                if (!prevOptions || !Array.isArray(prevOptions)) return [];

                return prevOptions.map(option => {
                    if (option.id === optionId) {
                        // Return a completely new object
                        const updatedOption = { ...option, ...updatedData };
                        console.log("Updated option in state:", updatedOption);
                        return updatedOption;
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
            await axiosWithAuth(keycloak).delete(`${menuBaseUrl}/option/${optionId}`);
            console.log(`Menu option with ID ${optionId} deleted successfully.`);

            // Create a completely new array without the deleted option
            setMenuOptions(prevOptions => {
                if (!prevOptions || !Array.isArray(prevOptions)) return [];
                const filteredOptions = prevOptions.filter(option => option.id !== optionId);
                console.log("Filtered options after deletion:", filteredOptions);
                return filteredOptions;
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
            console.log("Sending reordered options to API:", reorderedOptions);
            const response = await axiosWithAuth(keycloak).put(`${menuBaseUrl}/options`, reorderedOptions);
            console.log("Menu options order updated successfully:", response.data);

            // Update the local state with the reordered menu options
            console.log("Setting new order in state:", reorderedOptions);
            setMenuOptions(reorderedOptions);

            return response.data;
        } catch (err) {
            console.error("Error updating menu options order:", err);
            console.error("Error details:", err.response?.data || err.message);
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

    // Get all available icons from all libraries
    const getAllAvailableIcons = () => {
        const iconsByLibrary = {
            // Font Awesome icons
            'Fa': Object.keys(Fa).filter(key => key.startsWith('Fa')),

            // Feather icons
            'Fi': Object.keys(Fi).filter(key => key.startsWith('Fi')),

            // Ant Design icons
            'Ai': Object.keys(Ai).filter(key => key.startsWith('Ai')),

            // Bootstrap icons
            'Bi': Object.keys(Bi).filter(key => key.startsWith('Bi')),
            'Bs': Object.keys(Bs).filter(key => key.startsWith('Bs')),

            // Circum icons
            'Ci': Object.keys(Ci).filter(key => key.startsWith('Ci')),

            // Devicons
            'Di': Object.keys(Di).filter(key => key.startsWith('Di')),

            // Game icons
            'Gi': Object.keys(Gi).filter(key => key.startsWith('Gi')),

            // Github Octicons
            'Go': Object.keys(Go).filter(key => key.startsWith('Go')),

            // Heroicons
            'Hi': Object.keys(Hi).filter(key => key.startsWith('Hi')),

            // Remix icon
            'Ri': Object.keys(Ri).filter(key => key.startsWith('Ri')),

            // Material Design icons
            'Md': Object.keys(Md).filter(key => key.startsWith('Md')),

            // Ionicons 
            'Io': Object.keys(Io).filter(key => key.startsWith('Io')),
            'Io5': Object.keys(Io5).filter(key => key.startsWith('Io5')),

            // Simple Icons
            'Si': Object.keys(Si).filter(key => key.startsWith('Si')),

            // Typicons
            'Ti': Object.keys(Ti).filter(key => key.startsWith('Ti')),

            // Weather Icons
            'Wi': Object.keys(Wi).filter(key => key.startsWith('Wi')),
        };

        return iconsByLibrary;
    };

    const commonIcons = [
        // Font Awesome icons - widely supported and popular
        "FaHome", "FaUser", "FaBook", "FaCalendar", "FaCog", "FaBell",
        "FaEnvelope", "FaSearch", "FaShoppingCart", "FaHeart", "FaStar",
        "FaChartBar", "FaListUl", "FaFileAlt", "FaLink", "FaQuestion",
        "FaImage", "FaVideo", "FaMusic", "FaGamepad", "FaMap", "FaArrowRight",
        "FaCheckCircle", "FaExclamationCircle", "FaInfoCircle", "FaTimes",
        "FaPlus", "FaMinus", "FaPen", "FaTrash", "FaShare", "FaDownload",
        "FaUpload", "FaClock", "FaCode", "FaPaperPlane", "FaBuilding",

        // Material Design - also widely supported
        "MdDashboard", "MdSettings", "MdNotifications", "MdPeople",
        "MdHome", "MdMenu", "MdLock", "MdPerson", "MdMail", "MdPhone",

        // Simple outline icons from Ant Design
        "AiOutlineTeam", "AiOutlineProject", "AiOutlineFileSearch",
        "AiOutlineUser", "AiOutlineSetting", "AiOutlineHome"
    ];

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
            getIconComponent,
            getAllAvailableIcons,
            commonIcons
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