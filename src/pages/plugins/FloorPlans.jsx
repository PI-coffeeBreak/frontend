import { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit
} from "react-icons/fa";
import { useKeycloak } from "@react-keycloak/web";
import { axiosWithAuth } from "../../utils/axiosWithAuth.js";
import { baseUrl }        from "../../consts.js";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import FloorPlanModal from "../../components/floorplans/FloorPlanModal";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "../../components/SortableItem";

const apiUrl = `${baseUrl}/floor-plan-plugin/floor_plan`;
const ITEMS_PER_PAGE = 6;

export function FloorPlans() {

  const { keycloak }           = useKeycloak();
  const { showNotification }   = useNotification();

  const [floorPlans, setFloorPlans]   = useState([]);
  const [loading,    setLoading]      = useState(false);

  const [form, setForm] = useState({ name: "", details: "", image: "", file: null });
  const resetForm = () => setForm({ name: "", details: "", image: "", file: null });

  const [selected,      setSelected]   = useState(null);
  const [isImageMedia,  setIsImageMedia] = useState(false);

  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen]     = useState(false);
  const [modalMode, setModalMode]     = useState("create");

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
      headers: { "Content-Type": "multipart/form-data" }
    }).post(`${baseUrl}/media/${uuid}`, fd);
  };

  const fetchFloorPlans = async () => {
    setLoading(true);
    try {
      const { data } = await axiosWithAuth(keycloak).get(apiUrl);

      const resolved = data.map((fp) => ({
        ...fp,
        image: fp.image
          ? fp.image.startsWith("http")
            ? fp.image
            : `${baseUrl}/media/${fp.image}`
          : ""
      }));

      setFloorPlans(resolved);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load floor‑plans", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(fetchFloorPlans, []);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      showNotification("Name is required", "warning");
      return;
    }

    try {
      const body = {
        name: form.name,
        details: form.details,
        image: form.file ? "" : form.image.trim()
      };
      const { data } = await axiosWithAuth(keycloak).post(apiUrl, body);

      if (form.file && data.image && !data.image.startsWith("http")) {
        await uploadToMediaService(data.image, form.file);
      }

      setFloorPlans((prev) => [
        ...prev,
        {
          ...data,
          image:
            data.image && !data.image.startsWith("http")
              ? `${baseUrl}/media/${data.image}`
              : data.image
        }
      ]);

      showNotification("Floor Plan Created", "success");
      closeModal();
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
          image: imagePayload
        }
      );

      if (form.file && data.image && !data.image.startsWith("http")) {
        await uploadToMediaService(data.image, form.file);
      }

      setFloorPlans((prev) =>
        prev.map((fp) =>
          fp.id === selected.id
            ? {
                ...data,
                image:
                  data.image && !data.image.startsWith("http")
                    ? `${baseUrl}/media/${data.image}?t=${Date.now()}`
                    : data.image
              }
            : fp
        )
      );

      showNotification("Floor Plan Updated", "success");
      closeModal();
    } catch (err) {
      console.error(err);
      showNotification("Update failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this floor‑plan?")) return;
    try {
      await axiosWithAuth(keycloak).delete(`${apiUrl}/${id}`);
      setFloorPlans((prev) => prev.filter((fp) => fp.id !== id));
      showNotification("Floor Plan Deleted", "success");

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
      setFloorPlans((prev) =>
        prev.map((fp) =>
          fp.id === selected.id ? { ...fp, image: `${uuid}` } : fp
        )
      );
    } catch (err) {
      console.error(err);
      showNotification("Failed to remove image", "error");
    }
  };

  const openCreateModal = () => {
    resetForm();
    setSelected(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEditModal = (fp) => {
    const uuidOrUrl = extractUuid(fp.image);
    setSelected(fp);
    setForm({
      name: fp.name,
      details: fp.details ?? "",
      image: uuidOrUrl,
      file: null
    });
    checkIfImageIsMedia(uuidOrUrl);
    setModalMode("edit");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
    setSelected(null);
    setIsImageMedia(false);
  };

  const totalPages   = Math.ceil(floorPlans.length / ITEMS_PER_PAGE) || 1;
  const currentSlice = floorPlans.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = floorPlans.findIndex((fp) => fp.id === active.id);
      const newIndex = floorPlans.findIndex((fp) => fp.id === over.id);

      const reorderedFloorPlans = arrayMove(floorPlans, oldIndex, newIndex);
      setFloorPlans(reorderedFloorPlans);

      try {
        const orders = reorderedFloorPlans.map((fp, index) => ({
          id: fp.id,
          order: index + 1,
        }));

        await axiosWithAuth(keycloak).patch(`${apiUrl}/order`, orders);

        showNotification("Order updated successfully", "success");
      } catch (err) {
        console.error(err);
        showNotification("Failed to update order", "error");
      }
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-primary">Floor Plan Management</h1>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            className="btn btn-sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>

        <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
          <FaPlus className="mr-1" /> Add Floor Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : floorPlans.length === 0 ? (
        <p className="text-center text-gray-500">No Floor Plans yet.</p>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={floorPlans.map((fp) => fp.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {floorPlans.map((fp) => (
                <SortableItem key={fp.id} id={fp.id}>
                  <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden flex flex-col">
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
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(fp);
                          }}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(fp.id);
                          }}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <FloorPlanModal
        open          ={modalOpen}
        onClose       ={closeModal}
        onSubmit      ={modalMode === "edit" ? handleUpdate : handleCreate}
        form          ={form}
        setForm       ={setForm}
        isEditing     ={modalMode === "edit"}
        isImageMedia  ={isImageMedia}
        onRemoveImage ={handleRemoveImage}
      />
    </div>
  );
}