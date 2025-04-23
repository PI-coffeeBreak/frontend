import React from "react";
import PropTypes from "prop-types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaBars, FaTrash } from "react-icons/fa";

export function SortableItemLayout({ id, children, onRemove }) {
    const { 
        attributes, 
        listeners, 
        setNodeRef, 
        transform, 
        transition,
        isDragging 
    } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 999 : 1,
        width: '100%',
        position: 'relative',
        transformOrigin: '0 0',
        pointerEvents: isDragging ? 'none' : 'all'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative flex items-center gap-4 w-full ${
                isDragging ? 'ring-2 ring-primary ring-offset-2' : 'hover:bg-base-100/50'
            }`}
        >
            {isDragging && (
                <div className="absolute inset-0 bg-base-200 opacity-50 rounded-lg pointer-events-none">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-pulse w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                    </div>
                </div>
            )}
            
            <div className="flex-grow p-4 bg-white shadow rounded-lg">
                {children}
            </div>

            <button
                onClick={onRemove}
                className="text-gray-500 hover:text-white hover:bg-red-500 p-2 rounded-full transition-colors duration-200"
                title="Remove Section"
            >
                <FaTrash className="w-4 h-4" />
            </button>

            <div
                {...listeners}
                {...attributes}
                className="flex-shrink-0 bg-gradient-to-b from-gray-600 to-gray-800 text-white p-2 rounded-full 
                    cursor-ns-resize shadow-md relative group hover:from-gray-500 hover:to-gray-700
                    active:scale-95 transition-all duration-150"
                title="Drag to reposition"
            >
                <FaBars className="w-4 h-4" />
            </div>
        </div>
    );
}

SortableItemLayout.propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    onRemove: PropTypes.func.isRequired,
};