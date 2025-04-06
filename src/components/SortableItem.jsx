import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaBars, FaCog } from "react-icons/fa";

// Import the new components
import { Title, Image, Button, Text, Heading } from "./componentsMap.jsx";

// Map the component types to their respective components
export const componentMap = {
    title: Title,
    image: Image,
    button: Button,
    text: Text,
    heading: Heading,
};

export function SortableItem({ id }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const [selectedComponent, setSelectedComponent] = useState("title"); // Default selection
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [componentProps, setComponentProps] = useState({ text: "Default Text", color: "#000000", fontSize: "16px" });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleSelectionChange = (event) => {
        setSelectedComponent(event.target.value);
    };

    const handleOpenConfigModal = () => {
        setIsConfigModalOpen(true);
    };

    const handleCloseConfigModal = () => {
        setIsConfigModalOpen(false);
    };

    const handlePropertyChange = (event) => {
        const { name, value } = event.target;
        setComponentProps((prevProps) => ({
            ...prevProps,
            [name]: value,
        }));
    };

    const SelectedComponent = componentMap[selectedComponent];

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

            {/* Config Button */}
            <button
                onClick={handleOpenConfigModal}
                className="absolute top-1/2 right-10 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full"
                title="Configure"
            >
                <FaCog />
            </button>

            {/* Dropdown to select component */}
            <div className="mb-4">
                <label htmlFor={`component-select-${id}`} className="block text-sm font-medium text-gray-700">
                    Select Component
                </label>
                <select
                    id={`component-select-${id}`}
                    value={selectedComponent}
                    onChange={handleSelectionChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                >
                    <option value="title">Title</option>
                    <option value="image">Image</option>
                    <option value="button">Button</option>
                    <option value="text">Text</option>
                    <option value="heading">Heading</option>
                </select>
            </div>

            {/* Render the selected component */}
            <div className="mt-4">
                <SelectedComponent {...componentProps} />
            </div>

            {/* Configuration Modal */}
            {isConfigModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-lg font-bold mb-4">Configure Component</h2>
                        {selectedComponent === "text" || selectedComponent === "title" || selectedComponent === "heading" ? (
                            <>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Text</label>
                                    <input
                                        type="text"
                                        name="text"
                                        value={componentProps.text}
                                        onChange={handlePropertyChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Font Size</label>
                                    <input
                                        type="text"
                                        name="fontSize"
                                        value={componentProps.fontSize}
                                        onChange={handlePropertyChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Color</label>
                                    <input
                                        type="color"
                                        name="color"
                                        value={componentProps.color}
                                        onChange={handlePropertyChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-500">No configurable properties for this component.</p>
                        )}
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={handleCloseConfigModal}
                                className="btn btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}