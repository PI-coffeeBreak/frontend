import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "../components/SortableItem";
import { useComponents } from "../contexts/ComponentsContext";

export function HomeEditor() {
    const { components, isLoading, error } = useComponents(); // Fetch components from context
    const [sections, setSections] = useState([]);

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

    const getDefaultProps = (type) => {
        const componentSchema = components[type];
        if (!componentSchema || !componentSchema.properties) return {};

        // Generate default props based on the schema
        const defaultProps = {};
        Object.keys(componentSchema.properties).forEach((key) => {
            if (key !== "name" && key !== "component_id") {
                defaultProps[key] = componentSchema.properties[key].default || "";
            }
        });
        return defaultProps;
    };

    const addNewSection = () => {
        const newSection = {
            id: (sections.length + 1).toString(),
            componentData: {
                name: "Text", // Default to "Text" component
                props: getDefaultProps("Text"),
            },
        };
        setSections((prevSections) => [...prevSections, newSection]);
    };

    const removeSection = (id) => {
        setSections((prevSections) => prevSections.filter((section) => section.id !== id));
    };

    const savePage = () => {
        const jsonStructure = {
            components: sections.map((section) => ({
                name: section.componentData.name,
                props: section.componentData.props,
            })),
        };
        console.log(JSON.stringify(jsonStructure, null, 2));
    };

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">Event Page Editor</h1>

                    {/* Error or Loading State */}
                    {isLoading && <p>Loading components...</p>}
                    {error && <p className="text-red-500">{error}</p>}

                    <div className="space-y-4">
                        {sections.map((section) => (
                            <SortableItem
                                key={section.id}
                                id={section.id}
                                componentData={section.componentData}
                                onComponentTypeChange={handleComponentTypeChange}
                                onRemove={() => removeSection(section.id)} // Pass the remove handler
                                componentOptions={Object.keys(components || {})} // Pass component options
                            />
                        ))}
                        {/* Add New Section Button */}
                        <div
                            className="flex items-center justify-center p-4 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300"
                            onClick={addNewSection}
                        >
                            <span className="text-sm font-bold text-gray-700">+ Add New Section</span>
                        </div>
                    </div>
                    {/* Save Button */}
                    <button
                        onClick={savePage}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Save Page
                    </button>
                </div>
            </SortableContext>
        </DndContext>
    );
}