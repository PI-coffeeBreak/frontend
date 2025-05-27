import { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../common/Modal";
import { useForm } from "../../hooks/useForm";
import { useNotification } from "../../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import { useActivities } from "../../contexts/ActivitiesContext.jsx";

export function CreateActivityTypeModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const initialValues = {
    type: "",
    color: "#3788d8", // Default color
  };

  const { handleChange, values, resetForm, errors, setErrors } = useForm(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();
  const { activityTypes, deleteActivityType, createActivityType, updateActivityType } = useActivities();
  const [activeTab, setActiveTab] = useState("create");
  const [editingActivity, setEditingActivity] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm(t("activities.types.confirmDelete"))) {
      try {
        await deleteActivityType(id);
        showNotification(t("activities.types.deleteSuccess"), "success");
        onClose();
      } catch (error) {
        showNotification(
          error?.response?.data?.message || t("activities.types.deleteError"),
          "error"
        );
      }
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    handleChange({ target: { name: "type", value: activity.type } });
    handleChange({ target: { name: "color", value: activity.color } });
    setActiveTab("create");
  };

  const validate = () => {
    const newErrors = {};

    if (!values.type.trim()) {
      newErrors.type = t("activities.types.errors.nameRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (editingActivity) {
        await updateActivityType(editingActivity.id, {
          type: values.type.trim(),
          color: values.color
        });
        showNotification(t("activities.types.updateSuccess"), "success");
      } else {
        await createActivityType({
          type: values.type.trim(),
          color: values.color
        });
        showNotification(t("activities.types.createSuccess"), "success");
      }
      resetForm();
      setEditingActivity(null);
      onClose();
    } catch (error) {
      console.error("Error submitting activity type:", error);
      showNotification(
        error.response?.data?.message || t("activities.types.submitError"),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    resetForm();
    setErrors({});
    setEditingActivity(null);
    onClose();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "create") {
      if (!editingActivity) {
        resetForm();
      }
    } else {
      setEditingActivity(null);
      resetForm();
    }
  };

  const getModalTitle = () => {
    if (activeTab === "create") {
      return editingActivity 
        ? t("activities.types.editTab")
        : t("activities.types.createTab");
    }
    return t("activities.types.listTab");
  };

  const getButtonText = () => {
    if (isSubmitting) {
      return editingActivity ? t("activities.types.saving") : t("activities.types.creating");
    }
    return editingActivity ? t("activities.types.saveButton") : t("activities.types.createButton");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title={getModalTitle()}
    >
      <div className="">
        <div className="tabs mb-4">
          <button
            type="button"
            className={`tab tab-bordered ${activeTab === "create" ? "tab-active" : ""}`}
            onClick={() => handleTabChange("create")}
          >
            {editingActivity ? t("activities.types.editTab") : t("activities.types.createTab")}
          </button>
          <button
            type="button"
            className={`tab tab-bordered ${activeTab === "list" ? "tab-active" : ""}`}
            onClick={() => handleTabChange("list")}
          >
            {t("activities.types.listTab")}
          </button>
        </div>
        <form onSubmit={handleSubmitForm}>
          {activeTab === "create" && (
            <>
              <div className="mb-4">
                <label htmlFor="type" className="block text-sm font-medium mb-1">
                  {t("activities.types.name")} <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  value={values.type}
                  onChange={handleChange}
                  className={`input input-bordered w-full ${errors.type ? 'input-error' : ''}`}
                  placeholder={t("activities.types.namePlaceholder")}
                />
                {errors.type && <p className="text-error text-sm mt-1">{errors.type}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="color" className="block text-sm font-medium mb-1">
                  {t("activities.types.color")}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={values.color}
                    onChange={handleChange}
                    className="w-12 h-12 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={values.color}
                    onChange={handleChange}
                    name="color"
                    className="input input-bordered flex-1"
                    placeholder="#RRGGBB"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                {editingActivity && (
                  <button
                    type="button"
                    className="btn btn-ghost rounded-xl"
                    onClick={() => {
                      setEditingActivity(null);
                      resetForm();
                    }}
                  >
                    {t("common.actions.cancel")}
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      {getButtonText()}
                    </>
                  ) : (
                    getButtonText()
                  )}
                </button>
              </div>
            </>
          )}
          {activeTab === "list" && (
            <div className="mb-6">
              <ul className="space-y-2">
                {activityTypes.map((activity) => (
                  <li key={activity.id} className="flex items-center justify-between rounded px-3 py-2 hover:bg-base-200">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 inline-block rounded" style={{ backgroundColor: activity.color }}></span>
                      <span>{activity.type}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary rounded-xl"
                        onClick={() => handleEdit(activity)}
                      >
                        {t("common.actions.edit")}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-error rounded-xl"
                        onClick={() => handleDelete(activity.id)}
                      >
                        {t("common.actions.delete")}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}

CreateActivityTypeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}; 