import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { FaTimes, FaImage, FaTrash, FaUpload } from "react-icons/fa";

export default function FloorPlanModal({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  isEditing,
  isImageMedia,
  onRemoveImage
}) {
  const dialogRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [imageInputType, setImageInputType] = useState("url");
  const [prevUrl, setPrevUrl] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
  
    if (open && !dialog.open) {
      dialog.showModal();
  
      if (!hasInitialized) {
        if (form.image && !form.image.startsWith("http")) {
          setImageInputType("file");
        } else {
          setImageInputType("url");
          setPrevUrl(form.image || "");
        }
        setHasInitialized(true);
      }
    } else if (!open && dialog.open) {
      dialog.close();
      setHasInitialized(false);
    }
  }, [open]);  

  const handleImageInputTypeChange = (e) => {
    const newType = e.target.value;
    if (newType === "file") {
      if (form.image && form.image.startsWith("http")) {
        setPrevUrl(form.image);
      }
      setForm((f) => ({ ...f, image: "" }));
    } else if (newType === "url") {
      setForm((f) => ({ ...f, image: prevUrl || "" }));
    }
    setImageInputType(newType);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setPrevUrl("");
      onSubmit();
    }
  };

  const handleClose = () => {
    setErrors({});
    setPrevUrl("");
    onClose();
  };

  const title = isEditing ? "Edit Floor Plan" : "Add Floor Plan";
  let removeTitle = "Remove image";
  if (!form.image) removeTitle = "No image to remove";
  else if (!isImageMedia) removeTitle = "Only media‑service images can be removed";

  const isUuid = form.image && !form.image.startsWith("http");

  return (
    <dialog ref={dialogRef} id="floor_plan_modal" className="modal">
      <div className="modal-box max-w-3xl">
        <button
          type="button"
          onClick={handleClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        <h3 className="font-bold text-lg mb-4">{title}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label" htmlFor="fp-name">
                Name <span className="text-error">*</span>
              </label>
              <input
                id="fp-name"
                className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              {errors.name && (
                <p className="text-error text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="label" htmlFor="image-input-type">
                Select Image Input Type
              </label>
              <select
                id="image-input-type"
                className="select select-bordered w-full"
                value={imageInputType}
                onChange={handleImageInputTypeChange}
              >
                <option value="url">Image URL</option>
                <option value="file">Upload File</option>
              </select>
            </div>

            {imageInputType === "url" && (
              <div className="md:col-span-2">
                <label className="label" htmlFor="fp-image">
                  Image URL <span className="text-xs text-base-content/60">(optional)</span>
                </label>
                <input
                  id="fp-image"
                  className="input input-bordered w-full"
                  placeholder="http(s)://…"
                  value={form.image && form.image.startsWith("http") ? form.image : ""}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                />
              </div>
            )}

            {imageInputType === "file" && (
              <div className="md:col-span-2">
                <label className="label flex items-center gap-2">
                  <FaImage /> Upload new image {isUuid && <span className="text-xs">({form.image})</span>}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input w-full"
                    onChange={(e) => setForm((f) => ({ ...f, file: e.target.files[0] }))}
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={onRemoveImage}
                      className={`btn btn-sm ${isImageMedia ? "btn-error" : "btn-disabled text-gray-400"}`}
                      disabled={!isImageMedia}
                      title={removeTitle}
                    >
                      <FaTrash className="mr-1" /> Remove Image
                    </button>
                  )}
                </div>
                {form.file && (
                  <p className="text-xs mt-1 flex items-center gap-1 text-gray-500">
                    <FaUpload /> {form.file.name}
                  </p>
                )}
              </div>
            )}

            <div className="md:col-span-2">
              <label className="label" htmlFor="fp-details">
                Details / Description
              </label>
              <textarea
                id="fp-details"
                rows={4}
                className="textarea textarea-bordered w-full"
                value={form.details}
                onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
              />
            </div>
          </div>

          <div className="modal-action mt-0">
            <button type="button" className="btn" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>

      <button className="modal-backdrop" onClick={handleClose} aria-label="Close modal" />
    </dialog>
  );
}
