import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaSort } from "react-icons/fa";
import { useKeycloak } from "@react-keycloak/web";
import { axiosWithAuth } from "../../utils/axiosWithAuth.js";
import { baseUrl } from "../../consts.js";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import FloorPlanModal from "../../components/floorplans/FloorPlanModal";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "../../components/floorplans/SortableItem.jsx";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

const apiUrl = `${baseUrl}/floor-plan-plugin/floor_plan`;
const ITEMS_PER_PAGE = 6;

function FloorPlanActions({ onEdit, onDelete, t }) {
  return (
    <div className="flex gap-2 justify-end">
      <button
        className="btn btn-ghost btn-xs"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title={t("actions.edit")}
      >
        <FaEdit />
      </button>
      <button
        className="btn btn-ghost btn-xs text-error"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title={t("actions.delete")}
      >
        <FaTrash />
      </button>
    </div>
  );
}

FloorPlanActions.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

function FloorPlanRowItem({ fp, isTable, onEdit, onDelete, t }) {
  if (isTable) {
    return (
      <>
        <td className="w-10 text-center text-sm text-gray-400">#{fp.order}</td>
        <td className="w-10 text-center cursor-move text-gray-500">
          <FaSort className="mx-auto" />
        </td>
        <td className="w-20">
          <div className="avatar">
            <div className="mask mask-squircle w-12 h-12">
              <img src={fp.image} alt={fp.name} className="object-cover" />
            </div>
          </div>
        </td>
        <td className="font-medium text-sm sm:text-base">{fp.name}</td>
        <td className="text-sm sm:text-base whitespace-pre-wrap">
          {fp.details || t("floorPlans.noDetails")}
        </td>
        <td className="text-right">
          <FloorPlanActions onEdit={onEdit} onDelete={onDelete} t={t} />
        </td>
      </>
    );
  }

  return (
    <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden flex flex-col hover:shadow-xl hover:scale-105 transition-transform duration-200">
      <div className="relative h-48 bg-gray-100">
        <img src={fp.image} alt={fp.name} className="object-cover w-full h-full" />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold mb-2">{fp.name}</h2>
          <span className="text-sm text-gray-400">#{fp.order}</span>
        </div>
        <p className="text-sm text-gray-600 flex-1 truncate whitespace-pre-wrap">
          {fp.details || t("floorPlans.noDetails")}
        </p>
        <div className="mt-4">
          <FloorPlanActions onEdit={onEdit} onDelete={onDelete} t={t} />
        </div>
      </div>
    </div>
  );
}

FloorPlanRowItem.propTypes = {
  fp: PropTypes.shape({
    id: PropTypes.string.isRequired,
    order: PropTypes.number.isRequired,
    image: PropTypes.string,
    name: PropTypes.string.isRequired,
    details: PropTypes.string,
  }).isRequired,
  isTable: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export function FloorPlans() {
  const { keycloak } = useKeycloak();
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  const [floorPlans, setFloorPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState(null);
  const [isImageMedia, setIsImageMedia] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [reorderMode, setReorderMode] = useState(false);

  const extractUuid = (image) =>
    image?.startsWith(`${baseUrl}/media/`) ? image.split("?")[0].split("/").pop() : image;

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

  const resolveImageUrl = (image) => {
    if (!image) return "";
    return image.startsWith("http") ? image : `${baseUrl}/media/${image}`;
  };

  const fetchFloorPlans = async () => {
    setLoading(true);
    try {
      const { data } = await axiosWithAuth(keycloak).get(`${apiUrl}/`);
      const resolved = data.map((fp) => ({
        ...fp,
        image: resolveImageUrl(fp.image),
      }));
      setFloorPlans(resolved);
    } catch (err) {
      console.error(err);
      showNotification(t("notifications.loadFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloorPlans();
  }, []);

  const handleCreate = async (form) => {
    try {
      const body = {
        name: form.name,
        details: form.details,
        image: form.file ? "" : form.image.trim(),
      };
      const { data } = await axiosWithAuth(keycloak).post(`${apiUrl}/`, body);
      if (form.file && data.image && !data.image.startsWith("http")) {
        await uploadToMediaService(data.image, form.file);
      }
      setFloorPlans((prev) => [
        ...prev,
        {
          ...data,
          image: data.image && !data.image.startsWith("http") ? `${baseUrl}/media/${data.image}` : data.image,
        },
      ]);
      showNotification(t("notifications.createSuccess"), "success");
      closeModal();
      setPage(Math.ceil((floorPlans.length + 1) / ITEMS_PER_PAGE) || 1);
    } catch (err) {
      console.error(err);
      showNotification(t("notifications.createFailed"), "error");
    }
  };

  const handleUpdate = async (form) => {
    try {
      const hasFile = !!form.file;
      const imagePayload = hasFile ? "" : form.image?.trim() || " ";
      const { data } = await axiosWithAuth(keycloak).put(`${apiUrl}/${selected.id}`, {
        name: form.name,
        details: form.details,
        image: imagePayload || " ",
      });
      if (hasFile && data.image && !data.image.startsWith("http")) {
        await uploadToMediaService(data.image, form.file);
      }
      setFloorPlans((prev) =>
        prev.map((fp) =>
          fp.id === selected.id
            ? {
                ...data,
                image: data.image && !data.image.startsWith("http") ? `${baseUrl}/media/${data.image}?t=${Date.now()}` : data.image,
              }
            : fp
        )
      );
      showNotification(t("notifications.updateSuccess"), "success");
      closeModal();
    } catch (err) {
      console.error(err);
      showNotification(t("notifications.updateFailed"), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t("floorPlans.confirmDelete"))) return;
    try {
      await axiosWithAuth(keycloak).delete(`${apiUrl}/${id}`);
      setFloorPlans((prev) => prev.filter((fp) => fp.id !== id));
      showNotification(t("notifications.deleteSuccess"), "success");
      const maxPage = Math.ceil((floorPlans.length - 1) / ITEMS_PER_PAGE) || 1;
      setPage((p) => Math.min(p, maxPage));
    } catch (e) {
      console.error(e);
      showNotification(t("notifications.deleteFailed"), "error");
    }
  };

  const handleRemoveImage = async () => {
    if (!selected) return;
  
    const uuid = extractUuid(selected.image);
    if (!uuid || uuid.startsWith("http")) return;
  
    try {
      await axiosWithAuth(keycloak).delete(`${baseUrl}/media/${uuid}`);
      showNotification(t("notifications.removeImageSuccess"), "success");

      setFloorPlans((prev) =>
        prev.map((fp) =>
          fp.id === selected.id
            ? { ...fp, image: "" }
            : fp
        )
      );
  
      setIsImageMedia(false);
    } catch (err) {
      console.error(err);
      showNotification(t("notifications.removeImageFailed"), "error");
    }
  };

  const openCreateModal = () => {
    setSelected(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEditModal = (fp) => {
    const uuidOrUrl = extractUuid(fp.image);
    setSelected(fp);
    checkIfImageIsMedia(uuidOrUrl);
    setModalMode("edit");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
    setIsImageMedia(false);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
  
    const oldIndex = floorPlans.findIndex((fp) => fp.id === active.id);
    const newIndex = floorPlans.findIndex((fp) => fp.id === over.id);
    const reordered = arrayMove(floorPlans, oldIndex, newIndex);
  
    const updatedFloorPlans = reordered.map((fp, index) => ({
      ...fp,
      order: index + 1,
    }));
  
    setFloorPlans(updatedFloorPlans);
  
    try {
      const orders = updatedFloorPlans.map((fp) => ({ id: fp.id, order: fp.order }));
      await axiosWithAuth(keycloak).patch(`${apiUrl}/order/`, orders);
      showNotification(t("notifications.orderUpdateSuccess"), "success");
    } catch (err) {
      console.error(err);
      showNotification(t("notifications.orderUpdateFailed"), "error");
    }
  };

  const totalPages = Math.ceil(floorPlans.length / ITEMS_PER_PAGE) || 1;
  const currentSlice = floorPlans.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const plansToRender = reorderMode ? floorPlans : currentSlice;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      );
    }

    if (floorPlans.length === 0) {
      return <p className="text-center text-gray-500">{t("floorPlans.noPlans")}</p>;
    }

    if (reorderMode) {
      return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={floorPlans.map((fp) => fp.id)} strategy={rectSortingStrategy}>
            <div className="overflow-x-auto mt-4">
              <table className="table table-sm sm:table-md">
                <thead>
                  <tr>
                    <th className="w-10 text-center">{t("table.order")}</th>
                    <th className="w-10 text-center">{t("table.drag")}</th>
                    <th className="w-20">{t("table.image")}</th>
                    <th>{t("table.name")}</th>
                    <th>{t("table.details")}</th>
                    <th className="text-right">{t("table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {floorPlans.map((fp) => (
                    <SortableItem key={fp.id} id={fp.id} as="tr">
                      <FloorPlanRowItem
                        fp={fp}
                        isTable={true}
                        onEdit={() => openEditModal(fp)}
                        onDelete={() => handleDelete(fp.id)}
                        t={t}
                      />
                    </SortableItem>
                  ))}
                </tbody>
              </table>
            </div>
          </SortableContext>
        </DndContext>
      );
    }

    return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={plansToRender.map((fp) => fp.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plansToRender.map((fp) => (
              <SortableItem key={fp.id} id={fp.id}>
                <FloorPlanRowItem
                  fp={fp}
                  isTable={false}
                  onEdit={() => openEditModal(fp)}
                  onDelete={() => handleDelete(fp.id)}
                  t={t}
                />
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">{t("floorPlans.title")}</h1>
        <div className="flex gap-2">
          <button className="btn btn-sm" onClick={() => setReorderMode((v) => !v)}>
            <FaSort className="mr-1" /> {reorderMode ? t("floorPlans.exitReorder") : t("floorPlans.reorder")}
          </button>
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            <FaPlus className="mr-1" /> {t("floorPlans.add")}
          </button>
        </div>
      </div>

      {!reorderMode && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              className="btn btn-sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              {t("pagination.previous")}
            </button>
            <span>
              {t("pagination.page", { page, totalPages })}
            </span>
            <button
              className="btn btn-sm"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              {t("pagination.next")}
            </button>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 italic">
        {t("floorPlans.dragHint")}
      </p>

      {renderContent()}

      <FloorPlanModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={modalMode === "edit" ? handleUpdate : handleCreate}
        isEditing={modalMode === "edit"}
        onRemoveImage={handleRemoveImage}
        floorPlans={floorPlans}
        selectedId={selected?.id}
      />
    </div>
  );
}
