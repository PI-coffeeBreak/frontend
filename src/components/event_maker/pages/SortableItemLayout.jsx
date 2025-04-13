import React from "react";
import PropTypes from "prop-types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaBars, FaTrash } from "react-icons/fa";

export function SortableItemLayout({ id, children, onRemove }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative flex items-center gap-4 w-full"
        >
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