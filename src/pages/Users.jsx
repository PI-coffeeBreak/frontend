import React, { useState, useEffect } from "react";
import { useUsers } from "../contexts/UsersContext";
import { useKeycloak } from "@react-keycloak/web";
import { useTranslation } from "react-i18next";
import Pagination from "../components/Pagination.jsx";
import CreateCard from "../components/CreateCard.jsx";
import { FaUsers, FaUser, FaUsersCog, FaPlus, FaTrash, FaCheck, FaLock, FaShieldAlt, FaKey, FaExclamationTriangle } from "react-icons/fa";
import KeycloakAdminService from "../services/KeycloakAdminService";
import { UserExcelImport } from "../components/users/UserExcelImport";
import { generateRandomPassword } from "../utils/passwordUtils";

export default function Users() {
    const { t } = useTranslation();
    const { keycloak } = useKeycloak();
    const hasAdminPermissions = KeycloakAdminService.hasAdminPermissions(keycloak);
    const hasRoleManagementPermissions = KeycloakAdminService.hasRoleManagementPermissions(keycloak);

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
        removePermissionFromRole,
        // User creation function
        createUser,
        createMultipleUsers
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
    const [roleCreationError, setRoleCreationError] = useState("");

    // Role permissions management state
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedRolePermissions, setSelectedRolePermissions] = useState([]);

    // User creation form state
    const [newUserData, setNewUserData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        role: "Participant", // Default role
        temporaryPassword: ""
    });
    const [formErrors, setFormErrors] = useState({});
    const [createSuccess, setCreateSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Excel import state
    const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
    const [importStats, setImportStats] = useState(null);

    // Calculate password strength
    const calculatePasswordStrength = (password) => {
        if (!password) return 0;

        let strength = 0;

        // Length check
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;

        // Complexity checks
        if (/[A-Z]/.test(password)) strength += 1; // Has uppercase
        if (/[a-z]/.test(password)) strength += 1; // Has lowercase
        if (/[0-9]/.test(password)) strength += 1; // Has number
        if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Has special char

        return Math.min(5, strength); // Maximum strength of 5
    };

    // Get strength description
    const getPasswordStrengthText = (strength) => {
        switch (strength) {
            case 0: return "Very Weak";
            case 1: return "Weak";
            case 2: return "Fair";
            case 3: return "Good";
            case 4: return "Strong";
            case 5: return "Very Strong";
            default: return "";
        }
    };

    // Get strength color
    const getPasswordStrengthColor = (strength) => {
        switch (strength) {
            case 0: return "bg-red-500";
            case 1: return "bg-red-400";
            case 2: return "bg-yellow-500";
            case 3: return "bg-yellow-400";
            case 4: return "bg-green-500";
            case 5: return "bg-green-600";
            default: return "bg-gray-300";
        }
    };

    // Calculate current password strength
    const passwordStrength = calculatePasswordStrength(newUserData.temporaryPassword);
    const strengthText = getPasswordStrengthText(passwordStrength);
    const strengthColor = getPasswordStrengthColor(passwordStrength);

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

        setRoleCreationError("");
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
            if (error.response?.status === 403) {
                setRoleCreationError("Permission denied. You don't have sufficient privileges to create roles.");
            } else if (error.response?.data?.errorMessage) {
                setRoleCreationError(error.response.data.errorMessage);
            } else {
                setRoleCreationError("Failed to create role. Please try again later.");
            }
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
            <span>{t('users.adminPermissionsWarning')}</span>
        </div>
    );

    // Open user creation modal
    const openUserCreationModal = () => {
        // Get a default role to reset the form
        const defaultRole = allRoles.length > 0
            ? (allRoles.find(r => r.name === "Participant" || r.name === "cb-attendee")?.name || allRoles[0].name)
            : "Participant";

        // Reset form and clear input fields after successful creation
        setNewUserData({
            firstName: "",
            lastName: "",
            email: "",
            role: defaultRole,
            temporaryPassword: ""
        });
        setFormErrors({});
        setCreateSuccess(false);
        document.getElementById('create_user_modal').showModal();
    };

    // Handle input change for user creation form
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Debug log for role selection
        if (name === 'role') {
            console.log(`Role selected: ${value}`);
        }

        setNewUserData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear any errors for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // Import isValidEmail function or add it directly
    const isValidEmail = (email) => {
        if (!email) return false;
        return email.includes('@') && email.includes('.');
    };

    // Validate user creation form
    const validateUserForm = () => {
        const errors = {};

        if (!newUserData.firstName) {
            errors.firstName = "First name is required";
        }

        if (!newUserData.lastName) {
            errors.lastName = "Last name is required";
        }

        if (!newUserData.email) {
            errors.email = "Email is required";
        } else if (!isValidEmail(newUserData.email)) {
            errors.email = "Email is invalid. An email address must have an @-sign.";
        }

        if (!newUserData.temporaryPassword) {
            errors.temporaryPassword = "Temporary password is required";
        } else if (newUserData.temporaryPassword.length < 8) {
            errors.temporaryPassword = "Password must be at least 8 characters";
        }

        return errors;
    };

    // Handle user creation form submission
    const handleCreateUser = async (e) => {
        e.preventDefault();

        // Validate form
        const errors = validateUserForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        console.log("Submitting user data:", newUserData);

        try {
            const result = await createUser(newUserData);
            setCreateSuccess(true);

            // Get a default role to reset the form
            const defaultRole = allRoles.length > 0
                ? (allRoles.find(r => r.name === "Participant" || r.name === "cb-attendee")?.name || allRoles[0].name)
                : "Participant";

            // Reset form and clear input fields after successful creation
            setNewUserData({
                firstName: "",
                lastName: "",
                email: "",
                role: defaultRole,
                temporaryPassword: ""
            });

            // Close modal after a delay
            setTimeout(() => {
                document.getElementById('create_user_modal').close();
                setCreateSuccess(false);
            }, 2000);
        } catch (error) {
            console.error("Error creating user:", error);

            // Show specific error if it's an API validation error
            if (error.response?.data?.detail) {
                const apiError = error.response.data.detail;
                const newErrors = {};

                // Handle email validation errors from the API
                if (apiError.some(err => err.loc?.includes("email"))) {
                    const emailError = apiError.find(err => err.loc?.includes("email"));
                    newErrors.email = emailError.msg || "Invalid email format";
                }

                // Set the form errors
                if (Object.keys(newErrors).length > 0) {
                    setFormErrors(prev => ({ ...prev, ...newErrors }));
                } else {
                    // Set a general error if we can't parse the specific fields
                    setFormErrors(prev => ({
                        ...prev,
                        submit: "Failed to create user. Please check your input and try again."
                    }));
                }
            } else {
                // Generic error handling
                setFormErrors(prev => ({
                    ...prev,
                    submit: error.message || "Failed to create user. Please try again later."
                }));
            }
        }
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Generate a random password and update state
    const handleGeneratePassword = () => {
        const password = generateRandomPassword();
        setNewUserData(prev => ({
            ...prev,
            temporaryPassword: password
        }));

        // Show password when generated
        setShowPassword(true);
    };

    // Open Excel import modal
    const openExcelImportModal = () => {
        setIsExcelImportOpen(true);
    };

    // Close Excel import modal
    const closeExcelImportModal = () => {
        setIsExcelImportOpen(false);
        setImportStats(null);
    };

    // Handle Excel import
    const handleImportUsers = async (userData) => {
        try {
            const results = await createMultipleUsers(userData);
            setImportStats(results);
            return results;
        } catch (error) {
            console.error("Error importing users from Excel:", error);
            throw error;
        }
    };

    return (
        <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">{t('users.title')}</h1>
                <p className="text-lg text-base-content/70 mb-8">{t('users.subtitle')}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <CreateCard
                        icon={FaUsers}
                        title={t('users.import.title')}
                        description={t('users.import.description')}
                        onClick={openExcelImportModal}
                    />
                    <CreateCard
                        icon={FaUser}
                        title={t('users.create.title')}
                        description={t('users.create.description')}
                        onClick={openUserCreationModal}
                    />
                    <CreateCard
                        icon={FaUsersCog}
                        title={t('users.manageRoles.title')}
                        description={t('users.manageRoles.description')}
                        onClick={openRoleManagementModal}
                    />
                </div>

                {/* Import stats display */}
                {importStats && (
                    <div className={`alert ${importStats.failed > 0 ? 'alert-warning' : 'alert-success'} mt-4 sm:mt-6`}>
                        <div>
                            <h3 className="font-bold">{t('users.import.results')}</h3>
                            <div className="text-sm">
                                {t('users.import.success', { success: importStats.success, total: importStats.total })}
                                {importStats.failed > 0 && (
                                    <p>{t('users.import.failed', { failed: importStats.failed })}</p>
                                )}
                            </div>
                        </div>
                        <button
                            className="btn btn-sm"
                            onClick={() => setImportStats(null)}
                        >
                            {t('common.dismiss')}
                        </button>
                    </div>
                )}

                <h1 className="text-2xl sm:text-3xl font-bold mt-6 lg:mt-8">{t('users.list.title')}</h1>

                {!hasAdminPermissions && <AdminPermissionsWarning />}

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="w-full sm:w-auto">
                        <label htmlFor="searchUsers" className="sr-only">{t('users.searchLabel')}</label>
                        <div className="input w-full">
                            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.3-4.3"></path>
                                </g>
                            </svg>
                            <input
                                id="searchUsers"
                                type="text"
                                className="grow"
                                placeholder={t('users.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
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
                        <div className="overflow-x-auto mt-4">
                            <table className="table table-sm sm:table-md">
                                <thead>
                                    <tr>
                                        <th>{t('users.table.name')}</th>
                                        <th>{t('users.table.email')}</th>
                                        <th>{t('users.table.role')}</th>
                                        <th>{t('users.table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.map(user => (
                                        <tr key={user.id} className={user.banned ? "bg-error bg-opacity-10" : ""}>
                                            <td>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="avatar">
                                                        <div className="mask mask-squircle w-8 h-8 sm:w-12 sm:h-12">
                                                            <img
                                                                src={user.avatar ? user.avatar : "/placeholder.jpg"}
                                                                alt={`${t('users.avatar')} ${user.firstName}`}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm sm:text-base">{user.firstName} {user.lastName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-sm sm:text-base">{user.email}</td>
                                            <td>
                                                {user.roles ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.map((role) => (
                                                            <div key={`${user.id}-${role}`} className="badge badge-primary badge-sm sm:badge-md">
                                                                {role}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="badge badge-primary badge-sm sm:badge-md">{user.role || t('users.noRole')}</div>
                                                )}
                                            </td>
                                            <th>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <button
                                                        className="btn btn-secondary btn-xs sm:btn-sm whitespace-nowrap"
                                                        onClick={() => openRoleModal(user.id, user.role)}
                                                        disabled={!hasAdminPermissions}
                                                    >
                                                        <FaShieldAlt className="hidden sm:inline mr-1" /> {t('users.actions.assignRoles')}
                                                    </button>
                                                    <button
                                                        className={`btn ${user.banned ? "btn-success" : "btn-error"} btn-xs sm:btn-sm whitespace-nowrap`}
                                                        onClick={() => handleToggleBan(user.id, user.banned)}
                                                        disabled={!hasAdminPermissions}
                                                    >
                                                        {user.banned ? t('users.actions.unbanUser') : t('users.actions.banUser')}
                                                    </button>
                                                </div>
                                            </th>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-4">
                                <div className="join">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={`page-${i + 1}`}
                                            className={`join-item btn btn-xs sm:btn-sm ${currentPage === i + 1 ? "btn-active" : ""}`}
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
                        <h3 className="font-bold text-lg mb-4">{t('users.manageRoles.title')}</h3>

                        {/* Tabs */}
                        <div className="tabs tabs-boxed mb-4">
                            <button
                                className={`tab ${roleManagementTab === "create" ? "tab-active" : ""}`}
                                onClick={() => setRoleManagementTab("create")}
                            >
                                <FaPlus className="mr-2" /> {t('users.manageRoles.create')}
                            </button>
                            <button
                                className={`tab ${roleManagementTab === "permissions" ? "tab-active" : ""}`}
                                onClick={() => setRoleManagementTab("permissions")}
                                disabled={allRoles.length === 0}
                            >
                                <FaKey className="mr-2" /> {t('users.manageRoles.permissions')}
                            </button>
                        </div>

                        {/* Create Role Tab */}
                        {roleManagementTab === "create" && (
                            <div className="space-y-4">
                                {!hasRoleManagementPermissions && (
                                    <div className="alert alert-warning">
                                        <FaExclamationTriangle />
                                        <span>{t('users.manageRoles.permissionsWarning')}</span>
                                    </div>
                                )}

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">{t('users.manageRoles.roleName')}</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        placeholder={t('users.manageRoles.roleNamePlaceholder')}
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                    />
                                </div>

                                {roleCreationError && (
                                    <div className="alert alert-error">
                                        <span>{roleCreationError}</span>
                                    </div>
                                )}

                                <button
                                    className="btn btn-primary w-full"
                                    onClick={handleCreateRole}
                                    disabled={!newRoleName}
                                >
                                    {t('users.manageRoles.createRole')}
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
                                                <span className="label-text font-bold">{t('users.manageRoles.selectRole')}</span>
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
                                                        <th>{t('users.manageRoles.permissionName')}</th>
                                                        <th>{t('users.manageRoles.description')}</th>
                                                        <th>{t('users.manageRoles.actions')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allPermissions.map(permission => (
                                                        <tr key={permission.id}>
                                                            <td>{permission.displayName || permission.name}</td>
                                                            <td>{permission.description || t('users.manageRoles.noDescription')}</td>
                                                            <td>
                                                                {roleHasPermission(permission.name) ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="badge badge-success gap-1">
                                                                            <FaCheck size={12} /> {t('users.manageRoles.assigned')}
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
                                                                        <FaPlus size={12} /> {t('users.manageRoles.assign')}
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
                                        <span>{t('users.manageRoles.noRoles')}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="modal-action">
                            <form method="dialog">
                                <button className="btn">{t('common.close')}</button>
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

                {/* User Creation Modal */}
                <dialog id="create_user_modal" className="modal">
                    <div className="modal-box max-w-xl">
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h3 className="font-bold text-lg mb-4">{t('users.create.title')}</h3>

                        {createSuccess && (
                            <div className="alert alert-success mb-4">
                                <FaCheck className="h-6 w-6" />
                                <span>{t('users.create.success')}</span>
                            </div>
                        )}

                        {formErrors.submit && (
                            <div className="alert alert-error mb-4">
                                <FaExclamationTriangle className="h-6 w-6" />
                                <span>{formErrors.submit}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateUser}>
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">{t('users.create.firstName')}</span>
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    className={`input input-bordered w-full ${formErrors.firstName ? 'input-error' : ''}`}
                                    value={newUserData.firstName}
                                    onChange={handleInputChange}
                                />
                                {formErrors.firstName && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{formErrors.firstName}</span>
                                    </label>
                                )}
                            </div>

                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">{t('users.create.lastName')}</span>
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    className={`input input-bordered w-full ${formErrors.lastName ? 'input-error' : ''}`}
                                    value={newUserData.lastName}
                                    onChange={handleInputChange}
                                />
                                {formErrors.lastName && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{formErrors.lastName}</span>
                                    </label>
                                )}
                            </div>

                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">{t('users.create.email')}</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    className={`input input-bordered w-full ${formErrors.email ? 'input-error' : ''}`}
                                    value={newUserData.email}
                                    onChange={handleInputChange}
                                />
                                {formErrors.email && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{formErrors.email}</span>
                                    </label>
                                )}
                            </div>

                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">{t('users.create.role')}</span>
                                </label>
                                <select
                                    name="role"
                                    className="select select-bordered w-full"
                                    value={newUserData.role}
                                    onChange={handleInputChange}
                                >
                                    {allRoles.length > 0 ? (
                                        allRoles.map(role => (
                                            <option key={role.id} value={role.name}>
                                                {role.displayName || role.name}
                                            </option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="Participant">{t('users.roles.participant')}</option>
                                            <option value="Speaker">{t('users.roles.speaker')}</option>
                                            <option value="Staff">{t('users.roles.staff')}</option>
                                            <option value="Organizer">{t('users.roles.organizer')}</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">{t('users.create.temporaryPassword')}</span>
                                </label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="temporaryPassword"
                                        className={`input input-bordered w-full ${formErrors.temporaryPassword ? 'input-error' : ''}`}
                                        value={newUserData.temporaryPassword}
                                        onChange={handleInputChange}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-square"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? t('users.create.hidePassword') : t('users.create.showPassword')}
                                    </button>
                                </div>

                                {/* Password strength indicator */}
                                {newUserData.temporaryPassword && (
                                    <div className="mt-2">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm">{t('users.create.passwordStrength')}: {strengthText}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${strengthColor}`}
                                                style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {formErrors.temporaryPassword && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{formErrors.temporaryPassword}</span>
                                    </label>
                                )}
                                <div className="flex justify-between items-center mt-2">
                                    <label className="label">
                                        <span className="label-text-alt">{t('users.create.passwordChangeNote')}</span>
                                    </label>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-secondary"
                                        onClick={handleGeneratePassword}
                                    >
                                        {t('users.create.generatePassword')}
                                    </button>
                                </div>
                            </div>

                            <div className="modal-action">
                                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                    {isLoading ? <span className="loading loading-spinner"></span> : <FaUser className="mr-2" />}
                                    {t('users.create.createUser')}
                                </button>
                                <button type="button" className="btn" onClick={() => document.getElementById('create_user_modal').close()}>
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </dialog>

                {/* Excel Import Modal */}
                <UserExcelImport
                    isOpen={isExcelImportOpen}
                    onClose={closeExcelImportModal}
                    onImport={handleImportUsers}
                />
            </div>
        </div>
    );
}

