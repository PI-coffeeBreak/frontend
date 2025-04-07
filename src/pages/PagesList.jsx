import React, { useEffect } from "react";
import { usePages } from "../contexts/PagesContext.jsx";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

export function PagesList() {
    const { pages, isLoading, error, getPages, deletePage, togglePageEnabled } = usePages();
    const navigate = useNavigate();

    useEffect(() => {
        getPages();
    }, []);

    const handleEdit = (page) => {
        const pageTitleSlug = encodeURIComponent(page.title);
        navigate(`/instantiate/eventmaker/edit-page/${pageTitleSlug}`);
    };

    const handleDelete = async (pageId) => {
        if (window.confirm("Are you sure you want to delete this page?")) {
            await deletePage(pageId);
        }
    };

    const handleToggleEnabled = async (pageId, isEnabled) => {
        await togglePageEnabled(pageId, isEnabled);
    };

    const handleCreate = () => {
        navigate("/instantiate/eventmaker/create-page");
    };

    return (
        <div className="w-full min-h-svh p-8">
            <h1 className="text-3xl font-bold mb-4">Pages</h1>

            <div className="mb-4">
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    <FaPlus />
                    Create Page
                </button>
            </div>

            {isLoading && <p>Loading pages...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <ul className="space-y-4">
                {pages.map((page) => (
                    <li
                        key={page.id}
                        className="p-4 border border-gray-300 rounded-md shadow-sm hover:shadow-lg transition-shadow"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">{page.title}</h2>
                            <div className="flex items-center space-x-2">
                                <label className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700">Enabled</span>
                                    <input
                                        type="checkbox"
                                        checked={page.enabled}
                                        onChange={(e) => handleToggleEnabled(page.id, e.target.checked)}
                                        className="toggle toggle-primary"
                                    />
                                </label>
                                <button
                                    onClick={() => handleEdit(page)}
                                    className="text-gray-500 hover:text-blue-500 p-2 rounded-full"
                                    title="Edit Page"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDelete(page.id)}
                                    className="text-gray-500 hover:text-red-500 p-2 rounded-full"
                                    title="Delete Page"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}