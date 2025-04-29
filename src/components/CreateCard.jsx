// CreateCard.jsx
import PropTypes from 'prop-types';

const CreateCard = ({ icon: Icon, title, description, onClick, disabled = false, disabledMessage = '' }) => {
    return (
        <button 
            className={`card w-full bg-secondary text-secondary-content shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} 
            onClick={onClick}
            disabled={disabled}
            title={disabled ? disabledMessage : undefined}
        >
            <div className="card-body p-6 flex flex-col items-center text-center h-full">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Icon className="text-4xl" />
                </div>
                
                <h2 className="card-title text-xl mb-2">{title}</h2>
                <p className="text-sm mb-4">{description}</p>
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