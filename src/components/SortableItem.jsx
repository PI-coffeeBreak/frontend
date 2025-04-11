import React, { useState } from "react";
import PropTypes from "prop-types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaBars, FaChevronDown, FaChevronUp, FaTrash } from "react-icons/fa";
import { useComponents } from "../contexts/ComponentsContext";
import { componentList } from "./Components";

export function SortableItem({ id, componentData = { name: "", props: {} }, onComponentTypeChange, onComponentPropsChange, onRemove }) {
    const { getComponentList } = useComponents();
    const availableComponents = getComponentList();

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const [componentProps, setComponentProps] = useState(componentData.props || {}); // Fallback for props
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

    const renderInputField = (property) => {
        const { name, type } = property;
        const value = componentProps[name] || "";

        if (name.toLowerCase() === "backgroundcolor") {
            return (
                <select
                    name={name}
                    value={value}
                    onChange={handlePropertyChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                    {colorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        }

        if (name.toLowerCase() === "textcolor") {
            return (
                <select
                    name={name}
                    value={value}
                    onChange={handlePropertyChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                    {textColorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        }

        if (name.toLowerCase() === "color") {
            const selectedValue = value || "base-content";
            return (
                <select
                    name={name}
                    value={selectedValue}
                    onChange={handlePropertyChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                    {combinedColorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        }

        if (type === "boolean") {
            return (
                <input
                    type="checkbox"
                    name={name}
                    checked={value}
                    onChange={handlePropertyChange}
                    className="checkbox checkbox-primary"
                />
            );
        }

        return (
            <input
                type="text"
                name={name}
                value={value}
                onChange={handlePropertyChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
        );
    };

    if (!componentData?.name) {
        return <p className="text-red-500">Error: Component data is missing</p>;
    }

    const SelectedComponent = componentList.find((c) => c.name === componentData.name)?.component || null;
    const currentComponent = availableComponents.find((component) => component.name === componentData.name);

    const colorOptions = [
        { value: "primary", label: "Primary" },
        { value: "secondary", label: "Secondary" },
        { value: "accent", label: "Accent" },
        { value: "neutral", label: "Neutral" },
        { value: "base-100", label: "Base 100" },
        { value: "base-200", label: "Base 200" },
        { value: "base-300", label: "Base 300" },
        { value: "info", label: "Info" },
        { value: "success", label: "Success" },
        { value: "warning", label: "Warning" },
        { value: "error", label: "Error" },
    ];

    const textColorOptions = [
        { value: "base-content", label: "Base Content" },
        { value: "primary-content", label: "Primary Content" },
        { value: "secondary-content", label: "Secondary Content" },
        { value: "accent-content", label: "Accent Content" },
        { value: "neutral-content", label: "Neutral Content" },
        { value: "info-content", label: "Info Content" },
        { value: "success-content", label: "Success Content" },
        { value: "warning-content", label: "Warning Content" },
        { value: "error-content", label: "Error Content" },
    ];

    const combinedColorOptions = [
        ...colorOptions,
        ...textColorOptions,
    ];

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
                        {availableComponents.map((component) => (
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
                                {renderInputField(property)}
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

SortableItem.propTypes = {
    id: PropTypes.string.isRequired,
    componentData: PropTypes.shape({
        name: PropTypes.string.isRequired,
        props: PropTypes.object.isRequired,
    }).isRequired,
    onComponentTypeChange: PropTypes.func.isRequired,
    onComponentPropsChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
};