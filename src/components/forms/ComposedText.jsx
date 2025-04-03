function ComposedText({ title, description, optional }) {
    return (
        <div className="form-control w-full mb-4">
            <label className="label">
                <span className="label-text">
                    {title} {optional === "false" ? '*' : ''}
                </span>
            </label>

            {/* Template Name Input */}
            <input
                type="text"
                className="input input-bordered w-full mb-2 bg-secondary"
                placeholder="Template name"
            />

            {/* Template Text Textarea */}
            <textarea
                className="textarea textarea-bordered w-full bg-secondary"
                placeholder={description}
            />
        </div>
    );
}

export default ComposedText;