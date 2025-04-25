// CreateCard.jsx
export default function CreateCard({ icon: Icon, title, description, onClick, disabled, disabledMessage }) {
    return (
        <div 
            className={`card bg-secondary text-secondary-content shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={disabled ? undefined : onClick}
            title={disabled ? disabledMessage : undefined}
        >
            <div className="card-body p-6 flex flex-col items-center text-center h-full">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Icon className="text-4xl" />
                </div>
                
                <h2 className="card-title text-xl mb-2">{title}</h2>
                <p className="text-sm mb-4">{description}</p>
            </div>
        </div>
    );
}