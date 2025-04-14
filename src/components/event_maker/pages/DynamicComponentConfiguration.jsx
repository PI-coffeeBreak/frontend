import React, { useState } from "react";
import PropTypes from "prop-types";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useComponents } from "../../../contexts/ComponentsContext";
import { SortableItemLayout } from "./SortableItemLayout";
import { TextInput, CheckboxInput, SelectInput } from "./CommonInputs";
import { NumberInput } from "../../forms/NumberInput.jsx";
import { MediaInput } from "../../../components/forms/MediaInput";
import * as Components from "./components";

function AnyOfInput({ propertyName, schemas, currentValue, onPropertyChange }) {
    // Create options for the type selector with consistent labels
    const TYPE_LABELS = {
        MEDIA: 'Upload Media',
        URL: 'External URL'
    };

    const typeOptions = schemas.map((schema, index) => {
        // Handle Media type
        if (schema.$ref === '#/$defs/Media') {
            return {
                value: index.toString(),
                label: TYPE_LABELS.MEDIA,
                isMedia: true
            };
        }
        // Handle URL/string type
        if (schema.type === 'string') {
            return {
                value: index.toString(),
                label: TYPE_LABELS.URL,
                isString: true
            };
        }
        // Default case
        return {
            value: index.toString(),
            label: schema.title || schema.type
        };
    });

    // Determine current type
    let initialType = '0';
    if (currentValue) {
        if (typeof currentValue === 'object' && currentValue.uuid) {
            initialType = typeOptions.findIndex(opt => 'isMedia' in opt).toString();
        } else if (typeof currentValue === 'string') {
            initialType = typeOptions.findIndex(opt => 'isString' in opt).toString();
        }
    }

    const [selectedType, setSelectedType] = useState(initialType);

    const handleTypeSelect = (event) => {
        const newTypeIndex = event.target.value;
        setSelectedType(newTypeIndex);

        // Reset value when type changes
        const newSchema = schemas[parseInt(newTypeIndex)];
        let defaultValue;

        if (newSchema.type === 'string') {
            defaultValue = '';
        } else if (newSchema.$ref === '#/$defs/Media') {
            defaultValue = { uuid: '' }; // Initialize with empty uuid instead of null
        } else {
            defaultValue = undefined;
        }

        onPropertyChange({
            target: {
                name: propertyName,
                value: defaultValue
            }
        });
    };

    return (
        <div className="space-y-4">
            <SelectInput
                label="Source Type"
                value={selectedType}
                options={typeOptions}
                onChange={handleTypeSelect}
            />
            <PropertyInput
                propertyName={propertyName}
                propertySchema={schemas[parseInt(selectedType)]}
                value={currentValue}
                onChange={onPropertyChange}
            />
        </div>
    );
}

AnyOfInput.propTypes = {
    propertyName: PropTypes.string.isRequired,
    schemas: PropTypes.arrayOf(PropTypes.object).isRequired,
    currentValue: PropTypes.any,
    onPropertyChange: PropTypes.func.isRequired
};

function PropertyInput({ propertyName, propertySchema, value, onChange, isRequired, schema }) {
    const label = propertySchema.title || propertyName;
    const description = propertySchema.description;

    // Handle Media type
    if (propertySchema.$ref === '#/$defs/Media') {
        return (
            <MediaInput
                key={propertyName}
                name={propertyName}
                label={`${label}${isRequired ? " *" : ""}`}
                value={value}
                onChange={onChange}
            />
        );
    }

    // Handle enum references
    if (propertySchema.$ref) {
        const enumName = propertySchema.$ref.split('/').pop();
        const enumDef = schema?.$defs?.[enumName];
        if (enumDef?.enum) {
            return (
                <SelectInput
                    key={propertyName}
                    label={`${label}${isRequired ? " *" : ""}`}
                    name={propertyName}
                    value={value || propertySchema.default || ""}
                    options={enumDef.enum.map(value => ({
                        value,
                        label: value.split('-').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')
                    }))}
                    onChange={onChange}
                />
            );
        }
    }

    // Handle direct enums
    if (propertySchema.enum) {
        return (
            <SelectInput
                key={propertyName}
                label={`${label}${isRequired ? " *" : ""}`}
                name={propertyName}
                value={value || propertySchema.default || ""}
                options={propertySchema.enum.map(value => ({
                    value,
                    label: typeof value === 'string'
                        ? value.split('-').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')
                        : value
                }))}
                onChange={onChange}
            />
        );
    }

    switch (propertySchema.type) {
        case "string":
            return (
                <TextInput
                    key={propertyName}
                    label={`${label}${isRequired ? " *" : ""}`}
                    name={propertyName}
                    value={value || propertySchema.default || ""}
                    onChange={onChange}
                    placeholder={description}
                />
            );

        case "boolean":
            return (
                <CheckboxInput
                    key={propertyName}
                    label={label}
                    name={propertyName}
                    checked={value ?? propertySchema.default ?? false}
                    onChange={onChange}
                />
            );

        case "number":
        case "integer":
            return (
                <NumberInput
                    key={propertyName}
                    label={label}
                    name={propertyName}
                    value={value ?? propertySchema.default ?? ""}
                    onChange={onChange}
                    required={isRequired}
                    min={propertySchema.minimum}
                    max={propertySchema.maximum}
                    step={propertySchema.type === "integer" ? 1 : propertySchema.multipleOf}
                />
            );

        default:
            console.warn(`Unsupported property type: ${propertySchema.type} for ${propertyName}`);
            return null;
    }
}

PropertyInput.propTypes = {
    propertyName: PropTypes.string.isRequired,
    propertySchema: PropTypes.object.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    isRequired: PropTypes.bool,
    schema: PropTypes.object
};

export function DynamicComponentConfiguration({ id, componentData = { name: "", props: {} }, onComponentTypeChange, onComponentPropsChange, onRemove }) {
    const { getComponentList, getComponentSchema } = useComponents();
    const availableComponents = getComponentList();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const schema = getComponentSchema(componentData.name);

    const handlePropertyChange = (event) => {
        const { name, value, type, checked } = event.target;
        const updatedProps = {
            ...componentData.props,
            [name]: type === "checkbox" ? checked : value,
        };
        onComponentPropsChange(id, updatedProps);
    };

    const handleTypeChange = (event) => {
        const newType = event.target.value;
        onComponentTypeChange(id, newType);
    };

    const renderComponentPreview = () => {
        const ComponentToRender = Components[componentData.name];
        if (!ComponentToRender) return null;

        return (
            <div className="my-2 py-2 bg-base rounded-lg">
                <div className="mb-2 text-sm font-medium">
                    Component Preview
                </div>
                <div className="p-4 bg-base-100 rounded border border-base-300">
                    <ComponentToRender {...componentData.props} />
                </div>
            </div>
        );
    };

    const renderPropertyInput = (propertyName, propertySchema, value) => {
        // Skip reserved, const properties, and properties with const values
        if (["name", "component_id"].includes(propertyName) ||
            propertySchema.const !== undefined ||
            propertySchema.type === "const") {
            return null;
        }

        const isRequired = schema.required?.includes(propertyName);

        // Handle anyOf
        if (propertySchema.anyOf) {
            return (
                <AnyOfInput
                    key={propertyName}
                    propertyName={propertyName}
                    schemas={propertySchema.anyOf}
                    currentValue={value}
                    onPropertyChange={handlePropertyChange}
                />
            );
        }

        return (
            <PropertyInput
                key={propertyName}
                propertyName={propertyName}
                propertySchema={propertySchema}
                value={value}
                onChange={handlePropertyChange}
                isRequired={isRequired}
                schema={schema}
            />
        );
    };

    if (!componentData?.name) {
        return <p className="text-red-500">Error: Component data is missing</p>;
    }

    // Get editable properties (excluding name, component_id and const fields)
    const editableProperties = Object.entries(schema?.properties || {}).filter(
        ([name, prop]) => !["name", "component_id"].includes(name) && !prop.const
    );

    return (
        <SortableItemLayout id={id} onRemove={onRemove}>
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
                            {component.title || component.name}
                        </option>
                    ))}
                </select>
            </div>

            {renderComponentPreview()}

            {editableProperties.length > 0 && (
                <>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="flex items-center justify-between w-full bg-gray-200 p-2 rounded-md"
                    >
                        <span className="text-sm font-bold">Edit Properties</span>
                        {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                    </button>

                    {!isCollapsed && schema && (
                        <div className="p-4 bg-gray-100 rounded-lg mt-2 space-y-4">
                            {editableProperties.map(([propertyName, propertySchema]) =>
                                renderPropertyInput(propertyName, propertySchema, componentData.props[propertyName])
                            )}
                        </div>
                    )}
                </>
            )}
        </SortableItemLayout>
    );
}

DynamicComponentConfiguration.propTypes = {
    id: PropTypes.string.isRequired,
    componentData: PropTypes.shape({
        name: PropTypes.string.isRequired,
        props: PropTypes.object.isRequired,
    }).isRequired,
    onComponentTypeChange: PropTypes.func.isRequired,
    onComponentPropsChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
}; 