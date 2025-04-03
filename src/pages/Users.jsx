
import React, { useState, useEffect } from "react";
import { useUsers } from "../contexts/UsersContext";
import Pagination from "../components/Pagination.jsx";


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
                <h1 className="text-3xl font-bold mb-6">Users</h1>
                
                {error && (
                    <div className="alert alert-error mb-4">
                        <span>{error}</span>
                    </div>
                )}
                
                <div className="mb-6 flex flex-wrap gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        className="p-2 border rounded-lg shadow-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        value={searchTerm}
                    />
                    <select
                        className="p-2 border rounded-lg shadow-sm"
                        onChange={(e) => setFilterRole(e.target.value)}
                        value={filterRole}
                    >
                        <option value="">All Roles</option>
                        <option value="Organizer">Organizer</option>
                        <option value="Staff">Staff</option>
                        <option value="Speaker">Speaker</option>
                        <option value="Participant">Participant</option>
                    </select>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.map(user => (
                                        <tr key={user.id} className={user.banned ? "bg-error bg-opacity-10" : ""}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar">
                                                        <div className="mask mask-squircle h-12 w-12">
                                                            <img
                                                                src={user.avatar ? user.avatar : "/placeholder.jpg"}
                                                                alt={`Foto de ${user.firstName}`}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{user.firstName} {user.lastName}</div>
                                                        <div className="text-sm opacity-50">{user.nationality || "Unknown nationality"}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{user.email}</td>
                                            <td>
                                                <div className="badge badge-primary w-24">{user.role || "No role"}</div>
                                            </td>
                                            <th>
                                                <button 
                                                    className="btn mr-2 btn-secondary btn-xs"
                                                    onClick={() => openRoleModal(user.id, user.role)}
                                                >
                                                    Manage Role
                                                </button>
                                                <button 
                                                    className={`btn ${user.banned ? "btn-success" : "btn-error"} btn-xs`}
                                                    onClick={() => handleToggleBan(user.id, user.banned)}
                                                >
                                                    {user.banned ? "Unban User" : "Ban User"}
                                                </button>
                                            </th>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                        />
        
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-4">
                                <div className="join">
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i + 1}
                                            className={`join-item btn ${currentPage === i + 1 ? "btn-active" : ""}`}
                                            onClick={() => handlePageChange(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
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
        </>
    );
}

// Simple pagination component
function Pagination({ currentPage, totalPages, onPageChange }) {
    return (
        <div className="flex justify-center mt-4">
            <div className="join">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        className={`join-item btn ${currentPage === i + 1 ? "btn-active" : ""}`}
                        onClick={() => onPageChange(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}