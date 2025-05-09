import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Modal } from "../common/Modal";
import { useNotification } from "../../contexts/NotificationContext";
import { useKeycloak } from "@react-keycloak/web";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import { baseUrl } from "../../consts";

const apiUrl = `${baseUrl}/registration-system-plugin/activity-registration/metadata`;

export default function EditMetadataModal({ isOpen, onClose, activityId, activityName, onUpdate }) {
  const { showNotification } = useNotification();
  const { keycloak } = useKeycloak();
  const { t } = useTranslation();

  const [isRestricted, setIsRestricted] = useState(false);
  const [slots, setSlots] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activityId && isOpen) {
      fetchMetadata();
    }
  }, [activityId, isOpen]);

  const fetchMetadata = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/${activityId}`);
      setIsRestricted(res.data.is_restricted);
      setSlots(res.data.slots);
    } catch {
      setIsRestricted(false);
      setSlots(0);
      showNotification(t("activities.slots.noMetadataInfo"), "info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
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
      onClose();
    } catch (error) {
      console.error(error);
      showNotification(t("activities.slots.saveError"), "error");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-col gap-1 w-full">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">{t("activities.slots.modalTitle")}</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-error p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-error"
              type="button"
              aria-label="Fechar"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm text-secondary">{activityName}</span>
        </div>
      }      
    >
      {isLoading ? (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isRestricted}
                  onChange={(e) => setIsRestricted(e.target.checked)}
                  className="checkbox checkbox-primary"
                />
                {t("activities.slots.limitLabel")}
              </label>

              <div>
              <input
                type="number"
                id="slots"
                value={isRestricted ? slots : ""}
                onChange={(e) => setSlots(e.target.value)}
                className="input input-bordered w-full"
                min={0}
                disabled={!isRestricted}
                placeholder={t("activities.slots.slotPlaceholder")}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button type="submit" className="btn btn-primary">
              {t("common.save")}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

EditMetadataModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  activityId: PropTypes.number.isRequired,
  onUpdate: PropTypes.func.isRequired
};
