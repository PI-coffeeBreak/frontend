import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "../components/SortableItem";
import { useComponents } from "../contexts/ComponentsContext";
import { usePages } from "../contexts/PagesContext";
import { componentMap } from "../components/componentsMap";

export function HomeEditor() {
    const { components, isLoading, error } = useComponents();
    const { savePage, isLoading: isSaving, error: saveError } = usePages();
    const [sections, setSections] = useState([]);
    const [pageTitle, setPageTitle] = useState("");

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = sections.findIndex((section) => section.id === active.id);
            const newIndex = sections.findIndex((section) => section.id === over.id);

            setSections((prev) => arrayMove(prev, oldIndex, newIndex));
        }
    };

    const handleComponentTypeChange = (id, newType) => {
        setSections((prevSections) =>
            prevSections.map((section) =>
                section.id === id
                    ? {
                          ...section,
                          componentData: {
                              name: newType,
                              props: getDefaultProps(newType),
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

    const getDefaultProps = (type) => {
        const componentSchema = components?.[type]?.properties;
        if (!componentSchema) return {};

        // Generate default props based on the schema
        const defaultProps = {};
        Object.keys(componentSchema).forEach((key) => {
            if (key !== "name" && key !== "component_id") {
                defaultProps[key] = componentSchema[key]?.default || "";
            }
        });
        return defaultProps;
    };

    const addNewSection = () => {
        const newSection = {
            id: (sections.length + 1).toString(),
            componentData: {
                name: "TextComponent", // Default to "TextComponent"
                props: getDefaultProps("TextComponent"),
            },
        };
        setSections((prevSections) => [...prevSections, newSection]);
    };

    const removeSection = (id) => {
        setSections((prevSections) => prevSections.filter((section) => section.id !== id));
    };

    const handleSavePage = () => {
        // Transform the componentMap to map values (e.g., Text) to keys (e.g., TextComponent)
        const nameMap = Object.entries(componentMap).reduce((acc, [key, value]) => {
            acc[key] = key.replace("Component", ""); // Remove "Component" suffix
            return acc;
        }, {});
    
        const pageData = {
            title: pageTitle,
            components: sections.map((section) => ({
                ...section.componentData.props,
                name: nameMap[section.componentData.name] || section.componentData.name, // Transform the name
            })),
        };
    
        savePage(pageData);
    };

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">Page Editor</h1>

                    {/* Error or Loading State */}
                    {isLoading && <p>Loading components...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {saveError && <p className="text-red-500">{saveError}</p>}
                    {isSaving && <p>Saving page...</p>}

                    <div className="mb-4">
                        <label htmlFor="page-title" className="block text-sm font-medium text-gray-700">
                            Page Title
                        </label>
                        <input
                            id="page-title"
                            type="text"
                            value={pageTitle}
                            onChange={(e) => setPageTitle(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="space-y-4">
                        {sections.map((section) => (
                            <SortableItem
                                key={section.id}
                                id={section.id}
                                componentData={section.componentData}
                                onComponentTypeChange={handleComponentTypeChange}
                                onComponentPropsChange={handleComponentPropsChange} // Pass the function here
                                onRemove={() => removeSection(section.id)}
                            />
                        ))}
                        {/* Add New Section Button */}
                        <button
                            className="flex items-center justify-center p-4 bg-gray-200 rounded-lg hover:bg-gray-300"
                            onClick={addNewSection}
                            aria-label="Add New Section" // Accessible label
                        >
                            <span className="text-sm font-bold text-gray-700">+ Add New Section</span>
                        </button>
                    </div>
                    {/* Save Button */}
                    <button
                        onClick={handleSavePage}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Save Page
                    </button>
                </div>
            </SortableContext>
        </DndContext>
    );
}