import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useNotification } from "../../contexts/NotificationContext";
import { useKeycloak } from "@react-keycloak/web";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { FaExclamationTriangle } from "react-icons/fa";
import { baseUrl } from "../../consts";

const apiUrl = `${baseUrl}/registration-system-plugin/activity-registration/metadata`;

export default function EditMetadataModal({ activityId, activityName, onUpdate }) {
  const { showNotification } = useNotification();
  const { keycloak } = useKeycloak();
  const { t } = useTranslation();

  const [isRestricted, setIsRestricted] = useState(false);
  const [slots, setSlots] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (activityId) fetchMetadata();
  }, [activityId]);

  const fetchMetadata = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/${activityId}`);
      setIsRestricted(res.data.is_restricted);
      setSlots(res.data.slots);
      setErrorMsg("");
    } catch {
      setIsRestricted(false);
      setSlots("");
      setErrorMsg(t("activities.slots.noMetadataInfo"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${apiUrl}/${activityId}`,
        null,
        {
          params: {
            is_restricted: isRestricted,
            slots: parseInt(slots, 10)
          },
          headers: {
            Authorization: `Bearer ${keycloak.token}`
          }
        }
      );
      showNotification(t("activities.slots.saveSuccess"), "success");
      await onUpdate(activityId);
      document.getElementById("edit_slots_modal").close();
    } catch (err) {
      console.error(err);
      showNotification(t("activities.slots.saveError"), "error");
    }
  };

  const handleCancel = () => {
    document.getElementById("edit_slots_modal").close();
  
    setTimeout(() => {
      fetchMetadata();
    }, 200);
  };
  

  return (
    <dialog id="edit_slots_modal" className="modal">
      <div className="modal-box max-w-xl">
        <form method="dialog">
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={handleCancel}
        >
          ✕
        </button>
        </form>

        <h3 className="font-bold text-lg mb-1">{t("activities.slots.modalTitle")}</h3>
        {activityName && (
          <p className="text-sm font-bold text-secondary mb-4">{activityName}</p>
        )}

        {errorMsg && (
          <div className="alert alert-info mb-4">
            <FaExclamationTriangle className="h-5 w-5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isRestricted}
                onChange={(e) => {
                  setIsRestricted(e.target.checked);
                  setErrorMsg("");
                }}
                className="checkbox checkbox-primary"
              />
              <span className="label-text">{t("activities.slots.limitLabel")}</span>
            </label>

            <input
              type="number"
              className="input input-bordered w-full"
              value={isRestricted ? slots : ""}
              onChange={(e) => setSlots(e.target.value)}
              placeholder={t("activities.slots.slotPlaceholder")}
              disabled={!isRestricted}
              min={0}
            />
          </div>

          <div className="modal-action">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? <span className="loading loading-spinner"></span> : t("common.actions.save")}
            </button>
            <button type="button" className="btn" onClick={handleCancel}>
              {t("common.actions.cancel")}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

EditMetadataModal.propTypes = {
  activityId: PropTypes.number.isRequired,
  activityName: PropTypes.string,
  onUpdate: PropTypes.func.isRequired
};
