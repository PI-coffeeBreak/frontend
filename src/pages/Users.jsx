import React, { useState, useEffect } from "react";
import { useUsers } from "../contexts/UsersContext";
import { useKeycloak } from "@react-keycloak/web";
import Pagination from "../components/Pagination.jsx";
import CreateCard from "../components/CreateCard.jsx";
import { FaUsers, FaUser, FaUsersCog, FaPlus, FaTrash, FaCheck, FaLock, FaShieldAlt, FaKey } from "react-icons/fa";
import KeycloakAdminService from "../services/KeycloakAdminService";

export default function Users() {
    const { keycloak } = useKeycloak();
    const hasAdminPermissions = KeycloakAdminService.hasAdminPermissions(keycloak);
    
    // Debug code
    console.log("Token parsed:", keycloak?.tokenParsed);
    console.log("Realm access:", keycloak?.tokenParsed?.realm_access);
    console.log("Roles:", keycloak?.tokenParsed?.realm_access?.roles);
    console.log("Has admin permissions:", hasAdminPermissions);
    
    // Get users data and functions from context
    const { 
        users, 
        isLoading, 
        error, 
        fetchUsers, 
        updateUserRole, 
        toggleUserBan,
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
    } = useUsers();
    
    // Local state for UI controls
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedRoleForUser, setSelectedRoleForUser] = useState("");
    const [activeTab, setActiveTab] = useState("roles");
    const usersPerPage = 5;

    // Role management state
    const [roleManagementTab, setRoleManagementTab] = useState("create");
    const [newRoleName, setNewRoleName] = useState("");
    
    // Role permissions management state
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedRolePermissions, setSelectedRolePermissions] = useState([]);
    
    // Refresh users when component mounts
    useEffect(() => {
        fetchUsers();
        fetchAllRolesAndPermissions();
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

    // Open modal for managing roles
    const openRoleManagementModal = () => {
        setRoleManagementTab("create");
        setNewRoleName("");
        
        // If there are roles, select the first one for permissions management
        if (allRoles.length > 0) {
            setSelectedRole(allRoles[0]);
            loadRolePermissions(allRoles[0]);
        } else {
            setSelectedRole(null);
            setSelectedRolePermissions([]);
        }
        
        document.getElementById('role_management_modal').showModal();
    };
    
    // Load permissions for a role
    const loadRolePermissions = async (role) => {
        try {
            const permissions = await getRolePermissions(role.name);
            setSelectedRolePermissions(permissions);
        } catch (error) {
            console.error("Error fetching role permissions:", error);
        }
    };

    // Handle role selection change
    const handleRoleChange = (e) => {
        const role = allRoles.find(r => r.name === e.target.value);
        if (role) {
            setSelectedRole(role);
            loadRolePermissions(role);
        }
    };

    // Handle role creation
    const handleCreateRole = async () => {
        if (!newRoleName) return;
        
        try {
            await createRole(newRoleName);
            setNewRoleName("");
            // Refresh roles
            const result = await fetchAllRolesAndPermissions();
            
            // After creating a role, switch to permissions tab with the new role selected
            if (result && result.roles.length > 0) {
                // Find the newly created role
                const newRole = result.roles.find(r => r.name === `cb-${newRoleName}` || r.name === newRoleName);
                if (newRole) {
                    setSelectedRole(newRole);
                    setRoleManagementTab("permissions");
                    loadRolePermissions(newRole);
                }
            }
        } catch (error) {
            console.error("Failed to create role:", error);
        }
    };

    // Check if a role has a specific permission
    const roleHasPermission = (permissionName) => {
        return selectedRolePermissions.some(permission => permission.name === permissionName);
    };

    // Handle adding permission to role
    const handleAddPermissionToRole = async (permission) => {
        if (!selectedRole) return;
        
        try {
            await addPermissionToRole(selectedRole.name, permission);
            // Refresh permissions for this role
            loadRolePermissions(selectedRole);
        } catch (error) {
            console.error("Error adding permission to role:", error);
        }
    };

    // Handle removing permission from role
    const handleRemovePermissionFromRole = async (permission) => {
        if (!selectedRole) return;
        
        try {
            await removePermissionFromRole(selectedRole.name, permission);
            // Refresh permissions for this role
            loadRolePermissions(selectedRole);
        } catch (error) {
            console.error("Error removing permission from role:", error);
        }
    };

    // Open modal for managing user role
    const openRoleModal = (userId, currentRole) => {
        setSelectedUserId(userId);
        setSelectedRoleForUser(currentRole || "");
        
        // Fetch user's current roles and permissions
        fetchUserRolesAndPermissions(userId);
        
        document.getElementById('keycloak_role_modal').showModal();
    };

    // Handle role assignment
    const handleAssignRole = async (userId, role) => {
        try {
            await assignRoleToUser(userId, role);
        } catch (error) {
            console.error("Error assigning role:", error);
        }
    };

    // Handle role removal
    const handleRemoveRole = async (userId, role) => {
        try {
            await removeRoleFromUser(userId, role);
        } catch (error) {
            console.error("Error removing role:", error);
        }
    };

    // Check if user has a specific role
    const userHasRole = (userId, roleName) => {
        if (!userRoles[userId]) return false;
        return userRoles[userId].some(role => role.name === roleName);
    };

    // Check if user has a specific permission
    const userHasPermission = (userId, permissionName) => {
        if (!userPermissions[userId]) return false;
        return userPermissions[userId].some(permission => permission.name === permissionName);
    };

    // Save role change (from legacy role dropdown)
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

    // Display message when admin permissions are missing
    const AdminPermissionsWarning = () => (
        <div className="alert alert-warning mb-4">
            <FaLock className="h-6 w-6" />
            <span>You don't have administrative permissions to manage user roles and permissions.</span>
        </div>
    );

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
                            description="Create roles and assign permissions."
                            onClick={openRoleManagementModal}
                        />
                    </div>

                    <h1 className="text-3xl font-bold mt-8">Users</h1>

                {!hasAdminPermissions && <AdminPermissionsWarning />}

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
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                />
                        </label>
                    </div>
                </div>
                
                {error && (
                    <div className="alert alert-error mb-4">
                        <span>{error}</span>
                    </div>
                )}
            
                {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto mt-8">
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
                                                    disabled={!hasAdminPermissions}
                                                >
                                                    <FaShieldAlt className="mr-1" /> Assign Roles
                                                </button>
                                                <button 
                                                    className={`btn ${user.banned ? "btn-success" : "btn-error"} btn-xs`}
                                                    onClick={() => handleToggleBan(user.id, user.banned)}
                                                    disabled={!hasAdminPermissions}
                                                >
                                                    {user.banned ? "Unban User" : "Ban User"}
                                                </button>
                                            </th>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
        
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-2">
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
            <dialog id="role_management_modal" className="modal">
                <div className="modal-box max-w-4xl">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg mb-4">Role Management</h3>
                    
                    {/* Tabs */}
                    <div className="tabs tabs-boxed mb-4">
                        <button 
                            className={`tab ${roleManagementTab === "create" ? "tab-active" : ""}`}
                            onClick={() => setRoleManagementTab("create")}
                        >
                            <FaPlus className="mr-2" /> Create Role
                        </button>
                        <button 
                            className={`tab ${roleManagementTab === "permissions" ? "tab-active" : ""}`}
                            onClick={() => setRoleManagementTab("permissions")}
                            disabled={allRoles.length === 0}
                        >
                            <FaKey className="mr-2" /> Manage Permissions
                        </button>
                    </div>
                    
                    {/* Create Role Tab */}
                    {roleManagementTab === "create" && (
                        <div className="space-y-4">
                         
                            
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Role Name</span>
                                 
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    placeholder="organizer"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                />
                            </div>
                            
                            <button 
                                className="btn btn-primary w-full" 
                                onClick={handleCreateRole}
                                disabled={!newRoleName}
                            >
                                Create Role
                            </button>
                        </div>
                    )}
                    
                    {/* Manage Permissions Tab */}
                    {roleManagementTab === "permissions" && (
                        <div>
                            {selectedRole ? (
                                <>
                                
                                    
                                    <div className="mb-4">
                                        <label className="label">
                                            <span className="label-text font-bold">Select Role:</span>
                                        </label>
                                        <select 
                                            className="select select-bordered w-full"
                                            value={selectedRole.name}
                                            onChange={handleRoleChange}
                                        >
                                            {allRoles.map(role => (
                                                <option key={role.id} value={role.name}>
                                                    {role.displayName || role.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="overflow-x-auto">
                                        <table className="table table-zebra w-full">
                                            <thead>
                                                <tr>
                                                    <th>Permission Name</th>
                                                    <th>Description</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allPermissions.map(permission => (
                                                    <tr key={permission.id}>
                                                        <td>{permission.displayName || permission.name}</td>
                                                        <td>{permission.description || "No description"}</td>
                                                        <td>
                                                            {roleHasPermission(permission.name) ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="badge badge-success gap-1">
                                                                        <FaCheck size={12} /> Assigned
                                                                    </span>
                                                                    <button 
                                                                        className="btn btn-error btn-xs"
                                                                        onClick={() => handleRemovePermissionFromRole(permission)}
                                                                    >
                                                                        <FaTrash size={12} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button 
                                                                    className="btn btn-primary btn-xs"
                                                                    onClick={() => handleAddPermissionToRole(permission)}
                                                                >
                                                                    <FaPlus size={12} /> Assign
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className="alert alert-warning">
                                    <span>No roles available. Create a role first.</span>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>

            {/* Legacy Role Management Modal */}
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

            {/* Keycloak Role and Permission Management Modal */}
            <dialog id="keycloak_role_modal" className="modal">
                <div className="modal-box max-w-2xl">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg mb-4">Assign Roles to User</h3>
                    
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th>Role Name</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allRoles.map(role => (
                                    <tr key={role.id}>
                                        <td>{role.displayName || role.name}</td>
                                        <td>{role.description || "No description"}</td>
                                        <td>
                                            {userHasRole(selectedUserId, role.name) ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="badge badge-success gap-1">
                                                        <FaCheck size={12} /> Assigned
                                                    </span>
                                                    <button 
                                                        className="btn btn-error btn-xs"
                                                        onClick={() => handleRemoveRole(selectedUserId, role)}
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    className="btn btn-primary btn-xs"
                                                    onClick={() => handleAssignRole(selectedUserId, role)}
                                                >
                                                    <FaPlus size={12} /> Assign
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>
            </div>
        </>
    );
}

