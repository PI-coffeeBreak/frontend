import { useState } from "react";

function Checkbox({ title, kind, options, optional }) {
    // State to manage the toggle's checked status
    const [isChecked, setIsChecked] = useState(false);

    // Toggle the state when the checkbox is clicked
    const handleToggleChange = () => {
        setIsChecked(!isChecked);
    };

    return (
        <div className="form-control w-full mb-4">
            {/* Using flex to align title and toggle on the same line */}
            <div className="flex items-center justify-between mb-2">
                <label className="label">
                    <span className="label-text text-black">
                        {title} {optional === "false" ? '*' : ''}
                    </span>
                </label>
                {/* Toggle */}
                {kind === "toogle" && (
                    <label className="cursor-pointer">
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={isChecked}
                            onChange={handleToggleChange}
                        />
                        <div className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 transition duration-300 ${isChecked ? "bg-primary" : "bg-gray-400"}`}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${isChecked ? "translate-x-4" : "translate-x-0"}`}></div>
                        </div>
                    </label>
                )}
            </div>

            {/* Render other options like radio buttons or checkboxes */}
            {kind === "single" && (
                <div className="space-y-2">
                    {options.map((option, idx) => (
                        <label key={idx} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="single-choice" className="radio radio-primary" />
                            <span>{option}</span>
                        </label>
                ))}
            </div>
            )}

            {kind === "multiple" && (
                <div className="space-y-2">
                    {options.map((option, idx) => (
                        <label key={idx} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="checkbox checkbox-primary" />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Checkbox;