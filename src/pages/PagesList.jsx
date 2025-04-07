import React, { useEffect } from "react";
import { usePages } from "../contexts/PagesContext.jsx";
import { useNavigate } from "react-router-dom";

export function PagesList() {
    const { pages, isLoading, error, getPages, deletePage } = usePages();
    const navigate = useNavigate();

    useEffect(() => {
        getPages();
    }, []);

    const handleEdit = (page) => {
        const pageTitleSlug = encodeURIComponent(page.title);
        console.log("Page title slug:", pageTitleSlug);
        navigate(`/instantiate/eventmaker/edit-page/${pageTitleSlug}`);
    };

    const handleDelete = async (pageId) => {
        if (window.confirm("Are you sure you want to delete this page?")) {
            await deletePage(pageId);
        }
    };

    const handleCreate = () => {
        navigate("/instantiate/eventmaker/create-page"); // Navigate to the create page route
    };

    return (
        <div className="w-full min-h-svh p-8">
            <h1 className="text-3xl font-bold mb-4">Pages</h1>

            <div className="mb-4">
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                    Create Page
                </button>
            </div>

            {isLoading && <p>Loading pages...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <ul className="space-y-4">
                {pages.map((page) => (
                    <li
                        key={page.id}
                        className="p-4 border border-gray-300 rounded-md shadow-sm"
                    >
                        <h2 className="text-xl font-semibold">{page.title}</h2>
                        <div className="flex space-x-4 mt-2">
                            <button
                                onClick={() => handleEdit(page)} // Pass the page object to the editor
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(page.id)} // Pass the page ID to delete
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}