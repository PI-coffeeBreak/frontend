import axios from "axios";
import { keycloakUrl, keycloakRealm } from "../consts";
import { formatRoleName, hasUserManagementPermissions, hasRoleManagementPermissions } from "../utils/keycloakAdminUtils";
import keycloak from "../keycloak"

class KeycloakAdminService {
  constructor(token) {
    this.token = token;
    this.baseUrl = `${keycloakUrl}/admin/realms/${keycloakRealm}`;
    this.client = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  }

  // Get all realm roles
  async getAllRoles() {
    try {
      
      // First try to get realm roles
      const response = await this.client.get(`${this.baseUrl}/roles`);
      
      // If we got roles, process them
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(role => ({
          ...role,
          displayName: formatRoleName(role.name)
        }));
      } else {
        console.warn("Response data is not an array:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      console.error("Error details:", error.response?.data || "No response data");
      
      // Return empty array on error rather than throwing to prevent UI breakage
      return [];
    }
  }

  // Get all realm roles for a specific user
  async getUserRoles(userId) {
    try {
      const response = await this.client.get(
        `${this.baseUrl}/users/${userId}/role-mappings/realm`
      );
      
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(role => ({
          ...role,
          displayName: formatRoleName(role.name)
        }));
      } else {
        console.warn("User roles response data is not an array:", response.data);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching roles for user ${userId}:`, error);
      console.error("Error details:", error.response?.data || "No response data");
      return [];
    }
  }

  // Get all available roles the user doesn't have
  async getAvailableRoles(userId) {
    try {
      const response = await this.client.get(
        `${this.baseUrl}/users/${userId}/role-mappings/realm/available`
      );
      return response.data.map(role => ({
        ...role,
        displayName: formatRoleName(role.name)
      }));
    } catch (error) {
      console.error(`Error fetching available roles for user ${userId}:`, error);
      throw error;
    }
  }

  // Assign a role to a user
  async assignRoleToUser(userId, role) {
    try {
      // Create a clean role object without the displayName property
      const cleanRole = {
        id: role.id,
        name: role.name,
        description: role.description,
        composite: role.composite,
        clientRole: role.clientRole,
        containerId: role.containerId
      };
      
      await this.client.post(
        `${this.baseUrl}/users/${userId}/role-mappings/realm`,
        [cleanRole]
      );
      return { success: true };
    } catch (error) {
      console.error(`Error assigning role to user ${userId}:`, error);
      console.error("Error details:", error.response?.data || "No response data");
      throw error;
    }
  }

  // Remove a role from a user
  async removeRoleFromUser(userId, role) {
    try {
      // Create a clean role object without the displayName property
      const cleanRole = {
        id: role.id,
        name: role.name,
        description: role.description,
        composite: role.composite,
        clientRole: role.clientRole,
        containerId: role.containerId
      };

      await this.client.delete(
        `${this.baseUrl}/users/${userId}/role-mappings/realm`,
        { data: [cleanRole] }
      );
      return { success: true };
    } catch (error) {
      console.error(`Error removing role from user ${userId}:`, error);
      console.error("Error details:", error.response?.data || "No response data");
      throw error;
    }
  }

  // Filter roles based on naming convention
  filterRolesAndPermissions(roles) {
    if (!roles || !Array.isArray(roles)) {
      return { roles: [], permissions: [] };
    }

    // Filter out Keycloak internal roles that should not be shown
    const filteredRoles = roles.filter(
      (role) =>
        role.name !== "default-roles-coffeebreak" &&
        role.name !== "uma_authorization" &&
        role.name !== "offline_access"
    );

    // Separate roles and permissions based on naming convention
    return {
      roles: filteredRoles.filter((role) => role.name.startsWith("cb-")),
      permissions: filteredRoles.filter((role) => !role.name.startsWith("cb-")),
    };
  }

  // Get an authenticated admin service instance
  static async getAdminInstance() {
    try {
      const adminToken = keycloak.token;
      return new KeycloakAdminService(adminToken);
    } catch (error) {
      console.error("Failed to create admin service instance:", error);
      throw error;
    }
  }

  // Check if the provided token has admin permissions
  static hasAdminPermissions(keycloak) {
    return hasUserManagementPermissions(keycloak);
  }

  // Check if the provided token has role management permissions
  static hasRoleManagementPermissions(keycloak) {
    return hasRoleManagementPermissions(keycloak);
  }

  // Create a new role
  async createRole(roleName, description = "") {
    try {
      // Ensure the role name follows the cb- convention
      const formattedRoleName = roleName.startsWith("cb-") ? roleName : `cb-${roleName}`;
      
      try {
        // First try with user's token
        const response = await this.client.post(`${this.baseUrl}/roles`, {
          name: formattedRoleName,
          description: description
        });
        
        return {
          success: true,
          role: response.data
        };
      } catch (error) {
        // If user's token doesn't have permission, try with admin token
        if (error.response?.status === 403) {          
          try {
            // Get admin token and create admin service instance
            const adminInstance = await KeycloakAdminService.getAdminInstance();
            
            // Try creating the role with admin token
            const adminResponse = await adminInstance.client.post(`${adminInstance.baseUrl}/roles`, {
              name: formattedRoleName,
              description: description
            });
            
            return {
              success: true,
              role: adminResponse.data,
              note: "Created using admin token"
            };
          } catch (adminError) {
            console.error("Error creating role with admin token:", adminError);
            console.error("Admin error details:", adminError.response?.data || "No response data");
            throw adminError; // Rethrow the admin error
          }
        } else {
          // If it's not a permission issue, rethrow the original error
          throw error;
        }
      }
    } catch (error) {
      console.error("Error creating role:", error);
      console.error("Error details:", error.response?.data || "No response data");
      throw error;
    }
  }

  async renameRole(oldRoleName, newRoleName) {
    try {
      // Get the old role
      const oldRole = await this.getRoleByName(oldRoleName);

      // Get the old role's permissions (composite roles)
      const oldComposites = await this.getRolePermissions(oldRoleName);

      // Create the new role
      await this.createRole(newRoleName, oldRole.description);

      // Add the old role's permissions to the new role
      for (const perm of oldComposites) {
        await this.addPermissionToRole(newRoleName, perm);
      }

      // Copy the role to all users
      // Get all users in the realm
      const usersResponse = await this.client.get(`${this.baseUrl}/users?max=10000`);
      const allUsers = usersResponse.data;

      // For each user, check if they have the old role and assign the new role
      for (const user of allUsers) {
        const userRoles = await this.getUserRoles(user.id);
        if (userRoles.some(r => r.name === oldRoleName)) {
          // Get the new role object
          const newRoleObj = await this.getRoleByName(newRoleName);
          await this.assignRoleToUser(user.id, newRoleObj);
        }
      }

      // Delete the old role
      await this.deleteRole(oldRoleName);

      return { success: true };
    } catch (error) {
      console.error(`Error renaming role from ${oldRoleName} to ${newRoleName}:`, error);
      throw error;
    }
  }
  
    // Delete a role
    async deleteRole(roleName) {
      try {
        await this.client.delete(`${this.baseUrl}/roles/${roleName}`);
        return { success: true };
      } catch (error) {
        console.error(`Error deleting role ${roleName}:`, error);
        console.error("Error details:", error.response?.data || "No response data");
        throw error;
      }
    }

  // Get role by name
  async getRoleByName(roleName) {
    try {      
      const response = await this.client.get(`${this.baseUrl}/roles/${roleName}`);
      return {
        ...response.data,
        displayName: formatRoleName(response.data.name)
      };
    } catch (error) {
      console.error(`Error getting role ${roleName}:`, error);
      console.error("Error details:", error.response?.data || "No response data");
      throw error;
    }
  }

  // Get role permissions (composite roles)
  async getRolePermissions(roleName) {
    try {
      const response = await this.client.get(`${this.baseUrl}/roles/${roleName}/composites`);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(role => ({
          ...role,
          displayName: formatRoleName(role.name)
        }));
      } else {
        console.warn("Role permissions response data is not an array:", response.data);
        return [];
      }
    } catch (error) {
      console.error(`Error getting permissions for role ${roleName}:`, error);
      console.error("Error details:", error.response?.data || "No response data");
      return [];
    }
  }

  // Add permission to role (make role composite)
  async addPermissionToRole(roleName, permission) {
    try {
      // Clean permission object
      const cleanPermission = {
        id: permission.id,
        name: permission.name,
        description: permission.description,
        composite: permission.composite,
        clientRole: permission.clientRole,
        containerId: permission.containerId
      };      
      await this.client.post(
        `${this.baseUrl}/roles/${roleName}/composites`,
        [cleanPermission]
      );
      
      return { success: true };
    } catch (error) {
      console.error(`Error adding permission to role ${roleName}:`, error);
      console.error("Error details:", error.response?.data || "No response data");
      throw error;
    }
  }

  // Remove permission from role
  async removePermissionFromRole(roleName, permission) {
    try {
      // Clean permission object
      const cleanPermission = {
        id: permission.id,
        name: permission.name,
        description: permission.description,
        composite: permission.composite,
        clientRole: permission.clientRole,
        containerId: permission.containerId
      };
      await this.client.delete(
        `${this.baseUrl}/roles/${roleName}/composites`,
        { data: [cleanPermission] }
      );
      
      return { success: true };
    } catch (error) {
      console.error(`Error removing permission from role ${roleName}:`, error);
      console.error("Error details:", error.response?.data || "No response data");
      throw error;
    }
  }
}

export default KeycloakAdminService;