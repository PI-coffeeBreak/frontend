import React from 'react';
import PropTypes from 'prop-types';

export function PageHeader({ title, subtitle, mode, hasUnsavedChanges }) {
    return (
        <div className="bg-base-200 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p className="text-sm text-base-content/70 mt-1">
                        {subtitle}
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    <div className="badge badge-outline p-3">{mode} Mode</div>
                    {hasUnsavedChanges && (
                        <div className="badge badge-accent text-white font-bold p-3">
                            Unsaved changes
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    hasUnsavedChanges: PropTypes.bool
};

PageHeader.defaultProps = {
    hasUnsavedChanges: false
}; 