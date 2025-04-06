import React from "react";
import PropTypes from "prop-types";
import { TextInput, CheckboxInput, SelectInput } from "./CommonInputs";

const textColorOptions = [
    { value: "text-gray-700", label: "Default" },
    { value: "text-red-500", label: "Red" },
    { value: "text-blue-500", label: "Blue" },
    { value: "text-green-500", label: "Green" },
    { value: "text-yellow-500", label: "Yellow" },
];

const backgroundColorOptions = [
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
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
                value={componentProps.text}
                onChange={handlePropertyChange}
            />
            <SelectInput
                label="Color"
                name="color"
                value={componentProps.color}
                options={textColorOptions}
                onChange={handlePropertyChange}
            />
            <div className="mb-2 flex items-center gap-4">
                <CheckboxInput
                    label="Bold"
                    name="bold"
                    checked={componentProps.bold}
                    onChange={handlePropertyChange}
                />
                <CheckboxInput
                    label="Italic"
                    name="italic"
                    checked={componentProps.italic}
                    onChange={handlePropertyChange}
                />
            </div>
        </>
    ),
    Text: ({ componentProps, handlePropertyChange }) => (
        <>
            <TextInput
                label="Content"
                name="content"
                value={componentProps.content}
                onChange={handlePropertyChange}
            />
            <SelectInput
                label="Text Color"
                name="className"
                value={componentProps.className}
                options={textColorOptions}
                onChange={handlePropertyChange}
            />
            <div className="mb-2 flex items-center gap-4">
                <CheckboxInput
                    label="Bold"
                    name="bold"
                    checked={componentProps.bold}
                    onChange={handlePropertyChange}
                />
                <CheckboxInput
                    label="Italic"
                    name="italic"
                    checked={componentProps.italic}
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
                value={componentProps.text}
                onChange={handlePropertyChange}
            />
            <TextInput
                label="URL"
                name="URL"
                value={componentProps.URL}
                onChange={handlePropertyChange}
            />
            <SelectInput
                label="HTTP Method"
                name="METHOD"
                value={componentProps.METHOD}
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
                value={componentProps.backgroundColor}
                options={backgroundColorOptions}
                onChange={handlePropertyChange}
            />
            <SelectInput
                label="Text Color"
                name="textColor"
                value={componentProps.textColor}
                options={textColorOptions}
                onChange={handlePropertyChange}
            />
            <CheckboxInput
                label="Disabled"
                name="disabled"
                checked={componentProps.disabled}
                onChange={handlePropertyChange}
            />
        </>
    ),
    Image: ({ componentProps, handlePropertyChange }) => (
        <>
            <TextInput
                label="Image URL"
                name="src"
                value={componentProps.src}
                onChange={handlePropertyChange}
            />
            <TextInput
                label="Alt Text"
                name="alt"
                value={componentProps.alt}
                onChange={handlePropertyChange}
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
    }).isRequired,
    handlePropertyChange: PropTypes.func.isRequired,
};

componentConfigurations.Image.propTypes = {
    componentProps: PropTypes.shape({
        src: PropTypes.string,
        alt: PropTypes.string,
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
    }).isRequired,
    handlePropertyChange: PropTypes.func.isRequired,
};

componentConfigurations.Text.propTypes = {
    componentProps: PropTypes.shape({
        content: PropTypes.string,
        className: PropTypes.string,
        bold: PropTypes.bool,
        italic: PropTypes.bool,
    }).isRequired,
    handlePropertyChange: PropTypes.func.isRequired,
};