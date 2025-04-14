import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { baseUrl } from "../../consts";
import { axiosWithAuth } from "../../utils/axiosWithAuth";
import { useKeycloak } from "@react-keycloak/web";

export function MediaInput({
    onChange,
    value,
    accept = "image/*",
    multiple = false,
    maxSize = 5242880, // 5MB in bytes
    className = "",
    name = "media"
}) {
    const { keycloak } = useKeycloak();
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const getMediaUrl = (uuid) => `${baseUrl}/media/${uuid}`;

    // Handle initial value
    useEffect(() => {
        if (value?.uuid) {
            setPreview(getMediaUrl(value.uuid));
        }
    }, [value]);

    const handleUpload = async (file) => {
        setIsUploading(true);
        setError("");

        try {
            // First register the media
            const { data: { uuid } } = await axiosWithAuth(keycloak).post(`${baseUrl}/media/register`);
            console.log('Media registered with UUID:', uuid);

            // Then upload the file
            const formData = new FormData();
            formData.append('file', file);

            await axiosWithAuth(keycloak).post(
                `${baseUrl}/media/${uuid}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('Media uploaded successfully');

            // Update preview with the media URL
            const mediaUrl = getMediaUrl(uuid);
            console.log('Setting preview to:', mediaUrl);
            setPreview(mediaUrl);

            // Call onChange with the media object
            const mediaValue = { uuid };
            console.log('Calling onChange with value:', mediaValue);
            onChange({
                target: {
                    name: name,
                    value: mediaValue,
                    type: 'file'
                }
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            setError('Failed to upload file. Please try again.');
            setPreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);
        setError("");

        if (files.length === 0) return;

        // Validate file size
        const hasInvalidSize = files.some(file => file.size > maxSize);
        if (hasInvalidSize) {
            setError(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
            return;
        }

        // Handle upload for each file
        if (multiple) {
            await Promise.all(files.map(handleUpload));
        } else {
            await handleUpload(files[0]);
        }
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

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fileInputRef.current?.click();
        }
    };

    return (
        <div className={className}>
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
                id={`file-input-${name}`}
                name={name}
                aria-label="Choose file"
                style={{ display: "none" }}
                disabled={isUploading}
            />
            <label
                htmlFor={`file-input-${name}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onKeyDown={handleKeyDown}
                tabIndex="0"
                role="button"
                aria-disabled={isUploading}
                style={{
                    border: "2px dashed var(--color-primary)",
                    borderRadius: "8px",
                    padding: "20px",
                    textAlign: "center",
                    cursor: isUploading ? "default" : "pointer",
                    backgroundColor: "var(--color-base-100)",
                    color: "var(--color-base-content)",
                    opacity: isUploading ? 0.7 : 1,
                    display: "block"
                }}
            >
                {isUploading ? (
                    <p role="status" aria-live="polite">Uploading...</p>
                ) : preview ? (
                    <>
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
                    </>
                ) : (
                    <p>Click or drag files here</p>
                )}
                {error && (
                    <p
                        role="alert"
                        style={{
                            color: "var(--color-error)",
                            marginTop: "10px",
                            fontSize: "0.875rem"
                        }}
                    >
                        {error}
                    </p>
                )}
            </label>
        </div>
    );
}

MediaInput.propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.shape({
        uuid: PropTypes.string.isRequired,
    }),
    accept: PropTypes.string,
    multiple: PropTypes.bool,
    maxSize: PropTypes.number,
    className: PropTypes.string,
    name: PropTypes.string,
}; 