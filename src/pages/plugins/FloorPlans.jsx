import { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaImage,
  FaUpload,
} from "react-icons/fa";
import { useKeycloak } from "@react-keycloak/web";
import { axiosWithAuth } from "../../utils/axiosWithAuth.js";
import { baseUrl } from "../../consts.js";
import { useNotification } from "../../contexts/NotificationContext.jsx";

const apiUrl = `${baseUrl}/floor-plan-plugin/floor_plan`;
const ITEMS_PER_PAGE = 6;

export function FloorPlans() {
  const { keycloak } = useKeycloak();
  const { showNotification } = useNotification();

  const [floorPlans, setFloorPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    name: "",
    details: "",
    image: "",
    file: null,
  });

  const [page, setPage] = useState(1);
  const [isImageMedia, setIsImageMedia] = useState(false);

  const resetForm = () =>
    setForm({ name: "", details: "", image: "", file: null });

  const cancelForm = () => {
    resetForm();
    setAdding(false);
    setEditing(false);
    setSelected(null);
  };

  const fetchFloorPlans = async () => {
    setLoading(true);
    try {
      const { data } = await axiosWithAuth(keycloak).get(apiUrl);

      const resolved = data.map((fp) => {
        let imageUrl = "";

        if (fp.image) {
          if (fp.image.startsWith("http")) {
            imageUrl = fp.image;
          } else {
            imageUrl = `${baseUrl}/media/${fp.image}`;
          }
        }

        return {
          ...fp,
          image: imageUrl,
        };
      });

      setFloorPlans(resolved);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load floor-plans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(fetchFloorPlans, []);

  const extractUuid = (image) =>
    image?.startsWith(`${baseUrl}/media/`) ? image.split("/").pop() : image;

  const checkIfImageIsMedia = async (imageIdOrUrl) => {
    const uuid = extractUuid(imageIdOrUrl);
    if (!uuid || uuid.startsWith("http")) return setIsImageMedia(false);

    try {
      const res = await axiosWithAuth(keycloak).get(`${baseUrl}/media/${uuid}`);
      setIsImageMedia(res.status === 200);
    } catch {
      setIsImageMedia(false);
    }
  };

  const uploadToMediaService = async (uuid, file) => {
    const fd = new FormData();
    fd.append("file", file);
    await axiosWithAuth(keycloak, {
      headers: { "Content-Type": "multipart/form-data" },
    }).post(`${baseUrl}/media/${uuid}`, fd);
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      showNotification("Name is required", "warning");
      return;
    }

    try {
      const body = {
        name: form.name,
        details: form.details,
        image: form.file ? "" : form.image.trim(),
      };
      const { data } = await axiosWithAuth(keycloak).post(apiUrl, body);

      if (form.file && data.image && !data.image.startsWith("http")) {
        await uploadToMediaService(data.image, form.file);
      }

      setFloorPlans((fps) => [
        ...fps,
        {
          ...data,
          image:
            data.image && !data.image.startsWith("http")
              ? `${baseUrl}/media/${data.image}`
              : data.image,
        },
      ]);

      showNotification("Floor Plan Created", "success");
      cancelForm();
      setPage(Math.ceil((floorPlans.length + 1) / ITEMS_PER_PAGE) || 1);
    } catch (err) {
      console.error(err);
      showNotification("Creation failed", "error");
    }
  };

  const handleUpdate = async () => {
    if (!selected || !form.name.trim()) {
      if (!form.name.trim()) showNotification("Name is required", "warning");
      return;
    }

    try {
      let imagePayload = extractUuid(form.image);

      if (form.file) {
        const currentUuid = extractUuid(selected.image);

        imagePayload = currentUuid || "";
      }

      const { data } = await axiosWithAuth(keycloak).put(
        `${apiUrl}/${selected.id}`,
        {
          name: form.name,
          details: form.details,
          image: imagePayload,
        }
      );

      if (form.file && data.image && !data.image.startsWith("http")) {
        await uploadToMediaService(data.image, form.file);
      }

      setFloorPlans((fps) =>
        fps.map((fp) =>
          fp.id === selected.id
            ? {
                ...data,
                image:
                  data.image && !data.image.startsWith("http")
                    ? `${baseUrl}/media/${data.image}?t=${Date.now()}`
                    : data.image,
              }
            : fp
        )
      );

      showNotification("Floor Plan Updated", "success");
      cancelForm();
    } catch (err) {
      console.error(err);
      showNotification("Update failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this floor-plan?")) return;
    try {
      await axiosWithAuth(keycloak).delete(`${apiUrl}/${id}`);
      setFloorPlans((fps) => fps.filter((fp) => fp.id !== id));
      showNotification("Floor Plan Deleted", "success");
      cancelForm();

      const maxPage = Math.ceil((floorPlans.length - 1) / ITEMS_PER_PAGE) || 1;
      setPage((p) => Math.min(p, maxPage));
    } catch (e) {
      console.error(e);
      showNotification("Deletion failed", "error");
    }
  };

  const handleRemoveImage = async () => {
    if (!selected) return;
    const uuid = extractUuid(selected.image);
    if (!uuid || uuid.startsWith("http")) return;

    try {
      await axiosWithAuth(keycloak).delete(`${baseUrl}/media/${uuid}`);
      showNotification("Image removed", "success");

      setForm((f) => ({ ...f, file: null }));
      setIsImageMedia(false);
      setFloorPlans((fps) =>
        fps.map((fp) =>
          fp.id === selected.id
            ? { ...fp, image: `${uuid}` }
            : fp
        )
      );
    } catch (err) {
      console.error(err);
      showNotification("Failed to remove image", "error");
    }
  };

  const beginEdit = (fp) => {
    if (editing && selected?.id === fp.id) {
      cancelForm();
      return;
    }

    const uuidOrUrl = extractUuid(fp.image);
    setSelected(fp);
    setForm({
      name: fp.name,
      details: fp.details ?? "",
      image: uuidOrUrl,
      file: null,
    });
    checkIfImageIsMedia(uuidOrUrl);
    setAdding(false);
    setEditing(true);
  };

  const totalPages = Math.ceil(floorPlans.length / ITEMS_PER_PAGE) || 1;
  const currentSlice = floorPlans.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  let content;
  if (loading) {
    content = (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  } else if (floorPlans.length === 0) {
    content = (
      <p className="text-center text-gray-500">No floor-plans yet</p>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentSlice.map((fp) => (
          <div
            key={fp.id}
            className="bg-base-100 rounded-lg shadow-lg overflow-hidden flex flex-col"
          >
            <div className="relative h-48 bg-gray-100">
              <img
                src={fp.image}
                alt={fp.name}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h2 className="text-lg font-semibold mb-2">{fp.name}</h2>
              <p className="text-sm text-gray-600 flex-1 truncate whitespace-pre-wrap">
                {fp.details || "—"}
              </p>
              <div className="mt-4 flex gap-2 justify-end">
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => beginEdit(fp)}
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => handleDelete(fp.id)}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-primary">
        Floor Plan Management
      </h1>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            className="btn btn-sm"
            onClick={() => {
              setPage((p) => Math.max(p - 1, 1));
              cancelForm();
            }}
            disabled={page === 1}
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            className="btn btn-sm"
            onClick={() => {
              setPage((p) => Math.min(p + 1, totalPages));
              cancelForm();
            }}
            disabled={page === totalPages}
          >
            Próximo
          </button>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            if (adding) {
              cancelForm();
            } else {
              cancelForm();
              setAdding(true);
            }
          }}
        >
          <FaPlus className="mr-1" /> Add Floor Plan
        </button>
      </div>

      {adding && (
        <div className="mt-4">
          <FloorPlanForm
            form={form}
            setForm={setForm}
            isImageMedia={isImageMedia}
            handleRemoveImage={handleRemoveImage}
            cancelForm={cancelForm}
            handleSubmit={handleCreate}
            editing={false}
          />
        </div>
      )}

      {content}

      {editing && (
        <FloorPlanForm
          form={form}
          setForm={setForm}
          isImageMedia={isImageMedia}
          handleRemoveImage={handleRemoveImage}
          cancelForm={cancelForm}
          handleSubmit={handleUpdate}
          editing={true}
        />
      )}
    </div>
  );
}

function FloorPlanForm({
  form,
  setForm,
  isImageMedia,
  handleRemoveImage,
  cancelForm,
  handleSubmit,
  editing,
}) {
  let removeImageTitle = "Remove image";
  if (!form.image) {
    removeImageTitle = "No image to remove";
  } else if (!isImageMedia) {
    removeImageTitle = "Only media-service images can be removed";
  }

  return (
    <div className="bg-base-200 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">
        {editing ? "Edit Floor Plan" : "Add Floor Plan"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="name">
            Name *
          </label>
          <input
            id="name"
            name="name"
            className="input input-bordered w-full"
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="label" htmlFor="image">
            Image URL <span className="text-gray-400">(opt.)</span>
          </label>
          <input
            id="image"
            name="image"
            className="input input-bordered w-full"
            value={form.image}
            onChange={(e) =>
              setForm((f) => ({ ...f, image: e.target.value }))
            }
            placeholder="http(s)://… or leave blank to upload"
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
              onChange={(e) =>
                setForm((f) => ({ ...f, file: e.target.files[0] }))
              }
              className="file-input w-full"
            />
            {editing && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className={`btn btn-sm ${
                  isImageMedia
                    ? "btn-error"
                    : "btn-disabled text-gray-400 cursor-not-allowed"
                }`}
                disabled={!isImageMedia}
                title={removeImageTitle}
              >
                <FaTrash className="mr-1" />
                Remove Image
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
          <label className="label" htmlFor="details">
            Details / Description
          </label>
          <textarea
            id="details"
            className="textarea textarea-bordered w-full"
            rows={4}
            value={form.details}
            onChange={(e) =>
              setForm((f) => ({ ...f, details: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button className="btn btn-outline" onClick={cancelForm}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          {editing ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
}