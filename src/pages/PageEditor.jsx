import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "../components/SortableItem";
import { useComponents } from "../contexts/ComponentsContext";
import { usePages } from "../contexts/PagesContext";
import { useNotification } from "../contexts/NotificationContext";

export function PageEditor({ mode }) {
    const { pageTitle } = useParams();
    const navigate = useNavigate();
    const { pages, getPages, savePage, updatePage, isLoading: isPagesLoading, error: pagesError } = usePages();
    const { isLoading: isComponentsLoading, error: componentsError } = useComponents();
    const { showNotification } = useNotification();

    const [page, setPage] = useState(mode === "create" ? { title: "" } : null);
    const [sections, setSections] = useState([]);

    useEffect(() => {
        if (mode === "edit" && pages.length === 0) {
            getPages();
        }
    }, [pages, getPages, mode]);

    useEffect(() => {
        if (mode === "edit") {
            const decodedTitle = decodeURIComponent(pageTitle);
            const foundPage = pages.find((p) => p.title === decodedTitle);
            if (foundPage) {
                setPage(foundPage);
                const transformedSections = (foundPage.components || []).map((component) => ({
                    id: component.component_id,
                    componentData: {
                        name: component.name,
                        props: { ...component },
                    },
                }));
                setSections(transformedSections);
            } else if (pages.length > 0) {
                navigate("/instantiate/eventmaker/pages");
            }
        }
    }, [pages, pageTitle, navigate, mode]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = sections.findIndex((section) => section.id === active.id);
            const newIndex = sections.findIndex((section) => section.id === over.id);
            setSections((prev) => arrayMove(prev, oldIndex, newIndex));
        }
    };

    const handleSavePage = () => {
        const pageData = {
            title: page?.title || "New Page",
            components: sections.map((section) => ({
                ...section.componentData.props,
                name: section.componentData.name,
            })),
        };

        const saveOrUpdate = mode === "create" ? savePage : updatePage;
        const successMessage = mode === "create" ? "Page created successfully!" : "Page updated successfully!";
        const errorMessage = mode === "create" ? "Failed to create the page." : "Failed to update the page.";

        saveOrUpdate(mode === "create" ? pageData : page.page_id, pageData)
            .then(() => {
                showNotification(successMessage, "success");
                navigate("/instantiate/eventmaker/pages");
            })
            .catch((error) => {
                console.error(errorMessage, error);
                showNotification(errorMessage, "error");
            });
    };

    const handleComponentTypeChange = (id, newType) => {
        setSections((prevSections) =>
            prevSections.map((section) =>
                section.id === id
                    ? {
                          ...section,
                          componentData: {
                              name: newType,
                              props: {},
                          },
                      }
                    : section
            )
        );
    };

    const handleComponentPropsChange = (id, updatedProps) => {
        setSections((prevSections) =>
            prevSections.map((section) =>
                section.id === id
                    ? {
                          ...section,
                          componentData: {
                              ...section.componentData,
                              props: updatedProps,
                          },
                      }
                    : section
            )
        );
    };

    const handleRemoveSection = (id) => {
        setSections((prevSections) => prevSections.filter((section) => section.id !== id));
    };

    const renderSections = () => {
        if (sections.length === 0) {
            return <p className="text-gray-500">No sections added yet. Click "Add New Section" to get started.</p>;
        }

        return sections.map((section) => (
            <SortableItem
                key={section.id}
                id={section.id}
                componentData={section.componentData}
                onComponentTypeChange={handleComponentTypeChange}
                onComponentPropsChange={handleComponentPropsChange}
                onRemove={() => handleRemoveSection(section.id)}
            />
        ));
    };

    if (isPagesLoading || isComponentsLoading) {
        return <p>Loading...</p>;
    }

    if (pagesError || componentsError) {
        return <p className="text-red-500">Error: {pagesError || componentsError}</p>;
    }

    if (mode === "edit" && !page) {
        return <p>Loading page data...</p>;
    }

    const buttonText = mode === "edit" ? "Update Page" : "Save Page";

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">
                        {mode === "edit" ? page?.title : "Create New Page"}
                    </h1>

                    {mode === "create" && (
                        <div className="mb-4">
                            <label htmlFor="page-title" className="block text-sm font-medium text-gray-700">
                                Page Title
                            </label>
                            <input
                                id="page-title"
                                type="text"
                                value={page?.title || ""}
                                onChange={(e) => setPage({ ...page, title: e.target.value })}
                                className="input mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                placeholder="Enter page title"
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        {renderSections()}
                        <button
                            className="flex items-center justify-center p-4 bg-gray-200 rounded-lg hover:bg-gray-300"
                            onClick={() =>
                                setSections((prevSections) => [
                                    ...prevSections,
                                    {
                                        id: (prevSections.length + 1).toString(),
                                        componentData: {
                                            name: "Text",
                                            props: {},
                                        },
                                    },
                                ])
                            }
                        >
                            + Add New Section
                        </button>
                    </div>
                    <button
                        onClick={handleSavePage}
                        className={`btn mt-4 px-6 py-3 rounded-md text-white font-semibold transition-all duration-300 
                        ${
                            isPagesLoading
                                ? "btn-secondary cursor-not-allowed opacity-50"
                                : "btn-primary hover:scale-105 shadow-md hover:shadow-lg"
                        }`}
                        disabled={isPagesLoading}
                    >
                        {isPagesLoading ? (
                            <span className="flex items-center gap-2">
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8H4z"
                                    ></path>
                                </svg>
                                Saving...
                            </span>
                        ) : (
                            buttonText
                        )}
                    </button>
                </div>
            </SortableContext>
        </DndContext>
    );
}

PageEditor.propTypes = {
    mode: PropTypes.oneOf(["create", "edit"]).isRequired,
};