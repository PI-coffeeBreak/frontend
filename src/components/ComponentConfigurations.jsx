import React from "react";
import PropTypes from "prop-types";
import { TextInput, CheckboxInput, SelectInput } from "./CommonInputs";

// Theme-aware color options for text
const textColorOptions = [
    { value: "base-content", label: "Default Text" },
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
    { value: "accent", label: "Accent" },
    { value: "neutral", label: "Neutral" },
    { value: "info", label: "Info" },
    { value: "success", label: "Success" },
    { value: "warning", label: "Warning" },
    { value: "error", label: "Error" },
];

// Content color options - these are text colors that contrast with backgrounds
const contentColorOptions = [
    { value: "primary-content", label: "Primary Content" },
    { value: "secondary-content", label: "Secondary Content" },
    { value: "accent-content", label: "Accent Content" },
    { value: "neutral-content", label: "Neutral Content" },
    { value: "base-content", label: "Base Content" },
    { value: "info-content", label: "Info Content" },
    { value: "success-content", label: "Success Content" },
    { value: "warning-content", label: "Warning Content" },
    { value: "error-content", label: "Error Content" },
];

// Background color options for elements
const backgroundColorOptions = [
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

export const componentConfigurations = {
    Title: ({ componentProps, handlePropertyChange }) => (
        <>
            <TextInput
                label="Text"
                name="text"
                value={componentProps.text || "Default Title"}
                onChange={handlePropertyChange}
            />
            <SelectInput
                label="Text Color"
                name="color"
                value={componentProps.color || "base-content"}
                options={textColorOptions}
                onChange={handlePropertyChange}
            />
            <div className="mb-2 flex items-center gap-4">
                <CheckboxInput
                    label="Bold"
                    name="bold"
                    checked={componentProps.bold || false}
                    onChange={handlePropertyChange}
                />
                <CheckboxInput
                    label="Italic"
                    name="italic"
                    checked={componentProps.italic || false}
                    onChange={handlePropertyChange}
                />
                <CheckboxInput
                    label="Underline"
                    name="underline"
                    checked={componentProps.underline || false}
                    onChange={handlePropertyChange}
                />
            </div>
        </>
    ),
    Text: ({ componentProps, handlePropertyChange }) => (
        <>
            <TextInput
                label="Text"
                name="text"
                value={componentProps.text || "Default Text"}
                onChange={handlePropertyChange}
            />
            <SelectInput
                label="Text Color"
                name="color"
                value={componentProps.color || "base-content"}
                options={textColorOptions}
                onChange={handlePropertyChange}
            />
            <div className="mb-2 flex items-center gap-4">
                <CheckboxInput
                    label="Bold"
                    name="bold"
                    checked={componentProps.bold || false}
                    onChange={handlePropertyChange}
                />
                <CheckboxInput
                    label="Italic"
                    name="italic"
                    checked={componentProps.italic || false}
                    onChange={handlePropertyChange}
                />
                <CheckboxInput
                    label="Underline"
                    name="underline"
                    checked={componentProps.underline || false}
                    onChange={handlePropertyChange}
                />
            </div>
        </>
    ),
    Button: ({ componentProps, handlePropertyChange }) => (
        <>
            <TextInput
                label="Text"
                name="text"
                value={componentProps.text || "Click Me"}
                onChange={handlePropertyChange}
            />
            <TextInput
                label="URL"
                name="URL"
                value={componentProps.URL || "#"}
                onChange={handlePropertyChange}
            />
            <SelectInput
                label="HTTP Method"
                name="METHOD"
                value={componentProps.METHOD || "GET"}
                options={[
                    { value: "GET", label: "GET" },
                    { value: "POST", label: "POST" },
                    { value: "PUT", label: "PUT" },
                    { value: "DELETE", label: "DELETE" },
                ]}
                onChange={handlePropertyChange}
            />
            <SelectInput
                label="Background Color"
                name="backgroundColor"
                value={componentProps.backgroundColor || "primary"}
                options={backgroundColorOptions}
                onChange={handlePropertyChange}
            />
            <SelectInput
                label="Text Color"
                name="textColor"
                value={componentProps.textColor || "primary-content"}
                options={contentColorOptions}
                onChange={handlePropertyChange}
            />
            <CheckboxInput
                label="Disabled"
                name="disabled"
                checked={componentProps.disabled || false}
                onChange={handlePropertyChange}
            />
        </>
    ),
    Image: ({ componentProps, handlePropertyChange }) => (
        <>
            <TextInput
                label="Image URL"
                name="src"
                value={componentProps.src || "https://via.placeholder.com/150"}
                onChange={handlePropertyChange}
            />
            <TextInput
                label="Alt Text"
                name="alt"
                value={componentProps.alt || "Placeholder"}
                onChange={handlePropertyChange}
            />
            <TextInput
                label="CSS Class"
                name="className"
                value={componentProps.className || ""}
                onChange={handlePropertyChange}
                placeholder="Additional CSS classes (e.g., w-full, mx-auto)"
            />
        </>
    ),
};

componentConfigurations.Title.propTypes = {
    componentProps: PropTypes.shape({
        text: PropTypes.string,
        color: PropTypes.string,
        bold: PropTypes.bool,
        italic: PropTypes.bool,
        underline: PropTypes.bool,
        className: PropTypes.string,
    }).isRequired,
    handlePropertyChange: PropTypes.func.isRequired,
};

componentConfigurations.Image.propTypes = {
    componentProps: PropTypes.shape({
        src: PropTypes.string,
        alt: PropTypes.string,
        className: PropTypes.string,
    }).isRequired,
    handlePropertyChange: PropTypes.func.isRequired,
};

componentConfigurations.Button.propTypes = {
    componentProps: PropTypes.shape({
        text: PropTypes.string,
        URL: PropTypes.string,
        METHOD: PropTypes.string,
        backgroundColor: PropTypes.string,
        textColor: PropTypes.string,
        disabled: PropTypes.bool,
        className: PropTypes.string,
    }).isRequired,
    handlePropertyChange: PropTypes.func.isRequired,
};

componentConfigurations.Text.propTypes = {
    componentProps: PropTypes.shape({
        text: PropTypes.string,
        color: PropTypes.string,
        bold: PropTypes.bool,
        italic: PropTypes.bool,
        underline: PropTypes.bool,
        className: PropTypes.string,
    }).isRequired,
    handlePropertyChange: PropTypes.func.isRequired,
};