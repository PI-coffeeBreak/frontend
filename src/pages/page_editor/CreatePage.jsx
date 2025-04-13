import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useComponents } from "../../contexts/ComponentsContext";
import { usePages } from "../../contexts/PagesContext";
import { useNotification } from "../../contexts/NotificationContext";
import { componentList } from "../../components/event_maker/pages/components";
import { DynamicComponentConfiguration } from "../../components/event_maker/pages/DynamicComponentConfiguration";
import { useKeycloak } from "@react-keycloak/web";
import { axiosWithAuth } from "../../utils/axiosWithAuth";

export function CreatePage() {
    const navigate = useNavigate();
    const { keycloak } = useKeycloak();
    const { savePage, isLoading: isPagesLoading } = usePages();
    const { getDefaultPropsForComponent, isLoading: isComponentsLoading } = useComponents();
    const { showNotification } = useNotification();

    const [page, setPage] = useState({ title: "" });
    const [sections, setSections] = useState([]);
    const [activeTab, setActiveTab] = useState("editor");

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = sections.findIndex((section) => section.id === active.id);
            const newIndex = sections.findIndex((section) => section.id === over.id);
            setSections((prev) => arrayMove(prev, oldIndex, newIndex));
        }
    };

    const handleSavePage = async () => {
        try {
            const pageData = {
                title: page.title || "New Page",
                components: sections.map((section) => ({
                    ...section.componentData.props,
                    name: section.componentData.name,
                })),
            };

            // Save the page first
            await savePage(pageData);

            // Create menu option for the new page
            const menuOption = {
                icon: "FaFile", // Default icon for pages
                label: pageData.title,
                href: pageData.title.toLowerCase().replace(/\s+/g, '-') // Convert title to URL-friendly format
            };

            const axiosInstance = axiosWithAuth(keycloak);
            await axiosInstance.post(
                `${import.meta.env.VITE_API_BASE_URL}/ui/menu/option`,
                menuOption
            );

            showNotification("Page and menu option created successfully!", "success");
            navigate("/instantiate/eventmaker/pages");
        } catch (error) {
            console.error("Failed to create the page or menu option.", error);
            showNotification("Failed to create the page or menu option.", "error");
        }
    };

    const handleComponentTypeChange = (id, newType) => {
        const component = componentList.find(c => c.name === newType);
        if (!component) return;

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
            return (
                <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-base-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    <p className="text-base-content/70 text-lg font-medium">No sections added yet</p>
                    <p className="text-base-content/50 mt-2 max-w-md mx-auto">
                        Start building your page by clicking "Add New Section" below to add content components.
                    </p>
                </div>
            );
        }

        return sections.map((section) => (
            <DynamicComponentConfiguration
                key={section.id}
                id={section.id}
                componentData={section.componentData}
                onComponentTypeChange={handleComponentTypeChange}
                onComponentPropsChange={handleComponentPropsChange}
                onRemove={() => handleRemoveSection(section.id)}
            />
        ));
    };

    if (isComponentsLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="container mx-auto p-4 py-8">
            <div className="bg-base-200 rounded-lg p-4 mb-6 shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Create New Page</h1>
                        <p className="text-sm text-base-content/70 mt-1">
                            Design your new page by adding and arranging components
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="badge badge-outline p-3">Create Mode</div>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="page-title" className="block text-sm font-medium text-gray-700">
                    Page Title
                </label>
                <input
                    id="page-title"
                    type="text"
                    value={page.title}
                    onChange={(e) => setPage({ ...page, title: e.target.value })}
                    className="input mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="Enter page title"
                />
            </div>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                        {renderSections()}
                        <button
                            className="flex items-center justify-center gap-2 w-full p-5 border-2 border-dashed border-base-300 rounded-lg 
                            hover:bg-base-200 transition-all duration-200 font-medium text-base-content/80"
                            onClick={() => {
                                const componentType = "Text";
                                setSections((prevSections) => [
                                    ...prevSections,
                                    {
                                        id: (prevSections.length + 1).toString(),
                                        componentData: {
                                            name: componentType,
                                            props: getDefaultPropsForComponent(componentType),
                                        },
                                    },
                                ]);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Section
                        </button>
                    </div>
                </SortableContext>
            </DndContext>

            <div className="mt-8 flex justify-between items-center">
                <button
                    onClick={() => navigate("/instantiate/eventmaker/pages")}
                    className="btn btn-outline gap-2 px-6"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Pages
                </button>

                <button
                    onClick={handleSavePage}
                    className={`btn btn-lg gap-2 px-8 ${isPagesLoading ? "btn-disabled" : "btn-primary"}`}
                    disabled={isPagesLoading}
                >
                    {isPagesLoading ? (
                        <span className="flex items-center gap-2">
                            <svg
                                className="animate-spin h-5 w-5"
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
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save Page
                        </>
                    )}
                </button>
            </div>
        </div>
    );
} 