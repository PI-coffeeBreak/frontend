import { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";
import { baseUrl } from "../consts";
import { axiosWithAuth } from "../utils/axiosWithAuth";
import KeycloakAdminService from "../services/KeycloakAdminService";

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
    const usersBaseUrl = `${baseUrl}/users`;
    const usersRolesUrl = `${baseUrl}/users/roles/users`;
    const { keycloak, initialized } = useKeycloak();
    const [users, setUsers] = useState([]);
    const [usersGroupedByRole, setUsersGroupedByRole] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // New state for Keycloak roles and permissions
    const [allRoles, setAllRoles] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [userRoles, setUserRoles] = useState({});
    const [userPermissions, setUserPermissions] = useState({});
    
    // Initialize Keycloak Admin Service
    const initKeycloakAdminService = () => {
        if (!initialized || !keycloak?.authenticated || !keycloak?.token) {
            console.log("Keycloak not initialized or user not authenticated", {
                initialized,
                authenticated: keycloak?.authenticated,
                hasToken: !!keycloak?.token
            });
            return null;
        }
        console.log("Initializing KeycloakAdminService with token");
        return new KeycloakAdminService(keycloak.token);
    };

    const fetchUsers = async () => {
        if (!initialized || !keycloak?.authenticated) {
            console.log("Keycloak not initialized or user not authenticated");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            console.log("Fetching users with auth status:", keycloak.authenticated);
            const response = await axiosWithAuth(keycloak).get(usersRolesUrl);
            console.log("Users grouped by role fetched successfully:", response.data);

            setUsersGroupedByRole(response.data);

            const flattenedUsers = transformGroupedUsersToFlat(response.data);
            setUsers(flattenedUsers);

            return flattenedUsers;
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Failed to fetch users. Please try again later.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const transformGroupedUsersToFlat = (groupedUsers) => {
        const flatList = [];
        const roleMapping = {
            "cb-attendee": "Participant",
            "cb-speaker": "Speaker",
            "cb-customization": "Admin",
            "cb-organizer": "Organizer",
            "cb-staff": "Staff",
        };

        Object.entries(groupedUsers).forEach(([roleKey, usersInRole]) => {
            const roleName = roleMapping[roleKey] || roleKey;

            usersInRole.forEach((user) => {
                flatList.push({
                    ...user,
                    role: roleName,
                    banned: !user.enabled,
                });
            });
        });

        return flatList;
    };

    const fetchUserById = async (userId) => {
        setIsLoading(true);
        setError(null);
        try {
            const existingUser = users.find((user) => user.id === userId);
            if (existingUser) return existingUser;

            const response = await axiosWithAuth(keycloak).get(`${usersBaseUrl}/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user with ID ${userId}:`, error);
            setError("Failed to fetch user details. Please try again later.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log(`Updating role for user with ID ${userId} to ${newRole}`);

            const reverseRoleMapping = {
                Participant: "cb-attendee",
                Speaker: "cb-speaker",
                Admin: "cb-customization",
                Organizer: "cb-organizer",
                Staff: "cb-staff",
            };

            const backendRole = reverseRoleMapping[newRole] || newRole;

            const user = users.find((u) => u.id === userId);
            if (!user) throw new Error("User not found");

            const oldRole = user.role;
            const oldBackendRole = reverseRoleMapping[oldRole] || oldRole;

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );

            setUsersGroupedByRole((prevGrouped) => {
                const userWithoutRoleProperty = { ...user };
                delete userWithoutRoleProperty.role;

                return updateUserRoleInGroupedRoles(
                    prevGrouped,
                    userId,
                    oldBackendRole,
                    backendRole,
                    userWithoutRoleProperty
                );
            });

            return { success: true, message: `User role updated to ${newRole}` };
        } catch (error) {
            console.error(`Error updating role for user with ID ${userId}:`, error);
            setError("Failed to update user role. Please try again later.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const toggleUserBan = async (userId, shouldBeBanned) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log(`Toggling ban status for user with ID ${userId} to ${shouldBeBanned}`);

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId
                        ? { ...user, banned: shouldBeBanned, enabled: !shouldBeBanned }
                        : user
                )
            );

            setUsersGroupedByRole((prevGrouped) =>
                toggleUserEnabledInGroupedRoles(prevGrouped, userId, shouldBeBanned)
            );

            return {
                success: true,
                message: shouldBeBanned
                    ? "User banned successfully"
                    : "User unbanned successfully",
            };
        } catch (error) {
            console.error(
                `Error ${shouldBeBanned ? "banning" : "unbanning"} user with ID ${userId}:`,
                error
            );
            setError(
                `Failed to ${shouldBeBanned ? "ban" : "unban"
                } user. Please try again later.`
            );
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const getUserCountByRole = () => {
        const counts = {};
        Object.entries(usersGroupedByRole).forEach(([roleKey, usersInRole]) => {
            counts[roleKey] = usersInRole.length;
        });
        return counts;
    };

    // Fetch all available roles and permissions from Keycloak
    const fetchAllRolesAndPermissions = async () => {
        console.log("Attempting to fetch roles and permissions");
        const adminService = initKeycloakAdminService();
        if (!adminService) {
            console.error("Could not initialize admin service - missing token or authentication");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            console.log("Calling adminService.getAllRoles()");
            const rolesData = await adminService.getAllRoles();
            console.log("Roles data received:", rolesData);
            
            const { roles, permissions } = adminService.filterRolesAndPermissions(rolesData);
            console.log("Filtered roles:", roles);
            console.log("Filtered permissions:", permissions);
            
            setAllRoles(roles);
            setAllPermissions(permissions);
            
            return { roles, permissions };
        } catch (error) {
            console.error("Error fetching roles and permissions:", error);
            console.error("Error details:", error.response ? error.response.data : "No response data");
            setError("Failed to fetch roles and permissions. Please try again later.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch roles and permissions for a specific user
    const fetchUserRolesAndPermissions = async (userId) => {
        const adminService = initKeycloakAdminService();
        if (!adminService) return;

        setIsLoading(true);
        setError(null);
        try {
            const userRolesData = await adminService.getUserRoles(userId);
            const { roles, permissions } = adminService.filterRolesAndPermissions(userRolesData);
            
            // Update state
            setUserRoles(prev => ({ ...prev, [userId]: roles }));
            setUserPermissions(prev => ({ ...prev, [userId]: permissions }));
            
            return { roles, permissions };
        } catch (error) {
            console.error(`Error fetching roles for user ${userId}:`, error);
            setError("Failed to fetch user roles and permissions. Please try again later.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Assign a role to a user
    const assignRoleToUser = async (userId, role) => {
        const adminService = initKeycloakAdminService();
        if (!adminService) return;

        setIsLoading(true);
        setError(null);
        try {
            await adminService.assignRoleToUser(userId, role);
            
            // Update local state after successful assignment
            await fetchUserRolesAndPermissions(userId);
            
            return { success: true, message: `Role ${role.name} assigned successfully` };
        } catch (error) {
            console.error(`Error assigning role to user ${userId}:`, error);
            setError("Failed to assign role. Please try again later.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Remove a role from a user
    const removeRoleFromUser = async (userId, role) => {
        const adminService = initKeycloakAdminService();
        if (!adminService) return;

        setIsLoading(true);
        setError(null);
        try {
            await adminService.removeRoleFromUser(userId, role);
            
            // Update local state after successful removal
            await fetchUserRolesAndPermissions(userId);
            
            return { success: true, message: `Role ${role.name} removed successfully` };
        } catch (error) {
            console.error(`Error removing role from user ${userId}:`, error);
            setError("Failed to remove role. Please try again later.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Create a new role
    const createRole = async (roleName, description = "") => {
        const adminService = initKeycloakAdminService();
        if (!adminService) {
            console.error("Could not initialize admin service - missing token or authentication");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            console.log("Creating new role:", roleName);
            const result = await adminService.createRole(roleName, description);
            
            // Refresh roles after creation
            await fetchAllRolesAndPermissions();
            
            return result;
        } catch (error) {
            console.error("Error creating role:", error);
            console.error("Error details:", error.response ? error.response.data : "No response data");
            setError("Failed to create role. Please try again later.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Get permissions for a specific role
    const getRolePermissions = async (roleName) => {
        const adminService = initKeycloakAdminService();
        if (!adminService) {
            console.error("Could not initialize admin service - missing token or authentication");
            return [];
        }

        setIsLoading(true);
        setError(null);
        try {
            console.log("Getting permissions for role:", roleName);
            const permissions = await adminService.getRolePermissions(roleName);
            return permissions;
        } catch (error) {
            console.error(`Error getting permissions for role ${roleName}:`, error);
            setError("Failed to get role permissions. Please try again later.");
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Add permission to role
    const addPermissionToRole = async (roleName, permission) => {
        const adminService = initKeycloakAdminService();
        if (!adminService) {
            console.error("Could not initialize admin service - missing token or authentication");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            console.log(`Adding permission ${permission.name} to role ${roleName}`);
            const result = await adminService.addPermissionToRole(roleName, permission);
            return result;
        } catch (error) {
            console.error(`Error adding permission to role ${roleName}:`, error);
            setError("Failed to add permission to role. Please try again later.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Remove permission from role
    const removePermissionFromRole = async (roleName, permission) => {
        const adminService = initKeycloakAdminService();
        if (!adminService) {
            console.error("Could not initialize admin service - missing token or authentication");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            console.log(`Removing permission ${permission.name} from role ${roleName}`);
            const result = await adminService.removePermissionFromRole(roleName, permission);
            return result;
        } catch (error) {
            console.error(`Error removing permission from role ${roleName}:`, error);
            setError("Failed to remove permission from role. Please try again later.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch roles on init
    useEffect(() => {
        if (initialized && keycloak?.authenticated) {
            fetchUsers();
            fetchAllRolesAndPermissions();
        }
    }, [initialized, keycloak?.authenticated]);

    // Memoize the value object to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ({
            users,
            usersGroupedByRole,
            isLoading,
            error,
            fetchUsers,
            fetchUserById,
            updateUserRole,
            toggleUserBan,
            getUserCountByRole,
            // Keycloak Admin API functions
            allRoles,
            allPermissions,
            userRoles,
            userPermissions,
            fetchAllRolesAndPermissions,
            fetchUserRolesAndPermissions,
            assignRoleToUser,
            removeRoleFromUser,
            // New role management functions
            createRole,
            getRolePermissions,
            addPermissionToRole,
            removePermissionFromRole
        }),
        [users, usersGroupedByRole, isLoading, error, allRoles, allPermissions, userRoles, userPermissions]
    );

    return (
        <UsersContext.Provider value={contextValue}>
            {children}
        </UsersContext.Provider>
    );
};

// Add PropTypes validation for the `children` prop
UsersProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useUsers = () => useContext(UsersContext);

// Helper function to toggle a user's enabled status in a grouped structure
const toggleUserEnabledInGroupedRoles = (groupedRoles, userId, shouldBeBanned) => {
    const updatedGroupedRoles = { ...groupedRoles };

    Object.keys(updatedGroupedRoles).forEach((roleKey) => {
        updatedGroupedRoles[roleKey] = updatedGroupedRoles[roleKey].map((user) =>
            user.id === userId
                ? { ...user, enabled: !shouldBeBanned }
                : user
        );
    });

    return updatedGroupedRoles;
};

// Helper function to update a user's role in a grouped structure
const updateUserRoleInGroupedRoles = (groupedRoles, userId, oldRole, newRole, userWithoutRoleProperty) => {
    const updatedGroupedRoles = { ...groupedRoles };

    // Remove user from the old role
    if (updatedGroupedRoles[oldRole]) {
        updatedGroupedRoles[oldRole] = updatedGroupedRoles[oldRole].filter(
            (user) => user.id !== userId
        );
    }

    // Add user to the new role
    if (!updatedGroupedRoles[newRole]) {
        updatedGroupedRoles[newRole] = [];
    }
    updatedGroupedRoles[newRole].push(userWithoutRoleProperty);

    return updatedGroupedRoles;
};