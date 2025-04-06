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
                props: { text: "Welcome to the Event", color: "#000", fontSize: "24px" },
            },
        },
        {
            id: "2",
            componentData: {
                name: "Text",
                props: { text: "This is a description of the event.", color: "#555", fontSize: "16px" },
            },
        },
        {
            id: "3",
            componentData: {
                name: "Button",
                props: { text: "Learn More", METHOD: "GET", URL: "https://example.com" },
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

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">Event Page Editor</h1>
                    <div className="space-y-4">
                        {sections.map((section) => (
                            <SortableItem key={section.id} id={section.id} componentData={section.componentData} />
                        ))}
                    </div>
                </div>
            </SortableContext>
        </DndContext>
    );
}