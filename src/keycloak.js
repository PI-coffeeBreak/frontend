import Keycloak from "keycloak-js";
import { keycloakClientId, keycloakRealm, keycloakUrl } from "./consts.js";

// Create a Keycloak instance with better token handling
const keycloak = new Keycloak({
  url: keycloakUrl,
  realm: keycloakRealm,
  clientId: keycloakClientId,
});

// Configure better token refresh handling
keycloak.onTokenExpired = () => {
  console.log("Token expired, attempting refresh...");

  keycloak.updateToken(70) // try refreshing if token will expire in next 70s
    .then((refreshed) => {
      if (refreshed) {
        console.log("Token successfully refreshed.");
        // Store the new token in localStorage for persistence
        localStorage.setItem('kc_token', keycloak.token);
        localStorage.setItem('kc_refreshToken', keycloak.refreshToken);
      } else {
        console.log("Token still valid, no refresh needed.");
      }
    })
    .catch((error) => {
      console.error("Token refresh failed:", error);
      // Clear stored tokens
      localStorage.removeItem('kc_token');
      localStorage.removeItem('kc_refreshToken');
      // Force re-login with redirect to current page
      keycloak.login({
        redirectUri: window.location.href
      });
    });
};

// Add token refresh success handler
keycloak.onAuthRefreshSuccess = () => {
  console.log("Auth refresh success");
  // Update stored tokens
  localStorage.setItem('kc_token', keycloak.token);
  localStorage.setItem('kc_refreshToken', keycloak.refreshToken);
};

// Add token refresh error handler
keycloak.onAuthRefreshError = () => {
  console.error("Auth refresh error");
  // Clear stored tokens
  localStorage.removeItem('kc_token');
  localStorage.removeItem('kc_refreshToken');
  // Force re-login
  keycloak.login({
    redirectUri: window.location.href
  });
};

export default keycloak;
