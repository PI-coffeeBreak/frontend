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
    const getButtonClass = (isLoading, hasUnsavedChanges) => {
        if (isLoading) return "btn-disabled";
        if (hasUnsavedChanges) return "btn-primary";
        return "btn-disabled";
    };
    return (
        <div className="mt-8 flex justify-between items-center">
            <button
                onClick={onBack}
                className="btn btn-secondary rounded-xl gap-2 px-6"
            >
                Back to Pages
            </button>

            <button
                onClick={onSave}
                className={`btn btn-primary rounded-xl gap-2 px-8 ${getButtonClass(isLoading, hasUnsavedChanges)}`}
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