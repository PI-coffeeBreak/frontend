function ShortTextInput({ title, description, optional }) {
    return (
        <div className="form-control w-full mb-4">
            <label className="label">
                <span className="label-text text-black mb-1">
                    {title} {optional === "false" ? '*' : ''}
                </span>
            </label>
            <p></p>
            <label className="mb-2">{description}</label>
            <input
                type="text"
                className="input input-bordered w-full bg-secondary"
                maxLength="250"

            />
        </div>
    );
}

export default ShortTextInput;