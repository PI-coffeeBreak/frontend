import Keycloak from 'keycloak-js'
import {keycloakClientId, keycloakRealm, keycloakUrl} from "./consts.js";

// Create a Keycloak instance with better token handling
const keycloak = new Keycloak(
    {
        url: keycloakUrl,
        realm: keycloakRealm,
        clientId: keycloakClientId,
    }
)

// Configure better token refresh handling
keycloak.onTokenExpired = () => {
    console.log('Token expired, refreshing...');
    keycloak.updateToken(70)
        .then((refreshed) => {
            if (refreshed) {
                console.log('Token refreshed successfully');
            } else {
                console.log('Token not refreshed, valid for longer than 70 seconds');
            }
        })
        .catch(() => {
            console.error('Failed to refresh token');
        });
};

export default keycloak