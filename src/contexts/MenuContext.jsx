import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { baseUrl } from "../consts";
import { useLocation } from "react-router-dom";

// Import all icon libraries
import * as Ai from "react-icons/ai";
import * as Bi from "react-icons/bi";
import * as Bs from "react-icons/bs";
import * as Ci from "react-icons/ci";
import * as Cg from "react-icons/cg";
import * as Di from "react-icons/di";
import * as Fa from "react-icons/fa";
import * as Fa6 from "react-icons/fa6";
import * as Fi from "react-icons/fi";
import * as Fc from "react-icons/fc";
import * as Gi from "react-icons/gi";
import * as Go from "react-icons/go";
import * as Gr from "react-icons/gr";
import * as Hi from "react-icons/hi";
import * as Hi2 from "react-icons/hi2";
import * as Im from "react-icons/im";
import * as Io from "react-icons/io";
import * as Io5 from "react-icons/io5";
import * as Lia from "react-icons/lia";
import * as Lu from "react-icons/lu";
import * as Md from "react-icons/md";
import * as Pi from "react-icons/pi";
import * as Rx from "react-icons/rx";
import * as Ri from "react-icons/ri";
import * as Si from "react-icons/si";
import * as Sl from "react-icons/sl";
import * as Tb from "react-icons/tb";
import * as Tfi from "react-icons/tfi";
import * as Ti from "react-icons/ti";
import * as Vsc from "react-icons/vsc";
import * as Wi from "react-icons/wi";

import { axiosWithAuth } from "../utils/axiosWithAuth";
import { useKeycloak } from "@react-keycloak/web";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
    const menuBaseUrl = `${baseUrl}/ui/menu`;
    const location = useLocation();
    const { keycloak, initialized } = useKeycloak();

    const [menuOptions, setMenuOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const shouldRedirectToLogin = () => {
        return location.pathname !== '/';
    };

    const getIconComponent = (iconName) => {
        if (iconName.includes('/')) {
            iconName = iconName.split('/')[1];
        }
        if (!iconName) return Fa.FaQuestion;

        // 1. Try direct lookup first (most efficient)
        // Go through each icon library and check if the icon exists
        const allLibraries = { Ai, Bi, Bs, Ci, Cg, Di, Fa, Fa6, Fi, Fc, Gi, Go, Gr, Hi, Hi2, Im, Io, Io5, Lia, Lu, Md, Pi, Rx, Ri, Si, Sl, Tb, Tfi, Ti, Vsc, Wi };

        for (const [, library] of Object.entries(allLibraries)) {
            if (library[iconName]) {
                return library[iconName];
            }
        }

        // 2. If direct lookup fails, try to parse the icon name
        const commonPrefixes = ['Ai', 'Bi', 'Bs', 'Ci', 'Cg', 'Di', 'Fi', 'Fc', 'Fa', 'Fa6', 'Gi', 'Go', 'Gr', 'Hi', 'Hi2', 'Im', 'Io', 'Io5', 'Lia', 'Lu', 'Md', 'Pi', 'Rx', 'Ri', 'Si', 'Sl', 'Tb', 'Tfi', 'Ti', 'Vsc', 'Wi'];

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
            const response = await axiosWithAuth(keycloak).get(`${menuBaseUrl}/`);

            // Handle different response structures
            let options = [];
            if (response.data.options && Array.isArray(response.data.options)) {
                options = response.data.options;
            } else if (Array.isArray(response.data)) {
                options = response.data;
            } else {
                console.warn("Unexpected menu data format:", response.data);
                options = []; // Fallback to empty array
            }

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

    const addMenuOption = async (optionData) => {
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
            const response = await axiosWithAuth(keycloak).post(`${menuBaseUrl}/option/`, optionData);

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

    const updateMenuOption = async (optionId, updatedData) => {
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
            const response = await axiosWithAuth(keycloak).put(`${menuBaseUrl}/option/${optionId}`, updatedData);

            setMenuOptions(prevOptions => {
                if (!prevOptions || !Array.isArray(prevOptions)) return [];

                return prevOptions.map(option => {
                    if (option.id === optionId) {
                        const updatedOption = { ...option, ...updatedData };
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

    const deleteMenuOption = async (optionId) => {
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
            await axiosWithAuth(keycloak).delete(`${menuBaseUrl}/option/${optionId}`);

            setMenuOptions(prevOptions => {
                if (!prevOptions || !Array.isArray(prevOptions)) return [];
                const filteredOptions = prevOptions.filter(option => option.id !== optionId);
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

    const updateMenuOptionsOrder = async (reorderedOptions) => {
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
            const response = await axiosWithAuth(keycloak).put(`${menuBaseUrl}/options/`, reorderedOptions);

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

    // Initialize by fetching the menu options when Keycloak is ready
    useEffect(() => {
        if (initialized) {
            if (keycloak?.authenticated) {
                getMenuOptions();
            } else if (shouldRedirectToLogin()) {
                console.log("User not authenticated, redirecting to login");
                keycloak?.login();
            }
        }
    }, [initialized, keycloak?.authenticated, location.pathname]);

    // Get all available icons from all libraries
    const getAllAvailableIcons = () => {
        const iconsByLibrary = {
            // Ant Design icons
            'Ai': Object.keys(Ai),

            // Box icons
            'Bi': Object.keys(Bi),

            // Bootstrap icons
            'Bs': Object.keys(Bs),

            // Circum icons
            'Ci': Object.keys(Ci),

            // css.gg icons
            'Cg': Object.keys(Cg),

            // Devicons
            'Di': Object.keys(Di),

            // Feather icons
            'Fi': Object.keys(Fi),

            // Flat color icons
            'Fc': Object.keys(Fc),

            // Font Awesome icons
            'Fa': Object.keys(Fa),
            'Fa6': Object.keys(Fa6),

            // Game icons
            'Gi': Object.keys(Gi),

            // Github Octicons
            'Go': Object.keys(Go),

            // Grommet icons
            'Gr': Object.keys(Gr),

            // Heroicons
            'Hi': Object.keys(Hi),
            'Hi2': Object.keys(Hi2),

            // Icomoon icons
            'Im': Object.keys(Im),

            // Icons8 line awesome icons
            'Lia': Object.keys(Lia),

            // Ionicons 
            'Io': Object.keys(Io),
            'Io5': Object.keys(Io5),

            // Lucide icons
            'Lu': Object.keys(Lu),

            // Material Design icons
            'Md': Object.keys(Md),

            // Phosphor icons
            'Pi': Object.keys(Pi),

            // Radix icons
            'Rx': Object.keys(Rx),

            // Remix icons
            'Ri': Object.keys(Ri),

            // Simple icons
            'Si': Object.keys(Si),
            
            // Simple line icons
            'Sl': Object.keys(Sl),

            // Tabler icons
            'Tb': Object.keys(Tb),

            // Themify icons
            'Tfi': Object.keys(Tfi),

            // Typicons
            'Ti': Object.keys(Ti),

            // VS Code icons
            'Vsc': Object.keys(Vsc),

            // Weather icons
            'Wi': Object.keys(Wi),
        };

        return iconsByLibrary;
    };

    const libraryName = (library) => {
        const libraryNames = {
            'Ai': 'Ant Design',
            'Bi': 'Box Icons',
            'Bs': 'Bootstrap Icons',
            'Ci': 'Circum Icons',
            'Cg': 'css.gg Icons',
            'Di': 'Devicons',
            'Fi': 'Feather Icons',
            'Fc': 'Flat Color Icons',
            'Fa': 'Font Awesome 5',
            'Fa6': 'Font Awesome 6',
            'Gi': 'Game Icons',
            'Go': 'Github Octicons',
            'Gr': 'Grommet Icons',
            'Hi': 'Heroicons',
            'Hi2': 'Heroicons 2',
            'Im': 'Icomoon Icons',
            'Lia': 'Line Awesome Icons',
            'Io': 'Ionicons',
            'Io5': 'Ionicons 5',
            'Lu': 'Lucide Icons',
            'Md': 'Material Design Icons',
            'Pi': 'Phosphor Icons',
            'Rx': 'Radix Icons',
            'Ri': 'Remix Icons',
            'Si': 'Simple Icons',
            'Sl': 'Simple Line Icons',
            'Tb': 'Tabler Icons',
            'Tfi': 'Themify Icons',
            'Ti': 'Typicons',
            'Vsc': 'VS Code Icons',
            'Wi': 'Weather Icons'
        };

        return libraryNames[library] || library;
    };

    const commonIcons = [
        // Font Awesome icons - widely supported and popular
        "fa/FaHome", "fa/FaUser", "fa/FaBook", "fa/FaCalendar", "fa/FaCog", "fa/FaBell",
        "fa/FaEnvelope", "fa/FaSearch", "fa/FaShoppingCart", "fa/FaHeart", "fa/FaStar",
        "fa/FaChartBar", "fa/FaListUl", "fa/FaFileAlt", "fa/FaLink", "fa/FaQuestion",
        "fa/FaImage", "fa/FaVideo", "fa/FaMusic", "fa/FaGamepad", "fa/FaMap", "fa/FaArrowRight",
        "fa/FaCheckCircle", "fa/FaExclamationCircle", "fa/FaInfoCircle", "fa/FaTimes",
        "fa/FaPlus", "fa/FaMinus", "fa/FaPen", "fa/FaTrash", "fa/FaShare", "fa/FaDownload",
        "fa/FaUpload", "fa/FaClock", "fa/FaCode", "fa/FaPaperPlane", "fa/FaBuilding",

        // Material Design - also widely supported
        "md/MdDashboard", "md/MdSettings", "md/MdNotifications", "md/MdPeople",
        "md/MdHome", "md/MdMenu", "md/MdLock", "md/MdPerson", "md/MdMail", "md/MdPhone",

        // Simple outline icons from Ant Design
        "ai/AiOutlineTeam", "ai/AiOutlineProject", "ai/AiOutlineFileSearch",
        "ai/AiOutlineUser", "ai/AiOutlineSetting", "ai/AiOutlineHome"
    ];

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ({
            menuOptions,
            isLoading,
            error,
            commonIcons,
            getMenuOptions,
            addMenuOption,
            updateMenuOption,
            deleteMenuOption,
            updateMenuOptionsOrder,
            getIconComponent,
            getAllAvailableIcons,
            libraryName
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