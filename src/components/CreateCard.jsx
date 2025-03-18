// CreateCard.jsx
export default function CreateCard({ icon: Icon, title, description, onClick }) {
    return (
        <div className="btn btn-secondary w-full h-36 rounded-xl p-5 flex gap-2 shadow-lg" onClick={onClick}>
            <div>
                <Icon className="text-8xl text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-base-content">{title}</h1>
                <p className="text-white text-left text-sm mt-2">
                    {description}
                </p>
            </div>
        </div>
    );
}