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
 * Check if the current user token has role management permissions
 */
export const hasRoleManagementPermissions = (keycloak) => {
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

  // Check for the relevant role management roles
  const requiredRoles = ["cb-organizer", "manage-realm"];
  const hasRole = requiredRoles.some(role => realm_access.roles.includes(role));
  
  console.log("User has role management permissions:", hasRole);
  if (!hasRole) {
    console.log("User is missing one of these roles needed for role management:", requiredRoles);
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