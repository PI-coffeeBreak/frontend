export default function Activity({ title, description, image, category, type }) {
    return (
        <div
            className="fc-event cursor-pointer flex items-center w-full h-36 p-4 bg-white shadow-md rounded-md"
            data-title={title}
        >
            <div className="w-1/3 h-full flex items-center justify-center">
                <img src={image} alt="Activity" className="w-full h-full object-cover rounded-md"/>
            </div>
            <div className="w-2/3 pl-4">
                <h1 className="font-bold text-secondary text-sm">{title}</h1>
                <p className="text-sm mt-2 text-gray-600">{description}</p>
                <div className="mt-1 flex">
                    <span className="badge badge-primary">{category}</span>
                    <span className="badge badge-secondary ml-2">{type}</span>
                </div>
            </div>
        </div>
    );
}