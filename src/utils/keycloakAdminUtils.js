import { keycloakUrl, keycloakRealm, keycloakAdminClientId, keycloakServiceAccountSecret } from "../consts";
import axios from "axios";

// Service account credentials from environment variables
const serviceAccountClient = keycloakAdminClientId;
const serviceAccountSecret = keycloakServiceAccountSecret;

/**
 * Get an admin token using client credentials grant
 * This should be used for secure server-side calls, not directly from frontend
 */
export const getAdminToken = async () => {
  try {
    const response = await axios.post(
      `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: serviceAccountClient,
        client_secret: serviceAccountSecret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting admin token:", error);
    throw error;
  }
};

/**
 * Check if the current user token has admin privileges for user management
 */
export const hasUserManagementPermissions = (keycloak) => {
  if (!keycloak || !keycloak.tokenParsed) {
    console.log("No keycloak token parsed");
    return false;
  }
  
  const { realm_access } = keycloak.tokenParsed;
  if (!realm_access || !realm_access.roles) {
    console.log("No realm_access or roles in token");
    return false;
  }
  
  console.log("User roles from token:", realm_access.roles);

  // Check for the relevant admin roles
  const requiredRoles = ["manage-users", "cb-organizer", "Organizer"];
  const hasRole = requiredRoles.some(role => realm_access.roles.includes(role));
  
  console.log("User has required role:", hasRole);
  if (!hasRole) {
    console.log("User is missing one of these roles:", requiredRoles);
  }
  
  return hasRole;
};

/**
 * Format role name for display
 */
export const formatRoleName = (roleName) => {
  if (!roleName) return "";
  
  // If it's a cb- role, strip the prefix and capitalize
  if (roleName.startsWith("cb-")) {
    return roleName.replace("cb-", "").split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  }
  
  // Otherwise, just capitalize the permission name
  return roleName.split("_").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
}; 