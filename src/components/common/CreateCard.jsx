// CreateCard.jsx
import PropTypes from 'prop-types';

const CreateCard = ({ icon: Icon, title, description, onClick, disabled = false, disabledMessage = '' }) => {
    return (
        <button 
            className={`card w-full bg-secondary rounded-xl text-secondary-content shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={onClick}
            disabled={disabled}
            title={disabled ? disabledMessage : undefined}
        >
            <div className="card-body p-6 flex flex-row items-center h-full space-x-4 text-left">
                <div className="w-16 h-16 rounded-full flex items-center justify-center">
                    <Icon className="text-4xl lg:text-8xl" />
                </div>

                <div>
                    <h2 className="card-title text-xl mb-2">{title}</h2>
                    <p className="text-sm">{description}</p>
                </div>
            </div>
        </button>
    );
};

CreateCard.propTypes = {
    icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    disabledMessage: PropTypes.string
};

export default CreateCard;