import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaBars, FaChevronDown, FaChevronUp, FaTrash } from "react-icons/fa";
import { useComponents } from "../contexts/ComponentsContext";
import { Title, Image, Button, Text, Heading } from "./componentsMap.jsx";
import { componentMap } from "./componentsMap";

// Define the available text color options
const textColorOptions = [
    { value: "text-primary", label: "Primary" },
    { value: "text-primary-content", label: "Primary Content" },
    { value: "text-secondary", label: "Secondary" },
    { value: "text-secondary-content", label: "Secondary Content" },
    { value: "text-success", label: "Success" },
    { value: "text-success-content", label: "Success Content" },
    { value: "text-danger", label: "Danger" },
    { value: "text-danger-content", label: "Danger Content" },
    { value: "text-warning", label: "Warning" },
    { value: "text-warning-content", label: "Warning Content" },
    { value: "text-info", label: "Info" },
    { value: "text-info-content", label: "Info Content" },
];

export function SortableItem({ id, componentData, onComponentTypeChange, onComponentPropsChange, onRemove }) {
    const { getComponentList } = useComponents();
    const componentList = getComponentList();

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const [componentProps, setComponentProps] = useState(componentData.props);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handlePropertyChange = (event) => {
        const { name, value, type, checked } = event.target;
        const updatedProps = {
            ...componentProps,
            [name]: type === "checkbox" ? checked : value,
        };
        setComponentProps(updatedProps);
        onComponentPropsChange(id, updatedProps); // Notify parent of the updated props
    };

    const handleTypeChange = (event) => {
        const newType = event.target.value;
        onComponentTypeChange(id, newType); // Notify parent to update the component type
    };

    const SelectedComponent = componentMap[componentData.name];
    const currentComponent = componentList.find((component) => component.name === componentData.name);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative flex items-center gap-4 w-full"
        >
            <div className="flex-grow p-4 bg-white shadow rounded-lg">
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
                        {componentList.map((component) => (
                            <option key={component.name} value={component.name}>
                                {component.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    {SelectedComponent ? (
                        <SelectedComponent {...componentProps} />
                    ) : (
                        <p className="text-red-500">Error: Component not found</p>
                    )}
                </div>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center justify-between w-full bg-gray-200 p-2 rounded-md"
                >
                    <span className="text-sm font-bold">Edit Properties</span>
                    {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                </button>

                {!isCollapsed && currentComponent && (
                    <div className="p-4 bg-gray-100 rounded-lg mt-2">
                        {currentComponent.properties.map((property) => (
                            <div key={property.name} className="mb-2">
                                <label className="block text-xs font-medium text-gray-700">
                                    {property.title || property.name}
                                </label>
                                {property.name.includes("color") ? (
                                    <select
                                        name={property.name}
                                        value={componentProps[property.name] || ""}
                                        onChange={handlePropertyChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    >
                                        {textColorOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : property.type === "boolean" ? (
                                    <input
                                        type="checkbox"
                                        name={property.name}
                                        checked={componentProps[property.name] || false}
                                        onChange={handlePropertyChange}
                                        className="checkbox checkbox-primary"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        name={property.name}
                                        value={componentProps[property.name] || ""}
                                        onChange={handlePropertyChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={onRemove}
                className="text-gray-500 hover:text-red-500 p-2 rounded-full"
                title="Remove Section"
            >
                <FaTrash />
            </button>

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