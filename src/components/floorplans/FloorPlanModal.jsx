import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { FaTimes, FaTrash, FaUpload } from "react-icons/fa";
import { baseUrl } from "../../consts.js";
import { useTranslation } from "react-i18next";

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
  const [isImageMarkedForRemoval, setIsImageMarkedForRemoval] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleDialogClose = () => {
      setHasInitialized(false);
      onClose();
    };

    const handleDialogCancel = (event) => {
      event.preventDefault();
      handleClose();
    };

    dialog.addEventListener("close", handleDialogClose);
    dialog.addEventListener("cancel", handleDialogCancel);

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

    return () => {
      dialog.removeEventListener("close", handleDialogClose);
      dialog.removeEventListener("cancel", handleDialogCancel);
    };
  }, [open, form.image, hasInitialized, onClose]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const trimmedName = form.name.trim().toLowerCase();
    const newErrors = {};
  
    if (!trimmedName) {
      newErrors.name = t("floorPlanModal.nameRequired");
    } else if (
      floorPlans.some(
        (fp) =>
          fp.name.trim().toLowerCase() === trimmedName &&
          (!isEditing || fp.id !== selectedId)
      )
    ) {
      newErrors.name = t("floorPlanModal.nameExists");
    }
  
    setErrors(newErrors);
  
    if (Object.keys(newErrors).length === 0) {
      if (isImageMarkedForRemoval) {
        await onRemoveImage();
      }
      setPrevUrl("");
      onSubmit();
    }
  };

  const handleClose = () => {
    setErrors({});
    setPrevUrl("");
    setImagePreview(null);
    setIsImageMarkedForRemoval(false);
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

  const title = isEditing ? t("floorPlanModal.editTitle") : t("floorPlanModal.addTitle");
  let removeTitle = t("floorPlanModal.removeImage");
  if (!form.image) removeTitle = t("floorPlanModal.noImageToRemove");
  else if (!isImageMedia) removeTitle = t("floorPlanModal.onlyInternalImages");

  return (
    <dialog ref={dialogRef} id="floor_plan_modal" className="modal">
      <div className="modal-box max-w-3xl">
        <button
          type="button"
          onClick={handleClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          aria-label={t("floorPlanModal.cancel")}
        >
          <FaTimes />
        </button>

        <h3 className="font-bold text-lg mb-4">{title}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label" htmlFor="fp-name">
                {t("floorPlanModal.name")} <span className="text-error">*</span>
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
                {t("floorPlanModal.selectImageInputType")}
              </label>
              <select
                id="image-input-type"
                className="select select-bordered w-full"
                value={imageInputType}
                onChange={handleImageInputTypeChange}
              >
                <option value="url">{t("floorPlanModal.imageUrl")}</option>
                <option value="file">{t("floorPlanModal.uploadFile")}</option>
              </select>
            </div>

            {imageInputType === "url" && (
              <div className="md:col-span-2">
                <label className="label" htmlFor="fp-image">
                  {t("floorPlanModal.imageUrl")} <span className="text-xs text-base-content/60">({t("floorPlanModal.optional")})</span>
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
                    <p>{t("floorPlanModal.dragAndDrop")} <span className="text-primary font-bold">{t("floorPlanModal.browse")}</span></p>
                    <p className="text-sm text-gray-400">{t("floorPlanModal.maxFileSize")}</p>
                  </div>
                ) : (
                  <div className="bg-base-200 w-full p-4 rounded-lg relative">
                    <button
                      onClick={() => {
                        if (form.file) {
                          handleClearFile();
                        } else if (isImageMedia) {
                          setIsImageMarkedForRemoval(true);
                          setImagePreview(null);
                          setForm((f) => ({ ...f, image: "" }));
                        }
                      }}
                      className="text-primary hover:text-error absolute right-3 top-3"
                      type="button"
                      aria-label={t("actions.removeImage")}
                    >
                      <FaTrash />
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 overflow-hidden rounded-md">
                        <img src={imagePreview} alt={t("floorPlanModal.preview")} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium">{t("floorPlanModal.imageSelected")}</p>
                        <p className="text-sm text-gray-500">
                          {t("floorPlanModal.clickTrashIcon")} {form.file ? t("floorPlanModal.removeUploadedFile") : t("floorPlanModal.removeExistingImage")}
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
                {form.image && !form.image.startsWith("http") && (
                  <p className="text-xs text-gray-500 mt-2">
                    UUID: <span className="font-mono">{form.image}</span>
                  </p>
                )}
              </div>
            )}

            <div className="md:col-span-2">
              <label className="label" htmlFor="fp-details">
                {t("floorPlanModal.details")}
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
            <button type="button" className="btn" onClick={handleClose}>{t("floorPlanModal.cancel")}</button>
            <button type="submit" className="btn btn-primary">{isEditing ? t("floorPlanModal.update") : t("floorPlanModal.add")}</button>
          </div>
        </form>
      </div>
      <button className="modal-backdrop" onClick={handleClose} aria-label={t("floorPlanModal.cancelModal")} />
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