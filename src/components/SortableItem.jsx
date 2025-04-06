import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaBars, FaChevronDown, FaChevronUp, FaTrash } from "react-icons/fa";
import { componentConfigurations } from "./ComponentConfigurations";
import { Title, Image, Button, Text, Heading } from "./componentsMap.jsx";

// Map the component types to their respective components
export const componentMap = {
    title: Title,
    image: Image,
    button: Button,
    text: Text,
    heading: Heading,
};

export function SortableItem({ id, componentData, onComponentTypeChange, onRemove }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const [componentProps, setComponentProps] = useState(componentData.props);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handlePropertyChange = (event) => {
        const { name, value, type, checked } = event.target;
        setComponentProps((prevProps) => ({
            ...prevProps,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleTypeChange = (event) => {
        const newType = event.target.value;
        onComponentTypeChange(id, newType); // Notify parent to update the component type
    };

    // Normalize componentData.name to match the keys in componentConfigurations
    const normalizedComponentName = componentData.name.charAt(0).toUpperCase() + componentData.name.slice(1);
    const SelectedComponent = componentMap[componentData.name.toLowerCase()];
    const ConfigurationComponent = componentConfigurations[normalizedComponentName] || null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative flex items-center gap-4 w-full"
        >
            {/* Main Content Box */}
            <div className="flex-grow p-4 bg-white shadow rounded-lg">
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
                        {Object.keys(componentMap).map((key) => (
                            <option key={key} value={key}>
                                {key}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Render the selected component */}
                <div className="mb-4">
                    <SelectedComponent {...componentProps} />
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center justify-between w-full bg-gray-200 p-2 rounded-md"
                >
                    <span className="text-sm font-bold">Edit Properties</span>
                    {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                </button>

                {/* Inline Configuration Options */}
                {!isCollapsed && ConfigurationComponent && (
                    <div className="p-4 bg-gray-100 rounded-lg mt-2">
                        <ConfigurationComponent
                            componentProps={componentProps}
                            handlePropertyChange={handlePropertyChange}
                        />
                    </div>
                )}
            </div>

            {/* Discreet Remove Button */}
            <button
                onClick={onRemove}
                className="text-gray-500 hover:text-red-500 p-2 rounded-full"
                title="Remove Section"
            >
                <FaTrash />
            </button>

            {/* Drag Handle */}
            <div
                {...listeners}
                {...attributes}
                className="flex-shrink-0 bg-gray-700 text-white p-2 rounded-full cursor-grab shadow-md"
                title="Drag"
            >
                <FaBars />
            </div>
        </div>
    );
}