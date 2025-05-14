import React from "react";
import PropTypes from "prop-types";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    return (
        <div className="flex justify-end mt-6 gap-2">
            <button
                className="btn btn-sm btn-secondary"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </button>
            <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
            </span>
            <button
                className="btn btn-sm btn-secondary"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );
}

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};