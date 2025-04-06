import React from "react";

export const componentConfigurations = {
    Title: ({ componentProps, handlePropertyChange }) => (
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
            <div className="mb-2 flex items-center gap-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="bold"
                        checked={componentProps.bold || false}
                        onChange={handlePropertyChange}
                        className="checkbox checkbox-primary"
                    />
                    <span className="text-xs font-medium text-gray-700">Bold</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="italic"
                        checked={componentProps.italic || false}
                        onChange={handlePropertyChange}
                        className="checkbox checkbox-primary"
                    />
                    <span className="text-xs font-medium text-gray-700">Italic</span>
                </label>
            </div>
        </>
    ),
    Text: ({ componentProps, handlePropertyChange }) => (
        <>
            <div className="mb-2">
                <label className="block text-xs font-medium text-gray-700">Content</label>
                <textarea
                    name="content"
                    value={componentProps.content || ""}
                    onChange={handlePropertyChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            <div className="mb-2">
                <label className="block text-xs font-medium text-gray-700">Text Color</label>
                <select
                    name="className"
                    value={componentProps.className || ""}
                    onChange={handlePropertyChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                    <option value="text-gray-700">Default</option>
                    <option value="text-red-500">Red</option>
                    <option value="text-blue-500">Blue</option>
                    <option value="text-green-500">Green</option>
                    <option value="text-yellow-500">Yellow</option>
                </select>
            </div>
            <div className="mb-2 flex items-center gap-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="bold"
                        checked={componentProps.bold || false}
                        onChange={handlePropertyChange}
                        className="checkbox checkbox-primary"
                    />
                    <span className="text-xs font-medium text-gray-700">Bold</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="italic"
                        checked={componentProps.italic || false}
                        onChange={handlePropertyChange}
                        className="checkbox checkbox-primary"
                    />
                    <span className="text-xs font-medium text-gray-700">Italic</span>
                </label>
            </div>
        </>
    ),
    Button: ({ componentProps, handlePropertyChange }) => (
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
                <label className="block text-xs font-medium text-gray-700">HTTP Method</label>
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
                <label className="block text-xs font-medium text-gray-700">Background Color</label>
                <select
                    name="backgroundColor"
                    value={componentProps.backgroundColor || "primary"}
                    onChange={handlePropertyChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                    {colorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-2">
                <label className="block text-xs font-medium text-gray-700">Text Color</label>
                <select
                    name="textColor"
                    value={componentProps.textColor || "primary-content"}
                    onChange={handlePropertyChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                    {textColorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-2">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="disabled"
                        checked={componentProps.disabled || false}
                        onChange={handlePropertyChange}
                        className="checkbox checkbox-primary"
                    />
                    <span className="text-xs font-medium text-gray-700">Disabled</span>
                </label>
            </div>
        </>
    ),
    Image: ({ componentProps, handlePropertyChange }) => (
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
    ),
};