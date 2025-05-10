import { useEffect, useRef } from "react";
import PropTypes            from "prop-types";
import { FaTimes, FaImage, FaTrash, FaUpload } from "react-icons/fa";

/**
 * Modal (criar / editar Floor‑Plan)
 *
 * ⬇ props
 * ───────────────────────────────────────────────────────────
 * open          : bool        ‑ controlo de visibilidade
 * onClose       : fn          ‑ callback para fechar
 * onSubmit      : fn          ‑ callback “Save / Update”
 * form          : {…}         ‑ estado do form (name, details…)
 * setForm       : fn          ‑ setter do form
 * isEditing     : bool
 * isImageMedia  : bool        ‑ se a imagem está no media‑service
 * onRemoveImage : fn          ‑ handler para remover imagem
 */
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
  /* ------------------------------------------------------- *
   * 1. ‑ referenciar o <dialog> e controlar showModal()     *
   * ------------------------------------------------------- */
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();   // abre + backdrop
    } else {
      if (dialog.open) dialog.close();        // fecha
    }
  }, [open]);

  /* ------------------------------------------------------- *
   * 2. – textos dinâmicos                                   *
   * ------------------------------------------------------- */
  const title       = isEditing ? "Edit Floor Plan" : "Add Floor Plan";
  let   removeTitle = "Remove image";
  if (!form.image)        removeTitle = "No image to remove";
  else if (!isImageMedia) removeTitle = "Only media‑service images can be removed";

  /* ------------------------------------------------------- *
   * 3. ‑ JSX                                                *
   * ------------------------------------------------------- */
  return (
    <dialog ref={dialogRef} id="floor_plan_modal" className="modal">
      {/* Caixa do modal */}
      <div className="modal-box max-w-3xl">
        {/* Fechar (X) */}
        <button
          type="button"
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {/* Título */}
        <h3 className="font-bold text-lg mb-4">{title}</h3>

        {/* Formulário */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <label className="label" htmlFor="fp-name">
                Name <span className="text-error">*</span>
              </label>
              <input
                id="fp-name"
                className="input input-bordered w-full"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* URL da imagem */}
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

            {/* Upload & Remover */}
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
                    <FaTrash className="mr-1" /> Remove
                  </button>
                )}
              </div>

              {form.file && (
                <p className="text-xs mt-1 flex items-center gap-1 text-gray-500">
                  <FaUpload /> {form.file.name}
                </p>
              )}
            </div>

            {/* Descrição */}
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

          {/* Ações */}
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

      {/* Clique fora para fechar */}
      <button className="modal-backdrop" onClick={onClose} aria-label="Close modal" />
    </dialog>
  );
}

/* --------------------------------------------------------- *
 * PropTypes                                                 *
 * --------------------------------------------------------- */
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
