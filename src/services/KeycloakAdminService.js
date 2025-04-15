import axios from "axios";
import { keycloakUrl, keycloakRealm } from "../consts";
import { formatRoleName, getAdminToken, hasUserManagementPermissions } from "../utils/keycloakAdminUtils";

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
      console.log(`Fetching roles from ${this.baseUrl}/roles`);
      
      // First try to get realm roles
      const response = await this.client.get(`${this.baseUrl}/roles`);
      console.log("Roles retrieved:", response.data.length);
      
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
      console.log(`Fetching user roles from ${this.baseUrl}/users/${userId}/role-mappings/realm`);
      
      const response = await this.client.get(
        `${this.baseUrl}/users/${userId}/role-mappings/realm`
      );
      
      console.log("User roles retrieved:", response.data.length);
      
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

      console.log("Assigning role to user:", cleanRole);
      
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

      console.log("Removing role from user:", cleanRole);
      
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
      const adminToken = await getAdminToken();
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
}

export default KeycloakAdminService; 