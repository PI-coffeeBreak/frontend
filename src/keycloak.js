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
  keycloak.updateToken(30) // try refreshing if token will expire in next 30s
    .then(() => {
    })
    .catch((error) => {
      console.error("Token refresh failed, forcing re-login.", error);
      keycloak.login(); // << force user to re-login
    });
};

export default keycloak;
