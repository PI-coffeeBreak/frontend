import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "../components/SortableItem";
import { useComponents } from "../contexts/ComponentsContext";
import { usePages } from "../contexts/PagesContext";

export function PageEditor({ mode }) {
    const { pageTitle } = useParams();
    const navigate = useNavigate();
    const { pages, getPages, savePage, updatePage, isLoading: isPagesLoading, error: pagesError } = usePages();
    const { isLoading: isComponentsLoading, error: componentsError } = useComponents();

    const [page, setPage] = useState(mode === "create" ? { title: "" } : null); // Initialize title for "create" mode
    const [sections, setSections] = useState([]);

    useEffect(() => {
        if (mode === "edit") {
            // Fetch pages if not already loaded
            if (pages.length === 0) {
                getPages();
            }
        }
    }, [pages, getPages, mode]);

    useEffect(() => {
        if (mode === "edit") {
            // Find the page data by title
            const decodedTitle = decodeURIComponent(pageTitle);
            const foundPage = pages.find((p) => p.title === decodedTitle);
            if (foundPage) {
                setPage(foundPage);

                // Transform sections to match the expected format
                const transformedSections = (foundPage.components || []).map((component) => ({
                    id: component.component_id, // Use component_id as the unique ID
                    componentData: {
                        name: component.name,
                        props: { ...component }, // Pass the rest of the component properties as props
                    },
                }));

                setSections(transformedSections);
                console.log("Transformed Sections:", transformedSections);
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
            title: page?.title || "New Page", // Use the title from the page or a default title
            components: sections.map((section) => ({
                ...section.componentData.props,
                name: section.componentData.name,
            })),
        };

        if (mode === "create") {
            savePage(pageData)
                .then(() => {
                    console.log("Page created successfully");
                    navigate("/instantiate/eventmaker/pages"); // Redirect to the pages list after saving
                })
                .catch((error) => {
                    console.error("Error creating page:", error);
                });
        } else if (mode === "edit") {
            updatePage(page.id, pageData)
                .then(() => {
                    console.log("Page updated successfully");
                    navigate("/instantiate/eventmaker/pages"); // Redirect to the pages list after saving
                })
                .catch((error) => {
                    console.error("Error updating page:", error);
                });
        }
    };

    if (isPagesLoading || isComponentsLoading) {
        return <p>Loading...</p>; // Show a loading message while data is being fetched
    }

    if (pagesError || componentsError) {
        return <p className="text-red-500">Error: {pagesError || componentsError}</p>; // Show an error message if there's an issue
    }

    if (mode === "edit" && !page) {
        return <p>Loading page data...</p>;
    }

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
                        {sections.length > 0 ? (
                            sections.map((section, index) => (
                                <SortableItem
                                    key={section.id || index}
                                    id={section.id}
                                    componentData={section.componentData}
                                    onComponentTypeChange={(id, newType) =>
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
                                        )
                                    }
                                    onComponentPropsChange={(id, updatedProps) =>
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
                                        )
                                    }
                                    onRemove={() =>
                                        setSections((prevSections) =>
                                            prevSections.filter((s) => s.id !== section.id)
                                        )
                                    }
                                />
                            ))
                        ) : (
                            <p className="text-gray-500">No sections added yet. Click "Add New Section" to get started.</p>
                        )}
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
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        {mode === "edit" ? "Update Page" : "Save Page"}
                    </button>
                </div>
            </SortableContext>
        </DndContext>
    );
}