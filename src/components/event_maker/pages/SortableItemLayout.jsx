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
            className={`relative flex items-center gap-4 w-full ${isDragging ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        >
            {isDragging && (
                <div className="absolute inset-0 bg-base-200 opacity-50 rounded-lg pointer-events-none" />
            )}
            
            <div className="flex-grow p-4 bg-white shadow rounded-lg">
                {children}
            </div>

            <button
                onClick={onRemove}
                className="text-gray-500 hover:text-red-500 p-2 rounded-full"
                title="Remove Section"
            >
                <FaTrash />
            </button>

            <div
                {...listeners}
                {...attributes}
                className="flex-shrink-0 bg-gray-700 text-white p-2 rounded-full cursor-grab shadow-md"
                title="Drag"
            >
                <FaBars />
            </div>
        </div>
    );
}

SortableItemLayout.propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    onRemove: PropTypes.func.isRequired,
};