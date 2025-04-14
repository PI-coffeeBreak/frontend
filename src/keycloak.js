import Keycloak from "keycloak-js";
import { keycloakClientId, keycloakRealm, keycloakUrl } from "./consts.js";

// Debug environment variables
console.log("Environment variables:", {
  VITE_KEYCLOAK_URL: import.meta.env.VITE_KEYCLOAK_URL,
  VITE_KEYCLOAK_REALM: import.meta.env.VITE_KEYCLOAK_REALM,
  VITE_KEYCLOAK_CLIENT_ID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

// Create a Keycloak instance with better token handling
const keycloak = new Keycloak({
  url: keycloakUrl,
  realm: keycloakRealm,
  clientId: keycloakClientId,
});

// Log Keycloak configuration
console.log("Keycloak configuration:", {
  url: keycloakUrl,
  realm: keycloakRealm,
  clientId: keycloakClientId,
});


// Configure better token refresh handling
keycloak.onTokenExpired = () => {
  console.log("Token expired, refreshing...");
  keycloak
    .updateToken(70)
    .then((refreshed) => {
      if (refreshed) {
        console.log("Token refreshed successfully");
      } else {
        console.log("Token not refreshed, valid for longer than 70 seconds");
      }
    })
    .catch(() => {
      console.error("Failed to refresh token");
    });
};

export default keycloak;
