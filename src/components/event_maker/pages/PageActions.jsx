import React from 'react';
import PropTypes from 'prop-types';

export function PageActions({
    onBack,
    onSave,
    isLoading,
    hasUnsavedChanges,
    saveButtonText = "Save Page",
    loadingText = "Saving..."
}) {
    return (
        <div className="mt-8 flex justify-between items-center">
            <button
                onClick={onBack}
                className="btn btn-outline gap-2 px-6"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Pages
            </button>

            <button
                onClick={onSave}
                className={`btn btn-lg gap-2 px-8 ${isLoading ? "btn-disabled" : hasUnsavedChanges ? "btn-primary" : "btn-disabled"}`}
                disabled={isLoading || !hasUnsavedChanges}
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                        </svg>
                        {loadingText}
                    </span>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        {saveButtonText}
                    </>
                )}
            </button>
        </div>
    );
}

PageActions.propTypes = {
    onBack: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    hasUnsavedChanges: PropTypes.bool,
    saveButtonText: PropTypes.string,
    loadingText: PropTypes.string
};

PageActions.defaultProps = {
    hasUnsavedChanges: false,
    saveButtonText: "Save Page",
    loadingText: "Saving..."
}; 