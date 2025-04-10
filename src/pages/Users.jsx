import React, { useState, useEffect } from "react";
import { useUsers } from "../contexts/UsersContext";
import Pagination from "../components/Pagination.jsx";
import CreateCard from "../components/CreateCard.jsx";
import {FaUsers, FaUser, FaUsersCog} from "react-icons/fa";
import UserCard from "../components/UserCard.jsx";


export default function Users() {
    // Get users data and functions from context
    const { users, isLoading, error, fetchUsers, updateUserRole, toggleUserBan } = useUsers();
    
    // Local state for UI controls
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedRoleForUser, setSelectedRoleForUser] = useState("");
    const usersPerPage = 5;

    // Refresh users when component mounts
    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users based on search term and role filter
    const filteredUsers = users.filter(
        user =>
        (user.firstName?.toLowerCase() + " " + user.lastName?.toLowerCase()).includes(searchTerm.toLowerCase()) &&
        (filterRole === "" || user.role === filterRole)
    );
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    

    // Open modal for managing user role
    const openRoleModal = (userId, currentRole) => {
        setSelectedUserId(userId);
        setSelectedRoleForUser(currentRole || "");
        document.getElementById('role_modal').showModal();
    };

    // Save role change
    const handleRoleSave = async () => {
        if (selectedUserId && selectedRoleForUser) {
            try {
                await updateUserRole(selectedUserId, selectedRoleForUser);
                document.getElementById('role_modal').close();
            } catch (error) {
                console.error("Error updating role:", error);
            }
        }
    };

    // Toggle user ban status
    const handleToggleBan = async (userId, currentBanStatus) => {
        try {
            await toggleUserBan(userId, !currentBanStatus);
        } catch (error) {
            console.error("Error toggling ban status:", error);
        }
    };

    return (
        <>
            <div className="w-full min-h-svh p-8">
                <h1 className="text-3xl font-bold">Create Users</h1>
                <div className="grid grid-cols-3 gap-4 mt-8">
                    <CreateCard
                        icon={FaUsers}
                        title="Add with an excel file"
                        description="Upload an Excel file to quickly add multiple users at once."
                    />
                    <CreateCard
                        icon={FaUser}
                        title="Create a new user"
                        description="Create a new user manually."
                    />
                    <CreateCard
                        icon={FaUsersCog}
                        title="Manage roles"
                        description="Create or change a role."
                    />
                </div>

                <h1 className="text-3xl font-bold mt-8">Users</h1>

                <div className="flex gap-8 mt-4">
                    <div className="flex gap-4">
                        <label className="input">
                            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none"
                                   stroke="currentColor">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.3-4.3"></path>
                                </g>
                            </svg>
                            <input
                                type="text"
                                className="grow"
                                placeholder="Search users"
                                />
                        </label>
                    </div>
                </div>


                <div className="overflow-x-auto mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Example user cards - replace with your actual data mapping */}
                        <UserCard/>
                    </div>
                </div>


                {/* {error && (
                    <div className="alert alert-error mb-4">
                        <span>{error}</span>
                    </div>
                )} */}

                {/*{isLoading ? (
                    <div className="flex justify-center items-center p-8">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentUsers.map(user => (
                                    <div key={user.id} className={`card shadow-xl ${user.banned ? "bg-error bg-opacity-20" : "bg-secondary text-secondary-content"}`}>
                                        <div className="card-body">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="avatar">
                                                    <div className="w-16 rounded-full">
                                                        <img src={user.avatar ? user.avatar : "/placeholder.jpg"} alt={`Foto de ${user.firstName}`} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h2 className="card-title">{user.firstName} {user.lastName}</h2>
                                                    <p className="text-sm opacity-75">{user.email}</p>
                                                    <p className="text-xs opacity-50">{user.nationality || "Unknown nationality"}</p>
                                                </div>
                                            </div>
                                            <div className="badge badge-primary mb-4">{user.role || "No role"}</div>
                                            <div className="card-actions justify-end">
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => openRoleModal(user.id, user.role)}
                                                >
                                                    Manage Role
                                                </button>
                                                <button
                                                    className={`btn ${user.banned ? "btn-success" : "btn-error"} btn-sm`}
                                                    onClick={() => handleToggleBan(user.id, user.banned)}
                                                >
                                                    {user.banned ? "Unban" : "Ban"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                        />
                    </>
                )}*/}
            {/* Role Management Modal */}
            <dialog id="role_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Manage User Role</h3>
                    <div className="py-4">
                        <select
                            className="select select-bordered w-full"
                            value={selectedRoleForUser}
                            onChange={(e) => setSelectedRoleForUser(e.target.value)}
                        >
                            <option value="" disabled>Select a role</option>
                            <option value="Organizer">Organizer</option>
                            <option value="Staff">Staff</option>
                            <option value="Speaker">Speaker</option>
                            <option value="Participant">Participant</option>
                        </select>
                    </div>
                    <div className="modal-action">
                        <button className="btn btn-primary" onClick={handleRoleSave}>Save Changes</button>
                        <form method="dialog">
                            <button className="btn">Cancel</button>
                        </form>
                    </div>
                </div>
            </dialog>
            </div>
        </>
    );
}

