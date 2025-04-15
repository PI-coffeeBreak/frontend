import PropTypes from 'prop-types';
import { FaTrash } from 'react-icons/fa';

export default function Activity({id, title, description, image, category, type, onDelete }) {
    return (
        <div
            className="fc-event cursor-pointer flex items-center w-full gap-4 h-36 p-4 bg-white shadow-md rounded-md relative"
            data-id={id}
            data-title={title}
        >
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(id);
                    }}
                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-error rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Delete activity"
                    type="button"
                >
                    <FaTrash className="w-4 h-4" aria-hidden="true" />
                </button>
            )}
            
            <div className="w-1/3 h-full items-center justify-center hidden sm:block">
            {image ? (
                <img src={image} alt="Activity" className="w-full h-full object-cover rounded-md"/>
                ) : (
                <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                </div>
                )
            }
            </div>
            <div className="w-2/3">
                <h1 className="font-bold text-secondary text-sm">{title}</h1>
                <p className="text-sm mt-2 text-gray-600">{description}</p>
                <div className="mt-1 flex">
                    <span className="badge badge-secondary">{type}</span>
                    {category &&
                        <span className="badge ml-2 badge-primary">{category}</span>
                    }
                </div>
            </div>
        </div>
    );
}

Activity.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    image: PropTypes.string,
    category: PropTypes.string,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func
};

Activity.defaultProps = {
    description: '',
    image: '',
    category: '',
    onDelete: null
};