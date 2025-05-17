import React, { createContext, useContext, useMemo } from "react";
import { baseUrl } from "../consts";
import axios from "axios";
import { axiosWithAuth } from "../utils/axiosWithAuth";
import { useKeycloak } from "@react-keycloak/web";
import PropTypes from "prop-types";

const ManifestContext = createContext();

export function ManifestProvider({ children }) {
    const { keycloak } = useKeycloak();

    const contextValue = useMemo(() => {
        // Fetch the manifest.json
        const fetchManifest = async () => {
            const response = await axios.get(`${baseUrl}/manifest.json`);
            return response.data;
        };

        // Fetch the favicon
        const fetchFavicon = async () => {
            const response = await axios.get(`${baseUrl}/favicon/`);
            return response.data;
        };

        // Update an icon in the manifest
        const updateManifestIcon = async ({ src, sizes, type }) => {
            return axiosWithAuth(keycloak).post(`${baseUrl}/manifest/icon`, { src, sizes, type });
        };

        // Optionally, get a specific icon by size from the manifest
        const getManifestIcon = (manifest, size) => {
            if (!manifest?.icons) return null;
            return manifest.icons.find(icon => icon.sizes === size);
        };

        const updateFavicon = async (favicon) => {
            return axiosWithAuth(keycloak).put(`${baseUrl}/favicon/`, favicon);
        };

        return {
            fetchManifest,
            fetchFavicon,
            updateManifestIcon,
            getManifestIcon,
            updateFavicon
        };
    }, [keycloak]); // Only recreate if keycloak changes

    return (
        <ManifestContext.Provider value={contextValue}>
            {children}
        </ManifestContext.Provider>
    );
}

ManifestProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export function useManifest() {
    return useContext(ManifestContext);
} 