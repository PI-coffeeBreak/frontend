const config = window.__RUNTIME_CONFIG__ || import.meta.env;

export const baseUrl = config.VITE_API_BASE_URL;
export const wsBaseUrl = config.VITE_WS_BASE_URL;
export const keycloakUrl = config.VITE_KEYCLOAK_URL;
export const keycloakRealm = config.VITE_KEYCLOAK_REALM;
export const keycloakClientId = config.VITE_KEYCLOAK_CLIENT_ID;

export const MAX_FILE_SIZE = 1024 * 1024; // 1 MB
export const ALLOWED_FILE_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";