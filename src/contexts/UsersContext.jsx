import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../consts";

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
    const usersBaseUrl = `${baseUrl}/users`;
    const usersRolesUrl = `${baseUrl}/users/roles/users`;
    
    // State for users data
    const [users, setUsers] = useState([]);
    const [usersGroupedByRole, setUsersGroupedByRole] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Fetch all users
    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(usersRolesUrl);
            console.log("Users grouped by role fetched successfully:", response.data);
            
            // Store the raw grouped data
            setUsersGroupedByRole(response.data);
            
            // Transform grouped users into a flat list
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
    
    // Transform grouped users into flat list with role information
    const transformGroupedUsersToFlat = (groupedUsers) => {
        const flatList = [];
        
        // Map of role keys to user-friendly role names
        const roleMapping = {
            "cb-attendee": "Participant",
            "cb-speaker": "Speaker",
            "cb-customization": "Admin",
            "cb-organizer": "Organizer",
            "cb-staff": "Staff"
        };
        
        // Iterate through each role group
        Object.entries(groupedUsers).forEach(([roleKey, usersInRole]) => {
            const roleName = roleMapping[roleKey] || roleKey;
            
            // Add each user with their role information
            usersInRole.forEach(user => {
                flatList.push({
                    ...user,
                    role: roleName,
                    banned: !user.enabled
                });
            });
        });
        
        return flatList;
    };
    
    // Fetch a single user by ID
    const fetchUserById = async (userId) => {
        setIsLoading(true);
        setError(null);
        try {
            // First try to find the user in our existing data
            const existingUser = users.find(user => user.id === userId);
            if (existingUser) return existingUser;
            
            // If not found, make an API request
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
    
    // Update user role
    const updateUserRole = async (userId, newRole) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log(`Updating role for user with ID ${userId} to ${newRole}`);
            
            // Role mapping (from user-friendly names to backend keys)
            const reverseRoleMapping = {
                "Participant": "cb-attendee",
                "Speaker": "cb-speaker",
                "Admin": "cb-customization",
                "Organizer": "cb-organizer",
                "Staff": "cb-staff"
            };
            
            const backendRole = reverseRoleMapping[newRole] || newRole;
            
            // Make API call to update user role
            // Implement the actual API call when the endpoint is available
            // const response = await axios.put(`${usersBaseUrl}/${userId}/role`, { role: backendRole });
            
            // For now, we'll update our local state to simulate the change
            // Find the user's current role
            const user = users.find(u => u.id === userId);
            if (!user) throw new Error("User not found");
            
            const oldRole = user.role;
            const oldBackendRole = reverseRoleMapping[oldRole] || oldRole;
            
            // Update users state with the new role
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );
            
            setUsersGroupedByRole(prevGrouped => {
                const newGrouped = JSON.parse(JSON.stringify(prevGrouped));
                
                // Remove user from old role group
                if (newGrouped[oldBackendRole]) {
                    newGrouped[oldBackendRole] = newGrouped[oldBackendRole].filter(u => u.id !== userId);
                }
                
                // Add user to new role group
                if (!newGrouped[backendRole]) newGrouped[backendRole] = [];
                
                // Find the user object without the role property
                const userWithoutRoleProperty = { ...user };
                delete userWithoutRoleProperty.role;
                
                newGrouped[backendRole].push(userWithoutRoleProperty);
                
                return newGrouped;
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
    
    // Ban/Unban a user (toggle enabled status)
    const toggleUserBan = async (userId, shouldBeBanned) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log(`Toggling ban status for user with ID ${userId} to ${shouldBeBanned}`);
            
            // Make API call to toggle user ban status
            // Implement the actual API call when the endpoint is available
            // const response = await axios.put(`${usersBaseUrl}/${userId}/status`, { 
            //     enabled: !shouldBeBanned 
            // });
            
            // For now, we'll update our local state to simulate the change
            // Update users state with the new banned status
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? { ...user, banned: shouldBeBanned, enabled: !shouldBeBanned } : user
                )
            );
            
            // Also update the grouped users state
            setUsersGroupedByRole(prevGrouped => {
                // Create a deep copy to avoid mutating the original state
                const newGrouped = JSON.parse(JSON.stringify(prevGrouped));
                
                // Update enabled status in all role groups (user could be in any group)
                Object.keys(newGrouped).forEach(roleKey => {
                    newGrouped[roleKey] = newGrouped[roleKey].map(user => 
                        user.id === userId ? { ...user, enabled: !shouldBeBanned } : user
                    );
                });
                
                return newGrouped;
            });
            
            return { success: true, message: shouldBeBanned ? "User banned successfully" : "User unbanned successfully" };
        } catch (error) {
            console.error(`Error ${shouldBeBanned ? 'banning' : 'unbanning'} user with ID ${userId}:`, error);
            setError(`Failed to ${shouldBeBanned ? 'ban' : 'unban'} user. Please try again later.`);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Get count of users by role
    const getUserCountByRole = () => {
        const counts = {};
        Object.entries(usersGroupedByRole).forEach(([roleKey, usersInRole]) => {
            counts[roleKey] = usersInRole.length;
        });
        return counts;
    };

    // Load users when the provider is mounted
    useEffect(() => {
        fetchUsers();
    }, []);
    
    return (
        <UsersContext.Provider value={{
            users,
            usersGroupedByRole,
            isLoading,
            error,
            fetchUsers,
            fetchUserById,
            updateUserRole,
            toggleUserBan,
            getUserCountByRole
        }}>
            {children}
        </UsersContext.Provider>
    );
};

export const useUsers = () => useContext(UsersContext);