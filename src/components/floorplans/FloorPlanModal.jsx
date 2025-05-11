import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { FaTimes, FaImage, FaTrash, FaUpload } from "react-icons/fa";
import { baseUrl } from "../../consts.js";

export default function FloorPlanModal({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  isEditing,
  isImageMedia,
  onRemoveImage,
  floorPlans,
  selectedId,
}) {
  const dialogRef = useRef(null);
  const fileInputRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [imageInputType, setImageInputType] = useState("url");
  const [prevUrl, setPrevUrl] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
  
    if (open && !dialog.open) {
      dialog.showModal();
  
      if (!hasInitialized) {
        if (form.image) {
          if (form.image.startsWith("http")) {
            setImageInputType("url");
            setPrevUrl(form.image);
            setImagePreview(form.image);
          } else {
            setImageInputType("file");
            fetch(`${baseUrl}/media/${form.image}`, { method: "GET" })
              .then((response) => {
              if (response.ok) {
                setImagePreview(`${baseUrl}/media/${form.image}`);
              } else {
                setImagePreview(null);
              }
              })
              .catch(() => {
              setImagePreview(null);
              });
          }
        } else {
          setImageInputType("url");
          setImagePreview(null);
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
      setForm((f) => ({ ...f, image: "", file: null }));
      setImagePreview(null);
    } else if (newType === "url") {
      setForm((f) => ({ ...f, image: prevUrl || "", file: null }));
      setImagePreview(null);
    }
    setImageInputType(newType);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const trimmedName = form.name.trim().toLowerCase();
    const newErrors = {};
  
    if (!trimmedName) {
      newErrors.name = "Name is required";
    } else if (
      floorPlans.some(
        (fp) =>
          fp.name.trim().toLowerCase() === trimmedName &&
          (!isEditing || fp.id !== selectedId)
      )
    ) {
      newErrors.name = "A floor plan with this name already exists";
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
    setImagePreview(null);
    onClose();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((f) => ({ ...f, file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    if (file) {
      setForm((f) => ({ ...f, file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleClearFile = () => {
    setForm((f) => ({ ...f, file: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
              {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
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
                {!imagePreview ? (
                  <div
                    className="w-full border-dashed border-2 rounded-xl p-4 text-center bg-transparent border-gray-400"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="rounded-full bg-base-content w-16 h-16 mx-auto my-4 flex items-center justify-center">
                      <FaUpload className="text-base-100 text-2xl" />
                    </div>
                    <p>Drag and drop your image here or <span className="text-primary font-bold">Browse</span></p>
                    <p className="text-sm text-gray-400">Maximum file size: 5MB</p>
                  </div>
                ) : (
                  <div className="bg-base-200 w-full p-4 rounded-lg relative">
                    <button
                      onClick={() => {
                        if (form.file) {
                          handleClearFile();
                        } else if (isImageMedia) {
                          onRemoveImage();
                          setImagePreview(null);
                        }
                      }}
                      className="text-primary hover:text-error absolute right-3 top-3"
                      type="button"
                      aria-label="Remove image"
                    >
                      <FaTrash />
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 overflow-hidden rounded-md">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium">Image selected</p>
                        <p className="text-sm text-gray-500">
                          Click the trash icon to {form.file ? "remove the uploaded file" : "remove existing image"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
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
            <button type="button" className="btn" onClick={handleClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEditing ? "Update" : "Save"}</button>
          </div>
        </form>
      </div>
      <button className="modal-backdrop" onClick={handleClose} aria-label="Close modal" />
    </dialog>
  );
}

FloorPlanModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
  isImageMedia: PropTypes.bool.isRequired,
  onRemoveImage: PropTypes.func.isRequired,
  floorPlans: PropTypes.array.isRequired,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};