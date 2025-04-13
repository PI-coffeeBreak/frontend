import React from 'react';
import PropTypes from 'prop-types';

export function PageTitleInput({ title, onChange }) {
    return (
        <div className="mb-4">
            <label htmlFor="page-title" className="block text-sm font-medium text-gray-700">
                Page Title
            </label>
            <input
                id="page-title"
                type="text"
                value={title}
                onChange={(e) => onChange(e.target.value)}
                className="input mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Enter page title"
            />
        </div>
    );
}

PageTitleInput.propTypes = {
    title: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
}; 