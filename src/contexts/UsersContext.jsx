import { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { baseUrl } from "../consts";

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
    const usersBaseUrl = `${baseUrl}/users`;
    const usersRolesUrl = `${baseUrl}/users/roles/users`;
    const { keycloak, initialized } = useKeycloak();

    const [users, setUsers] = useState([]);
    const [usersGroupedByRole, setUsersGroupedByRole] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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

            const response = await axios.get(`${usersBaseUrl}/${userId}`);
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

    useEffect(() => {
        if (initialized && keycloak?.authenticated) {
            fetchUsers();
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
        }),
        [users, usersGroupedByRole, isLoading, error]
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