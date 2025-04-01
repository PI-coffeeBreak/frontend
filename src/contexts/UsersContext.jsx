import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../consts";

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
    const usersBaseUrl = `${baseUrl}/users`;
    
    // State for users data
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Fetch all users
    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(usersBaseUrl);
            console.log("Users fetched successfully:", response.data);
            setUsers(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Failed to fetch users. Please try again later.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };
    
    // Fetch a single user by ID
    const fetchUserById = async (userId) => {
        setIsLoading(true);
        setError(null);
        try {
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
    const updateUserRole = async (userId, role) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log(`Updating role for user with ID ${userId} to ${role}`);
            // Uncomment the following line when the backend API is ready
            // const response = await axios.put(`${usersBaseUrl}/${userId}/role`, { role });
            
            // // Update the users state with the updated user
            // setUsers(prevUsers => 
            //     prevUsers.map(user => 
            //         user.id === userId ? { ...user, role } : user
            //     )
            // );
            
            // return response.data;
        } catch (error) {
            console.error(`Error updating role for user with ID ${userId}:`, error);
            setError("Failed to update user role. Please try again later.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };
    
    // Ban/Unban a user
    const toggleUserBan = async (userId, isBanned) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log(`Toggling ban status for user with ID ${userId} to ${isBanned}`);
            // Uncomment the following line when the backend API is ready
            // const response = await axios.put(`${usersBaseUrl}/${userId}/ban`, { 
            //     banned: isBanned 
            // });
            
            // // Update the users state with the updated user
            // setUsers(prevUsers => 
            //     prevUsers.map(user => 
            //         user.id === userId ? { ...user, banned: isBanned } : user
            //     )
            // );
            
            // return response.data;
        } catch (error) {
            console.error(`Error ${isBanned ? 'banning' : 'unbanning'} user with ID ${userId}:`, error);
            setError(`Failed to ${isBanned ? 'ban' : 'unban'} user. Please try again later.`);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Load users when the provider is mounted
    useEffect(() => {
        fetchUsers();
    }, []);
    
    return (
        <UsersContext.Provider value={{
            users,
            isLoading,
            error,
            fetchUsers,
            fetchUserById,
            updateUserRole,
            toggleUserBan
        }}>
            {children}
        </UsersContext.Provider>
    );
};

export const useUsers = () => useContext(UsersContext);