function Selector({ title, description, options, optional }) {
    return (
        <div className="form-control w-full mb-4">
            <label className="label">
                <span className="label-text text-black mb-2">
                    {title} {optional === "false" ? '*' : ''}
                </span>
            </label>
            <select className="select select-bordered w-full bg-secondary">
                <option>{description}</option>
                {options.map((option, idx) => (
                    <option key={idx} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Selector;