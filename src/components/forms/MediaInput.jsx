import React, { useState, useRef } from "react";
import PropTypes from "prop-types";

export function MediaInput({
    onChange,
    accept = "image/*",
    multiple = false,
    maxSize = 5242880, // 5MB in bytes
    className = "",
}) {
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setError("");

        if (files.length === 0) return;

        // Validate file size
        const hasInvalidSize = files.some(file => file.size > maxSize);
        if (hasInvalidSize) {
            setError(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
            return;
        }

        // Create preview for image files
        if (files[0].type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(files[0]);
        } else {
            setPreview(null);
        }

        onChange(multiple ? files : files[0]);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);

        if (fileInputRef.current) {
            const dataTransfer = new DataTransfer();
            files.forEach(file => dataTransfer.items.add(file));
            fileInputRef.current.files = dataTransfer.files;

            // Trigger change event manually
            const changeEvent = new Event("change", { bubbles: true });
            fileInputRef.current.dispatchEvent(changeEvent);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    return (
        <div
            className={className}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
            <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: "2px dashed var(--color-primary)",
                    borderRadius: "8px",
                    padding: "20px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: "var(--color-base-100)",
                    color: "var(--color-base-content)"
                }}
            >
                {preview ? (
                    <div>
                        <img
                            src={preview}
                            alt="Preview"
                            style={{
                                maxWidth: "100%",
                                maxHeight: "200px",
                                marginBottom: "10px"
                            }}
                        />
                        <p>Click or drag to change file</p>
                    </div>
                ) : (
                    <p>Click or drag files here</p>
                )}
                {error && (
                    <p style={{ color: "var(--color-error)", marginTop: "10px" }}>
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}

MediaInput.propTypes = {
    onChange: PropTypes.func.isRequired,
    accept: PropTypes.string,
    multiple: PropTypes.bool,
    maxSize: PropTypes.number,
    className: PropTypes.string,
}; 