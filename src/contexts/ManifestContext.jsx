import React, { createContext, useContext } from "react";
import { baseUrl } from "../consts";
import axios from "axios";
import { axiosWithAuth } from "../utils/axiosWithAuth";
import { useKeycloak } from "@react-keycloak/web";

const ManifestContext = createContext();

export function ManifestProvider({ children }) {
    const { keycloak, initialized } = useKeycloak();
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
        return axiosWithAuth(keycloak).post(`${baseUrl}/favicon/`, { favicon });
    };

    return (
        <ManifestContext.Provider
        value={{
            fetchManifest,
            fetchFavicon,
            updateManifestIcon,
            getManifestIcon,
            updateFavicon
        }}
        >
        {children}
        </ManifestContext.Provider>
    );
    }

    export function useManifest() {
    return useContext(ManifestContext);
} 