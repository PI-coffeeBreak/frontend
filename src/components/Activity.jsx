import PropTypes from 'prop-types';

export default function Activity({id, title, description, image, category, type }) {
    return (
        <div
            className="fc-event cursor-pointer flex items-center w-full gap-4 h-36 p-4 bg-white shadow-md rounded-md"
            data-id={id}
            data-title={title}
        >
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
    type: PropTypes.string.isRequired
};

Activity.defaultProps = {
    description: '',
    image: '',
    category: ''
};