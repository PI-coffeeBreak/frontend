import React, { useState } from "react";
import PropTypes from "prop-types";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useComponents } from "../../../contexts/ComponentsContext";
import { SortableItemLayout } from "./SortableItemLayout";
import { TextInput } from "./inputs/TextInput.jsx";
import { CheckboxInput } from "./inputs/CheckboxInput.jsx";
import { SelectInput } from "./inputs/SelectInput.jsx";
import { NumberInput } from "./inputs/NumberInput.jsx";
import { MediaInput } from "./inputs/MediaInput.jsx";
import { ColorSelector } from "../ColorSelector.jsx";
import { ColorThemeLayout } from "../ColorThemeLayout.jsx";
import * as Components from "./components";
import { useTranslation } from "react-i18next";

function AnyOfInput({ propertyName, schemas, currentValue, onPropertyChange }) {
    const typeOptions = schemas.map((schema, index) => {
        const isMedia  = schema.$ref === '#/$defs/Media';
        const isString = schema.type  === 'string';
        const defaultLabel = schema.title || schema.type || (schema.$ref ? (schema.$ref).split('/').pop() : '');
        return {
          value: index.toString(),
          label: defaultLabel,
          isMedia,
          isString
        };
    });

    // Determine current type based on value type
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

        // Preserve value if possible, otherwise reset
        const newSchema = schemas[parseInt(newTypeIndex)];
        let newValue;

        if (newSchema.type === 'string' && typeof currentValue === 'object' && currentValue.uuid) {
            // Converting from Media to URL - use the full URL
            newValue = `${baseUrl}/media/${currentValue.uuid}`;
        } else if (newSchema.$ref === '#/$defs/Media' && typeof currentValue === 'string') {
            // Converting from URL to Media - initialize empty
            newValue = { uuid: '' };
        } else {
            // Keep current value if types match
            newValue = currentValue;
        }

        onPropertyChange({
            target: {
                name: propertyName,
                value: newValue,
                type: newSchema.$ref === '#/$defs/Media' ? 'file' : 'text'
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

// Helper functions for PropertyInput
function createMediaInput(propertyName, label, value, onChange, isRequired) {
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

MediaInput.propTypes = {
    propertyName: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired
};

function createColorSelector(propertyName, enumDef, value, propertySchema, onChange) {
    const colorOptions = enumDef.enum.map(value => ({
        value,
        label: value.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        color: value
    }));

    return (
        <ColorSelector
            key={propertyName}
            name={propertyName}
            value={value || propertySchema.default || ""}
            onChange={onChange}
            options={colorOptions}
        />
    );
}

ColorSelector.propTypes = {
    propertyName: PropTypes.string.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.object).isRequired
};

function createSelectInput(propertyName, label, value, options, onChange, propertySchema, isRequired) {
    return (
        <SelectInput
            key={propertyName}
            label={`${label}${isRequired ? " *" : ""}`}
            name={propertyName}
            value={value || propertySchema.default || ""}
            options={options}
            onChange={onChange}
        />
    );
}

SelectInput.propTypes = {
    propertyName: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.any,
    options: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func.isRequired
};

function formatEnumOptions(enumValues) {
    return enumValues.map(value => ({
        value,
        label: typeof value === 'string'
            ? value.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')
            : value
    }));
}

formatEnumOptions.propTypes = {
    enumValues: PropTypes.arrayOf(PropTypes.string).isRequired
};

// Create array input that delegates each item to PropertyInput
function createArrayInput(propertyName, label, value, onChange, propertySchema, isRequired, schema) {
    const itemsSchema = propertySchema.items;
    const items = Array.isArray(value) ? value : [];
    const handleItemChange = (newValue, index, type = 'text') => {
        const newArr = [...items];
        newArr[index] = newValue;
        onChange({ target: { name: propertyName, value: newArr, type } });
    };
    return (
        <div key={propertyName} className="mb-2">
            <label className="block text-xs font-medium text-gray-700">{`${label}${isRequired ? " *" : ""}`}</label>
            {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 mt-1">
                    <PropertyInput
                        propertyName=""
                        propertySchema={itemsSchema}
                        value={item}
                        onChange={e => handleItemChange(e.target.value, index, e.target.type)}
                        isRequired={false}
                        schema={schema}
                    />
                    <button type="button" onClick={() => {
                        const newArr = [...items];
                        newArr.splice(index, 1);
                        onChange({ target: { name: propertyName, value: newArr, type: 'array' } });
                    }} className="btn btn-sm btn-error">
                        Remove
                    </button>
                </div>
            ))}
            <button type="button" onClick={() => {
                const newArr = [...items];
                let defaultItem;
                switch (itemsSchema.type) {
                    case 'number':
                    case 'integer':
                        defaultItem = 0;
                        break;
                    case 'boolean':
                        defaultItem = false;
                        break;
                    case 'object':
                        defaultItem = {};
                        break;
                    case 'array':
                        defaultItem = [];
                        break;
                    default:
                        defaultItem = '';
                }
                newArr.push(defaultItem);
                onChange({ target: { name: propertyName, value: newArr, type: 'array' } });
            }} className="mt-1 btn btn-sm btn-primary">
                Add item
            </button>
        </div>
    );
}

createArrayInput.propTypes = {
    propertyName: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    propertySchema: PropTypes.object.isRequired,
    isRequired: PropTypes.bool,
    schema: PropTypes.object
};


function handleEnumReference(propertyName, schema, propertySchema, value, onChange, label, isRequired) {
    const enumName = propertySchema.$ref.split('/').pop();
    const enumDef = schema?.$defs?.[enumName];

    if (!enumDef?.enum) return null;

    if (enumName === "Color") {
        return createColorSelector(propertyName, enumDef, value, propertySchema, onChange);
    }

    return createSelectInput(
        propertyName,
        label,
        value,
        formatEnumOptions(enumDef.enum),
        onChange,
        propertySchema,
        isRequired
    );
}

handleEnumReference.propTypes = {
    propertyName: PropTypes.string.isRequired,
    schema: PropTypes.object.isRequired,
    propertySchema: PropTypes.object.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
};

// Add centralized input renderer
function renderInput(propertyName, propertySchema, value, onChange, isRequired, schema) {
    const label = propertySchema.title || propertyName;
    const description = propertySchema.description;

    // Handle anyOf schemas
    if (propertySchema.anyOf) {
        return (
            <AnyOfInput
                key={propertyName}
                propertyName={propertyName}
                schemas={propertySchema.anyOf}
                currentValue={value}
                onPropertyChange={onChange}
                schema={schema}
                isRequired={isRequired}
            />
        );
    }

    // Handle Media type reference
    if (propertySchema.$ref === '#/$defs/Media') {
        return createMediaInput(propertyName, label, value, onChange, isRequired);
    }

    // Handle enum references
    if (propertySchema.$ref) {
        return handleEnumReference(propertyName, schema, propertySchema, value, onChange, label, isRequired);
    }

    // Handle direct enums
    if (propertySchema.enum) {
        return createSelectInput(
            propertyName,
            label,
            value,
            formatEnumOptions(propertySchema.enum),
            onChange,
            propertySchema,
            isRequired
        );
    }

    // Handle array types
    if (propertySchema.type === 'array') {
        return createArrayInput(propertyName, label, value, onChange, propertySchema, isRequired, schema);
    }

    // Fallback to basic inputs (string, boolean, number, integer)
    return createBasicInput(
        propertySchema.type,
        propertyName,
        label,
        value,
        onChange,
        propertySchema,
        isRequired,
        description
    );
}

renderInput.propTypes = {
    propertyName: PropTypes.string.isRequired,
    propertySchema: PropTypes.object.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    isRequired: PropTypes.bool,
    schema: PropTypes.object
};


function createBasicInput(type, propertyName, label, value, onChange, propertySchema, isRequired, description) {
    switch (type) {
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
                    step={type === "integer" ? 1 : propertySchema.multipleOf}
                />
            );

        default:
            console.warn(`Unsupported property type: ${type} for ${propertyName}`);
            return null;
    }
}

createBasicInput.propTypes = {
    type: PropTypes.string.isRequired,
    propertyName: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    propertySchema: PropTypes.object.isRequired,
    isRequired: PropTypes.bool,
    description: PropTypes.string
};


function PropertyInput({ propertyName, propertySchema, value, onChange, isRequired, schema }) {

    // Skip reserved properties, const, and const types
    if (["name", "component_id"].includes(propertyName) || propertySchema.const !== undefined || propertySchema.type === "const") {
        return null;
    }

    // Delegate to unified renderer
    return renderInput(propertyName, propertySchema, value, onChange, isRequired, schema);
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
    const { t } = useTranslation();
    const { getComponentList, getComponentSchema } = useComponents();
    const availableComponents = getComponentList();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const schema = getComponentSchema(componentData.name);

    const handlePropertyChange = (event) => {
        const { name, value, type, checked } = event.target;

        let finalValue = value;
        if (type === 'file' && value && typeof value === 'object' && 'uuid' in value) {

            finalValue = {
                uuid: value.uuid
            };
        }

        const updatedProps = {
            ...componentData.props,
            [name]: type === "checkbox" ? checked : finalValue,
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
                    {t('components.dynamicComponentConfiguration.componentPreview')}
                </div>
                <div
                    className="p-4 rounded border border-base-300 bg-base-100"
                >
                    <ComponentToRender {...componentData.props} />
                </div>
            </div>
        );
    };

    if (!componentData?.name) {
        return <p className="text-red-500">{t('components.dynamicComponentConfiguration.error.missingData')}</p>;
    }

    // Get editable properties (excluding name, component_id and const fields)
    const editableProperties = Object.entries(schema?.properties || {}).filter(
        ([name, prop]) => !["name", "component_id"].includes(name) && !prop.const
    );

    return (
        <SortableItemLayout id={id} onRemove={onRemove}>
            <div className="mb-4">
                <label htmlFor={`component-type-${id}`} className="block text-sm font-medium text-gray-700">
                    {t('components.dynamicComponentConfiguration.componentType')}
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

            <ColorThemeLayout>
                {renderComponentPreview()}
            </ColorThemeLayout>

            {editableProperties.length > 0 && (
                <>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="flex items-center justify-between w-full bg-gray-200 p-2 rounded-md"
                    >
                        <span className="text-sm font-bold">{t('components.dynamicComponentConfiguration.editProperties')}</span>
                        {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                    </button>

                    {!isCollapsed && schema && (
                        <div className="p-4 bg-gray-100 rounded-lg mt-2 space-y-4">
                            {editableProperties.map(([propertyName, propertySchema]) =>
                                (
                                    <PropertyInput
                                        key={propertyName}
                                        propertyName={propertyName}
                                        propertySchema={propertySchema}
                                        value={componentData.props[propertyName]}
                                        onChange={handlePropertyChange}
                                        isRequired={schema.required?.includes(propertyName)}
                                        schema={schema}
                                    />
                                )
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