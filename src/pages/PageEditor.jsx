import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "../components/SortableItem";
import { useComponents } from "../contexts/ComponentsContext";
import { usePages } from "../contexts/PagesContext";
import { useNotification } from "../contexts/NotificationContext";
import { Title, Text, Button, Image } from "../components/Components";

export function PageEditor({ mode }) {
    const { pageTitle } = useParams();
    const navigate = useNavigate();
    const { pages, getPages, savePage, updatePage, isLoading: isPagesLoading, error: pagesError } = usePages();
    const { isLoading: isComponentsLoading, error: componentsError } = useComponents();
    const { showNotification } = useNotification();

    const [page, setPage] = useState(mode === "create" ? { title: "" } : null);
    const [sections, setSections] = useState([]);
    const [activeTab, setActiveTab] = useState("editor");

    const getDefaultPropsForComponent = (componentType) => {
        switch (componentType) {
            case "Text":
                return {
                    text: "Default Text",
                    color: "base-content",
                    bold: false,
                    italic: false,
                    underline: false
                };
            case "Title":
                return {
                    text: "Default Title",
                    color: "base-content",
                    bold: false,
                    italic: false,
                    underline: false
                };
            case "Button":
                return {
                    text: "Click Me",
                    URL: "#",
                    METHOD: "GET",
                    backgroundColor: "primary",
                    textColor: "primary-content",
                    disabled: false
                };
            case "Image":
                return {
                    src: "https://via.placeholder.com/150",
                    alt: "Placeholder",
                    className: ""
                };
            default:
                return {};
        }
    };

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
        // Create the page data object
        const pageData = {
            title: page?.title || "New Page",
            components: sections.map((section) => ({
                ...section.componentData.props,
                name: section.componentData.name,
            })),
        };

        // For edit mode, we need to check if anything actually changed
        if (mode === "edit") {
            // Compare current data with original page data
            const originalComponents = page.components || [];
            const componentsEqual = compareComponents(originalComponents, pageData.components);
            
            const originalTitle = pages.find(p => p.page_id === page.page_id)?.title || "";
            const titleEqual = originalTitle === pageData.title;
            
            console.log("Title comparison:", { originalTitle, newTitle: pageData.title, equal: titleEqual });
            
            // If nothing has changed, show a notification and return early
            if (titleEqual && componentsEqual) {
                showNotification("No changes detected", "info");
                return;
            }
        }

        // Ensure the page_id is included for updates
        const dataToSave = mode === "edit" 
            ? { ...pageData, page_id: page.page_id } 
            : pageData;

        const saveOrUpdate = mode === "create" ? savePage : updatePage;
        const successMessage = mode === "create" ? "Page created successfully!" : "Page updated successfully!";
        const errorMessage = mode === "create" ? "Failed to create the page." : "Failed to update the page.";

        saveOrUpdate(mode === "create" ? pageData : page.page_id, dataToSave)
            .then(() => {
                showNotification(successMessage, "success");
                navigate("/instantiate/eventmaker/pages");
            })
            .catch((error) => {
                console.error(errorMessage, error);
                showNotification(errorMessage, "error");
            });
    };

    // Helper function to compare component arrays
    const compareComponents = (originalComponents, newComponents) => {
        // Different lengths means they're definitely not equal
        if (originalComponents.length !== newComponents.length) {
            return false;
        }

        // Check if all components have the same properties
        for (let i = 0; i < originalComponents.length; i++) {
            const original = originalComponents[i];
            const current = newComponents[i];
            
            if (original.name !== current.name) {
                return false;
            }
            
            const originalProps = { ...original };
            const currentProps = { ...current };
            
            delete originalProps.component_id;
            delete originalProps.name;
            delete currentProps.component_id;
            delete currentProps.name;
            
            for (const key in originalProps) {
                if (originalProps[key] !== currentProps[key]) {
                    return false;
                }
            }
            
            for (const key in currentProps) {
                if (originalProps[key] === undefined) {
                    return false;
                }
            }
        }
        
        return true;
    };

    const handleComponentTypeChange = (id, newType) => {
        setSections((prevSections) =>
            prevSections.map((section) =>
                section.id === id
                    ? {
                          ...section,
                          componentData: {
                              name: newType,
                              props: getDefaultPropsForComponent(newType),
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

    const renderComponentPreview = (componentData) => {
        const { name, props } = componentData;

        switch (name) {
            case "Title":
                return <Title {...props} />;
            case "Text":
                return <Text {...props} />;
            case "Button":
                return <Button {...props} />;
            case "Image":
                return <Image {...props} />;
            default:
                return <div>Unknown component type</div>;
        }
    };

    const renderPreview = () => {
        return (
            <div className="space-y-6">
                {/* Theme disclaimer banner */}
                <div className="bg-info/10 border-l-4 border-info p-4 rounded-md mb-6">
                    <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-info mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-medium">Theme Preview</p>
                            <p className="text-sm mt-1">
                                This preview shows components with the current theme colors. 
                                To change theme colors, go to the <a href="/instantiate/eventmaker/colors" className="text-info underline">Colors page</a>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Navigation */}
                {sections.length > 3 && (
                    <div className="bg-base-200 p-3 rounded-lg mb-6">
                        <p className="font-medium mb-2">Quick Navigation:</p>
                        <div className="flex flex-wrap gap-2">
                            {sections.map((section, index) => (
                                <a 
                                    key={section.id} 
                                    href={`#section-${section.id}`}
                                    className="badge badge-outline hover:bg-base-300 cursor-pointer"
                                >
                                    {section.componentData.name} {index + 1}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Preview content */}
                {sections.length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg">
                        <p>No components added yet. Add some components to see the preview.</p>
                    </div>
                ) : (
                    <div className="page-preview max-w-4xl mx-auto bg-base-100 p-6 rounded-lg shadow">
                        <div className="space-y-6">
                            {sections.map((section) => (
                                <div key={section.id} id={`section-${section.id}`} className="preview-item">
                                    {renderComponentPreview(section.componentData)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
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
        <div className="container mx-auto p-4 py-8">
            <div className="bg-base-200 rounded-lg p-4 mb-6 shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {mode === "edit" ? page?.title : "Create New Page"}
                        </h1>
                        <p className="text-sm text-base-content/70 mt-1">
                            {mode === "edit" 
                                ? "Edit your page components and content" 
                                : "Design your new page by adding and arranging components"}
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="badge badge-outline p-3">
                            {mode === "edit" ? "Edit Mode" : "Create Mode"}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6 border-b border-base-300 pb-1">
                <div className="tabs tabs-border inline-flex rounded-t-lg" role="tablist">
                    <button
                        className={`tab tab-lifted px-6 py-3 ${activeTab === "editor" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("editor")}
                        role="tab"
                        aria-selected={activeTab === "editor"}
                        aria-controls="editor-panel"
                        id="editor-tab"
                    >
                        <span className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editor
                        </span>
                    </button>
                    <button
                        className={`tab tab-lifted px-6 py-3 ${activeTab === "preview" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("preview")}
                        role="tab"
                        aria-selected={activeTab === "preview"}
                        aria-controls="preview-panel"
                        id="preview-tab"
                    >
                        <span className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
                        </span>
                    </button>
                </div>
            </div>

            <div
                id="editor-panel"
                role="tabpanel"
                aria-labelledby="editor-tab"
                className={activeTab === "editor" ? "" : "hidden"}
            >
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
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
            </div>

            <div
                id="preview-panel"
                role="tabpanel"
                aria-labelledby="preview-tab"
                className={activeTab === "preview" ? "" : "hidden"}
            >
                {renderPreview()}
            </div>

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
                    className={`btn btn-lg gap-2 px-8 ${
                        isPagesLoading ? "btn-disabled" : "btn-primary"
                    }`}
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
                            {buttonText}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

PageEditor.propTypes = {
    mode: PropTypes.oneOf(["create", "edit"]).isRequired,
};