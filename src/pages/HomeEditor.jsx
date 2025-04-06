import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "../components/SortableItem";

export function HomeEditor() {
    const [sections, setSections] = useState([
        {
            id: "1",
            componentData: {
                name: "Heading",
                props: { text: "Welcome to the Event", className: "text-primary" },
            },
        },
        {
            id: "2",
            componentData: {
                name: "Text",
                props: { content: "This is a description of the event.", className: "text-gray-700" },
            },
        },
        {
            id: "3",
            componentData: {
                name: "Button",
                props: { text: "Learn More", METHOD: "GET", URL: "https://example.com", className: "btn-primary" },
            },
        },
    ]);

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
        switch (type) {
            case "Heading":
                return { text: "Default Heading", className: "text-primary" };
            case "Text":
                return { content: "Default Text", className: "text-gray-700" };
            case "Button":
                return {
                    text: "Click Me",
                    METHOD: "GET",
                    URL: "#",
                    labelColor: "text-white",
                    backgroundColor: "btn-primary",
                };
            case "Image":
                return { src: "https://via.placeholder.com/150", alt: "Placeholder", className: "" };
            default:
                return {};
        }
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

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">Event Page Editor</h1>
                    <div className="space-y-4">
                        {sections.map((section) => (
                            <SortableItem
                                key={section.id}
                                id={section.id}
                                componentData={section.componentData}
                                onComponentTypeChange={handleComponentTypeChange}
                                onRemove={() => removeSection(section.id)} // Pass the remove handler
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
                </div>
            </SortableContext>
        </DndContext>
    );
}