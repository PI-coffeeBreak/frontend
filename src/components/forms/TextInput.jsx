function TextInput({ title, description, optional }) {
    return (
        <div className="form-control w-full mb-4">
            <label className="label">
            <span className="label-text text-black mb-1">
                    {title} {optional === "false" ? '*' : ''}
                </span>
            </label>
            <input
                type="text"
                className="input input-bordered w-full bg-secondary"
                placeholder={description}
            />
        </div>
    );
}

export default TextInput;