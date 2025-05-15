import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../common/Modal";
import { useForm } from "../../hooks/useForm";
import { useNotification } from "../../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import {useActivities} from "../../contexts/ActivitiesContext.jsx";
export function CreateActivityTypeModal({ isOpen, onClose, onSubmit }) {
  const { t } = useTranslation();
  const initialValues = {
    type: "",
    color: "#3788d8", // Default color
  };

  const { handleChange, values, resetForm, errors, setErrors } = useForm(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();
  const {activityTypes, deleteActivityType} = useActivities()
  const [activeTab, setActiveTab] = useState("create");


  const handleEdit = (activity) => {
    setErrors({});
    // Populate form fields for editing
    resetForm({
      type: activity.type,
      color: activity.color
    });
    // You can store the ID to distinguish between create and update
  };


  const handleDelete = async (id) => {
    try {

      await deleteActivityType(id);
      showNotification(t("activities.types.deleteSuccess"), "success");
    } catch (error) {
      showNotification(
        error?.response?.data?.message || t("activities.types.deleteError"),
        "error"
      );
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!values.type.trim()) {
      newErrors.type = "Activity type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await onSubmit({ type: values.type.trim(), color: values.color });
      resetForm();
      showNotification(t("activities.types.createSuccess"), "success");
    } catch (error) {
      console.error("Error creating activity type:", error);
      showNotification(
        error.response?.data?.message || t("activities.types.createError"),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    resetForm();
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title={
        activeTab === "create"
          ? t("activities.types.createTab")
          : t("activities.types.existingTab")
      }
    >
      <div className="">
        <div className="tabs mb-4">
          <button
            type="button"
            className={`tab tab-bordered ${activeTab === "create" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("create")}
          >{t("activities.types.createTab")}
          </button>
          <button
            type="button"
            className={`tab tab-bordered ${activeTab === "list" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("list")}
          >{t("activities.types.existingTab")}
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
                <button
                  type="submit"
                  className="btn btn-primary rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      {t("activities.types.creating")}
                    </>
                  ) : (
                    t("activities.types.createButton")
                  )}
                </button>
              </div>
            </>
          )}
          {activeTab === "list" && (
            <div className="mb-6">
              <ul className="space-y-2">
                {activityTypes.map((activity) => (
                  <li key={activity.id} className="flex items-center justify-between rounded px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 inline-block rounded" style={{ backgroundColor: activity.color }}></span>
                      <span>{activity.type}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-error rounded-xl"
                        onClick={() => handleDelete(activity.id)}
                      >
                        {t("common.delete")}
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
  onSubmit: PropTypes.func.isRequired,
}; 