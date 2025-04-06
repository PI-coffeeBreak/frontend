import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaBars } from "react-icons/fa";
import { Title, Image, Button, Text, Heading } from "./componentsMap.jsx";

// Map the component types to their respective components
export const componentMap = {
    title: Title,
    image: Image,
    button: Button,
    text: Text,
    heading: Heading,
};

export function SortableItem({ id, componentData, onComponentTypeChange }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const [componentProps, setComponentProps] = useState(componentData.props);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handlePropertyChange = (event) => {
        const { name, value } = event.target;
        setComponentProps((prevProps) => ({
            ...prevProps,
            [name]: value,
        }));
    };

    const handleTypeChange = (event) => {
        const newType = event.target.value;
        onComponentTypeChange(id, newType); // Notify parent to update the component type
    };

    const SelectedComponent = componentMap[componentData.name.toLowerCase()];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative flex-shrink-0 cursor-default p-4 bg-white shadow rounded-lg"
        >
            {/* Drag Handle */}
            <div
                {...listeners}
                {...attributes}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full cursor-grab"
                title="Drag"
            >
                <FaBars />
            </div>

            {/* Component Type Selector */}
            <div className="mb-4">
                <label htmlFor={`component-type-${id}`} className="block text-sm font-medium text-gray-700">
                    Component Type
                </label>
                <select
                    id={`component-type-${id}`}
                    value={componentData.name}
                    onChange={handleTypeChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                    <option value="Heading">Heading</option>
                    <option value="Text">Text</option>
                    <option value="Button">Button</option>
                    <option value="Image">Image</option>
                </select>
            </div>

            {/* Render the selected component */}
            <div className="mb-4">
                <SelectedComponent {...componentProps} />
            </div>

            {/* Inline Configuration Options */}
            <div className="p-4 bg-gray-100 rounded-lg">
                <h3 className="text-sm font-bold mb-2">Edit Properties</h3>
                {componentData.name === "Heading" && (
                    <>
                        <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700">Text</label>
                            <input
                                type="text"
                                name="text"
                                value={componentProps.text || ""}
                                onChange={handlePropertyChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700">Level</label>
                            <select
                                name="level"
                                value={componentProps.level || 2}
                                onChange={handlePropertyChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            >
                                <option value={1}>H1</option>
                                <option value={2}>H2</option>
                                <option value={3}>H3</option>
                                <option value={4}>H4</option>
                                <option value={5}>H5</option>
                                <option value={6}>H6</option>
                            </select>
                        </div>
                    </>
                )}
                {componentData.name === "Text" && (
                    <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-700">Content</label>
                        <textarea
                            name="content"
                            value={componentProps.content || ""}
                            onChange={handlePropertyChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                )}
                {componentData.name === "Button" && (
                    <>
                        <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700">Text</label>
                            <input
                                type="text"
                                name="text"
                                value={componentProps.text || ""}
                                onChange={handlePropertyChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700">URL</label>
                            <input
                                type="text"
                                name="URL"
                                value={componentProps.URL || ""}
                                onChange={handlePropertyChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700">Method</label>
                            <select
                                name="METHOD"
                                value={componentProps.METHOD || "GET"}
                                onChange={handlePropertyChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                        </div>
                        <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700">Label Color</label>
                            <select
                                name="labelColor"
                                value={componentProps.labelColor || ""}
                                onChange={handlePropertyChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="text-white">White</option>
                                <option value="text-black">Black</option>
                                <option value="text-primary">Primary</option>
                                <option value="text-secondary">Secondary</option>
                            </select>
                        </div>
                        <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700">Background Color</label>
                            <select
                                name="backgroundColor"
                                value={componentProps.backgroundColor || ""}
                                onChange={handlePropertyChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="btn-primary">Primary</option>
                                <option value="btn-secondary">Secondary</option>
                                <option value="btn-accent">Accent</option>
                                <option value="btn-neutral">Neutral</option>
                            </select>
                        </div>
                    </>
                )}
                {componentData.name === "Image" && (
                    <>
                        <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700">Image URL</label>
                            <input
                                type="text"
                                name="src"
                                value={componentProps.src || ""}
                                onChange={handlePropertyChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700">Alt Text</label>
                            <input
                                type="text"
                                name="alt"
                                value={componentProps.alt || ""}
                                onChange={handlePropertyChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}