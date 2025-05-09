import { useState, useEffect } from "react";
import { useActivities } from "../../contexts/ActivitiesContext";
import { ActivityList } from "../../components/activities/ActivityList";
import EditMetadataModal from "../../components/plugins/EditMetadataModal";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { baseUrl } from "../../consts";

const apiBase = `${baseUrl}/registration-system-plugin/activity-registration`;

export default function ActivitySlotsPage() {
  const { activities, fetchActivities, getActivityType } = useActivities();
  const { t } = useTranslation();

  const [activityData, setActivityData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [selectedActivityName, setSelectedActivityName] = useState("");

  useEffect(() => {
    const enrichActivities = async () => {
      await fetchActivities();
      const ids = activities.map((a) => a.id);
      const metadataMap = await fetchAllMetadata(ids);
      setActivityData(metadataMap);
    };

    enrichActivities();
  }, []);

  const fetchAllMetadata = async (activityIds) => {
    const result = {};
    await Promise.all(
      activityIds.map(async (id) => {
        try {
          const [metadataRes, slotsRes] = await Promise.all([
            axios.get(`${apiBase}/metadata/${id}`),
            axios.get(`${apiBase}/register/${id}/available-slots`)
          ]);

          result[id] = {
            is_restricted: metadataRes.data.is_restricted,
            slots: metadataRes.data.slots,
            registered: slotsRes.data.registered
          };
        } catch {
          result[id] = null;
        }
      })
    );
    return result;
  };

  const handleEditClick = (activityId) => {
    setSelectedActivityId(activityId);
    const activity = activities.find((a) => a.id === activityId);
    setSelectedActivityName(activity?.name || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedActivityId(null);
  };

  const handleMetadataUpdate = async (activityId) => {
    try {
      const [metadataRes, slotsRes] = await Promise.all([
        axios.get(`${apiBase}/metadata/${activityId}`),
        axios.get(`${apiBase}/register/${activityId}/available-slots`)
      ]);

      setActivityData((prev) => ({
        ...prev,
        [activityId]: {
          is_restricted: metadataRes.data.is_restricted,
          slots: metadataRes.data.slots,
          registered: slotsRes.data.registered
        }
      }));
    } catch (err) {
      console.error("Erro ao atualizar metadados", err);
    }
  };

  const mappedActivities = activities.map((activity) => ({
    ...activity,
    type: getActivityType(activity.type_id),
    metadata: activityData[activity.id]
  }));

  return (
    <div className="w-full min-h-svh p-4 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">{t("activities.editSlotsTitle")}</h1>
      <ActivityList
        activities={mappedActivities}
        onEdit={handleEditClick}
        mode="edit"
      />
      {selectedActivityId && (
        <EditMetadataModal
          isOpen={isModalOpen}
          activityId={selectedActivityId}
          activityName={selectedActivityName}
          onClose={closeModal}
          onUpdate={handleMetadataUpdate}
      />
      )}
    </div>
  );
}
