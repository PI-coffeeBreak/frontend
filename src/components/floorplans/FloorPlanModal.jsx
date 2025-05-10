import { useEffect, useRef, useState } from "react";
import PropTypes            from "prop-types";
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

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit();
    }
  };

  const title       = isEditing ? "Edit Floor Plan" : "Add Floor Plan";
  let   removeTitle = "Remove image";
  if (!form.image)        removeTitle = "No image to remove";
  else if (!isImageMedia) removeTitle = "Only media‑service images can be removed";

  return (
    <dialog ref={dialogRef} id="floor_plan_modal" className="modal">
      <div className="modal-box max-w-3xl">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        <h3 className="font-bold text-lg mb-4">{title}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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

            <div>
              <label className="label" htmlFor="fp-image">
                Image URL <span className="text-xs text-base-content/60">(optional)</span>
              </label>
              <input
                id="fp-image"
                className="input input-bordered w-full"
                placeholder="http(s)://…"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="label flex items-center gap-2">
                <FaImage /> Upload new image
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
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>

      <button className="modal-backdrop" onClick={onClose} aria-label="Close modal" />
    </dialog>
  );
}

FloorPlanModal.propTypes = {
  open:          PropTypes.bool.isRequired,
  onClose:       PropTypes.func.isRequired,
  onSubmit:      PropTypes.func.isRequired,
  form:          PropTypes.object.isRequired,
  setForm:       PropTypes.func.isRequired,
  isEditing:     PropTypes.bool.isRequired,
  isImageMedia:  PropTypes.bool.isRequired,
  onRemoveImage: PropTypes.func.isRequired
};
