export const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost/api/v1";
export const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || "ws://localhost/ws";
export const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || "https://localhost:8443";
export const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM || "coffeebreak";
export const keycloakClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "coffeebreak-client";
export const MAX_FILE_SIZE = 1024 * 1024; // 1 MB
