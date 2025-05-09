import { useState, useEffect } from "react";
import { useActivities } from "../../contexts/ActivitiesContext";
import { ActivityList } from "../../components/activities/ActivityList";
import EditMetadataModal from "../../components/plugins/EditMetadataModal";
import { useTranslation } from "react-i18next";

export default function ActivitySlotsPage() {
  const { activities, fetchActivities, getActivityType } = useActivities();
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const openModal = (activityId) => {
    setSelectedActivityId(activityId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedActivityId(null);
  };

  const mappedActivities = activities.map((activity) => ({
    ...activity,
    type: getActivityType(activity.type_id)
  }));

  return (
    <div className="w-full min-h-svh p-4 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">{t("activities.editSlotsTitle")}</h1>

      <ActivityList activities={mappedActivities} onEdit={openModal} mode="edit" />

      {selectedActivityId && (
        <EditMetadataModal
          isOpen={isModalOpen}
          activityId={selectedActivityId}
          onClose={closeModal} // <- aqui é garantido que o estado muda
        />
      )}
    </div>
  );
}
