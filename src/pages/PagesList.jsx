import React, { useEffect, useState } from "react";
import { usePages } from "../contexts/PagesContext.jsx";
import { useNavigate } from "react-router-dom";
import {FaEdit, FaTrash, FaPlus, FaSearch} from "react-icons/fa";
import { useNotification } from "../contexts/NotificationContext";
import { axiosWithAuth } from "../utils/axiosWithAuth";
import { useKeycloak } from "@react-keycloak/web";
import { useTranslation } from "react-i18next";
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal.jsx';
import { useMenus } from "../contexts/MenuContext.jsx";

export function PagesList() {
    const { t } = useTranslation();
    const { pages, isLoading, error, getPages, deletePage, togglePageEnabled, savePage } = usePages();
    const { deleteMenuOption, getMenuOptions } = useMenus();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const { keycloak } = useKeycloak();

    const [searchTerm, setSearchTerm] = useState("");
    const [filterEnabled, setFilterEnabled] = useState("all"); // "all", "enabled", "disabled"
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    
    // Add these states for delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingPageId, setDeletingPageId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        getPages();
    }, []);

    const handleEdit = (page) => {
        const pageTitleSlug = encodeURIComponent(page.title);
        navigate(`/instantiate/application/pages/edit-page/${pageTitleSlug}`);
    };

    const handleDelete = (pageId) => {
        setDeletingPageId(pageId);
        setIsDeleteModalOpen(true);
    };
    
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingPageId(null);
    };
    
    const confirmDelete = async () => {
        if (!deletingPageId) return;
    
        setIsDeleting(true);
        try {
            const pageToDelete = pages.find(page => page.page_id === deletingPageId);
            if (!pageToDelete) {
                showNotification(t('pagesList.actions.deleteError'), "error");
                return;
            }
            await deletePage(deletingPageId);

            const menuOptions = await getMenuOptions();
            const menuOption = menuOptions.find(opt => opt.label === pageToDelete.title);
            
            if (menuOption) {
                await deleteMenuOption(menuOption.id);
            }

            showNotification(t('pagesList.actions.deleteSuccess'), "success");
    
            // Refresh the pages list
            await getPages();
    
            // Check if the current page is empty after deletion
            const totalPagesAfterDeletion = Math.ceil((pages.length - 1) / itemsPerPage);
            if (currentPage > totalPagesAfterDeletion) {
                setCurrentPage(totalPagesAfterDeletion); // Redirect to the previous page
            }
        } catch (error) {
            console.error("Error deleting page:", error);
    
            // Show a more specific error message if possible
            const errorMessage = error?.message || t('pagesList.actions.deleteError');
            showNotification(errorMessage, "error");
        } finally {
            setIsDeleting(false);
            closeDeleteModal();
        }
    };

    const handleToggleEnabled = async (pageId, isEnabled) => {
        try {
            const page = pages.find(p => p.page_id === pageId);
            if (!page) return;

            await togglePageEnabled(pageId, isEnabled);

            const axiosInstance = axiosWithAuth(keycloak);

            if (isEnabled) {
                // Create menu option when enabling
                const menuOption = {
                    icon: "FaFile",
                    label: page.title,
                    href: page.title.toLowerCase().replace(/\s+/g, '-')
                };

                await axiosInstance.post(
                    `${import.meta.env.VITE_API_BASE_URL}/ui/menu/option`,
                    menuOption
                );
            } else {
                // Get menu options and find the one with matching label
                const { data: menu } = await axiosInstance.get(
                    `${import.meta.env.VITE_API_BASE_URL}/ui/menu`
                );

                const menuOption = menu.options.find(opt => opt.label === page.title);
                if (menuOption) {
                    // Remove menu option by ID
                    await axiosInstance.delete(
                        `${import.meta.env.VITE_API_BASE_URL}/ui/menu/option/${menuOption.id}`
                    );
                }
            }

            showNotification(
                t('pagesList.actions.toggleSuccess', { status: isEnabled ? t('pagesList.status.enabled') : t('pagesList.status.disabled') }),
                "success"
            );
        } catch (error) {
            console.error("Error toggling page status:", error);
            const errorMessage = error?.message || t('pagesList.actions.toggleError', { action: isEnabled ? 'enable' : 'disable' });
            showNotification(errorMessage, "error");

            // Refresh the page list to ensure UI consistency
            getPages();
        }
    };

    const handleCreate = () => {
        navigate("create-page");
    };

    const handleClone = async (page) => {
        try {
            // Create a new page with the same content
            const clonedPageData = {
                title: `${page.title} (Copy)`,
                components: page.components,
                enabled: false // Start as disabled
            };

            await savePage(clonedPageData);
            showNotification(t('pagesList.actions.cloneSuccess'), "success");
            getPages();
        } catch (error) {
            console.error("Error cloning page:", error);
            const errorMessage = error?.message || t('pagesList.actions.cloneError');
            showNotification(errorMessage, "error");
        }
    };

    const filteredPages = pages.filter(page => {
        // Apply search filter
        const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase());

        // Apply enabled/disabled filter
        const matchesEnabled =
            filterEnabled === "all" ||
            (filterEnabled === "enabled" && page.enabled) ||
            (filterEnabled === "disabled" && !page.enabled);

        return matchesSearch && matchesEnabled;
    });

    const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
    const paginatedPages = filteredPages.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="w-full min-h-svh p-2 lg:p-8">
            <h1 className="text-3xl font-bold my-8">{t('pagesList.title')}</h1>

            <div className="mb-4">
                <button
                    onClick={handleCreate}
                    className="btn btn-primary flex items-center gap-2 px-4 py-2 text-white rounded-xl"
                >
                    <FaPlus />
                    {t('pagesList.createButton')}
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <label className="input input-bordered rounded-xl flex items-center gap-2">
                    <FaSearch className="text-gray-400"/>
                    <input
                        type="text"
                        placeholder={t('pagesList.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="grow"
                    />
                </label>
                <div className="filter">
                    <input className="btn rounded-xl filter-reset" type="radio" name="metaframeworks" value="all" onClick={(e) => setFilterEnabled(e.target.value)} aria-label="All"/>
                    <input className="btn btn-secondary rounded-xl" type="radio" name="metaframeworks" value="enabled" onClick={(e) => setFilterEnabled(e.target.value)} aria-label={t('pagesList.filters.enabled')}/>
                    <input className="btn btn-secondary rounded-xl" type="radio" name="metaframeworks" value="disabled" onClick={(e) => setFilterEnabled(e.target.value)} aria-label={t('pagesList.filters.disabled')}/>
                </div>
            </div>

            {isLoading && <p>{t('pagesList.loading')}</p>}
            {error && <p className="text-red-500">{t('pagesList.error')}</p>}

            {!isLoading && pages.length === 0 && (
                <div
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">{t('pagesList.emptyState.title')}</h3>
                    <p className="text-gray-500 text-center mb-4">{t('pagesList.emptyState.description.default')}</p>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        <FaPlus />
                        {t('pagesList.emptyState.createFirstPage')}
                    </button>
                </div>
            )}

            <ul className="space-y-4">
                {paginatedPages.map((page, index) => (
                    <li
                        key={page.page_id || index}
                        className={`p-4 border border-gray-300 rounded-xl ${!page.enabled ? 'bg-gray-50' : ''
                            }`}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-semibold">{page.title}</h2>
                                    <span className={`text-xs px-2 py-1 rounded-full ${page.enabled
                                        ? 'bg-green-800 text-white '
                                        : 'bg-secondary/70 text-white '
                                        }`}>
                                        {page.enabled ? t('pagesList.status.enabled') : t('pagesList.status.disabled')}
                                    </span>
                                </div>
                                <p className="text-gray-500">{page.description || t('pagesList.table.description')}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700">{t('pagesList.table.status')}</span>
                                    <input
                                        type="checkbox"
                                        checked={page.enabled}
                                        onChange={(e) => handleToggleEnabled(page.page_id, e.target.checked)}
                                        className="toggle toggle-primary"
                                    />
                                </label>
                                <button
                                    onClick={() => handleEdit(page)}
                                    className="text-gray-500 hover:text-primary p-2 rounded-full"
                                    title={t('pagesList.actions.edit')}
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDelete(page.page_id)}
                                    className="text-gray-500 hover:text-primary p-2 rounded-full"
                                    title={t('pagesList.actions.delete')}
                                >
                                    <FaTrash />
                                </button>
                                <button
                                    onClick={() => handleClone(page)}
                                    className="text-gray-500 hover:text-primary p-2 rounded-full"
                                    title={t('pagesList.actions.clone')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {filteredPages.length > itemsPerPage && (
                <div className="flex justify-center mt-6">
                    <div className="join">
                        <button
                            className="join-item btn"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            «
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                            <button
                                key={`page-${pageNumber}`}
                                className={`join-item btn ${currentPage === pageNumber ? 'btn-active' : ''}`}
                                onClick={() => setCurrentPage(pageNumber)}
                            >
                                {pageNumber}
                            </button>
                        ))}

                        <button
                            className="join-item btn"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            »
                        </button>
                    </div>
                </div>
            )}

            {/* Add the DeleteConfirmationModal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title={t('pagesList.actions.delete')}
                message={t('pagesList.actions.deleteConfirm')}
                isLoading={isDeleting}
            />
        </div>
    );
}