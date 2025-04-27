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
  console.log("Token expired, trying to refresh...");

  keycloak.updateToken(30) // try refreshing if token will expire in next 30s
    .then((refreshed) => {
      if (refreshed) {
        console.log("Token successfully refreshed.");
      } else {
        console.log("Token still valid, no refresh needed.");
      }
    })
    .catch((error) => {
      console.error("Token refresh failed, forcing re-login.", error);
      keycloak.login(); // << force user to re-login
    });
};

export default keycloak;
