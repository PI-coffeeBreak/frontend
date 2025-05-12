import { useState } from "react";
import { ActivityList } from "../components/activities/ActivityList";
import { ActivityFilters } from "../components/activities/ActivityFilters";
import { CreateActivityCards } from "../components/activities/CreateActivityCards";
import { ExcelImportModal } from "../components/activities/ExcelImportModal";
import { NewSessionModal } from "../components/activities/NewSessionModal";
import { NewSessionTypeModal } from "../components/activities/NewSessionTypeModal";
import { EditActivityModal } from "../components/activities/EditActivityModal";
import { useActivities } from "../contexts/ActivitiesContext";
import { useNotification } from "../contexts/NotificationContext";
import { useKeycloak } from "@react-keycloak/web";
import { useTranslation } from "react-i18next";
import { useMedia } from "../contexts/MediaContext";
import DeleteConfirmationModal from "../components/common/DeleteConfirmationModal";

export default function Activities() {
  const {
    activities, 
    activityTypes,
    fetchActivities,
    getActivityType,
    createActivitiesBatch,
    createActivity,
    createActivityType,
    deleteActivity
  } = useActivities();

  const { showNotification } = useNotification();
  const { uploadMedia } = useMedia();
  const { keycloak } = useKeycloak();
  const { t } = useTranslation();

  // Authorization
  const canCreateActivities = () => {
    if (!keycloak?.authenticated) {
      return false;
    }
    
    const roles = keycloak.tokenParsed?.realm_access?.roles || [];
    const allowedRoles = ['cb-staff', 'cb-organizer', 'cb-customization'];
    
    return allowedRoles.some(role => roles.includes(role));
  };

  // Modal state
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [isNewSessionTypeModalOpen, setIsNewSessionTypeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingActivityId, setDeletingActivityId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchQuery || 
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = !selectedType || activity.type_id.toString() === selectedType;
    
    return matchesSearch && matchesType;
  });

  const mappedActivities = filteredActivities.map(activity => ({
    ...activity,
    type: getActivityType(activity.type_id) // Add type name using the getActivityType function
  }));

  const openExcelModal = () => setIsExcelModalOpen(true);
  const closeExcelModal = () => setIsExcelModalOpen(false);

  const openNewSessionModal = () => setIsNewSessionModalOpen(true);
  const closeNewSessionModal = () => setIsNewSessionModalOpen(false);

  const openNewSessionTypeModal = () => setIsNewSessionTypeModalOpen(true);
  const closeNewSessionTypeModal = () => setIsNewSessionTypeModalOpen(false);

  const handleEditActivity = (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      setSelectedActivity(activity);
      setIsEditModalOpen(true);
    }
  };
  
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedActivity(null);
    
    // Refresh the activities after editing
    fetchActivities();
  };
  
  const handleDeleteClick = (id) => {
    setDeletingActivityId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingActivityId(null);
  };

  const confirmDelete = async () => {
    if (!deletingActivityId) return;

    setIsDeleting(true);
    try {
      await deleteActivity(deletingActivityId);
      showNotification(t('activities.deleteSuccess'), "success");
      closeDeleteModal();
      
      // Refresh activities after deletion
      fetchActivities();
    } catch (error) {
      showNotification(t('activities.deleteError'), "error");
      console.error("Error deleting activity:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImportExcel = async (activitiesData) => {
      await createActivitiesBatch(activitiesData);

      showNotification("Activities successfully imported", "success");

      fetchActivities();
      closeExcelModal();
  };

  const handleCreateSession = async (sessionData) => {
      const payload = {
        name: sessionData.name,
        description: sessionData.description,
        date: sessionData.date,
        duration: parseInt(sessionData.duration, 10),
        type_id: typeof sessionData.type_id === 'string' 
          ? parseInt(sessionData.type_id, 10) 
          : sessionData.type_id,
        topic: sessionData.topic || "",
        facilitator: sessionData.facilitator || ""
      };

      console.log("Sending activity data:", payload);
      

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      if (sessionData.image) {
        formData.append('image', "");
      }

      const activity = await createActivity(formData);

      if (sessionData.image) {
        await uploadMedia(activity.image, sessionData.image);
      }

      showNotification("Session created successfully", "success");

      fetchActivities();
      closeNewSessionModal();
  };

  const handleCreateSessionType = async (typeData) => {
    await createActivityType(typeData);
    showNotification("Session type created successfully", "success");
    closeNewSessionTypeModal();
  };

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold my-8">{t('activities.title')}</h1>

              <CreateActivityCards
                onOpenExcelModal={openExcelModal}
                onOpenNewSessionModal={openNewSessionModal}
                onOpenNewSessionTypeModal={openNewSessionTypeModal}
                canCreateActivities={canCreateActivities()}
              />

              <h1 className="text-3xl font-bold mt-8">{t('activities.sessions')}</h1>

              <ActivityFilters
                activityTypes={activityTypes}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
              />

              <ActivityList
                activities={mappedActivities}
                onEdit={handleEditActivity}
                onDelete={handleDeleteClick}
                mode="both"
              />

              <ExcelImportModal
                isOpen={isExcelModalOpen}
                onClose={closeExcelModal}
                onImport={handleImportExcel}
              />

              <NewSessionModal
                isOpen={isNewSessionModalOpen}
                onClose={closeNewSessionModal}
                onSubmit={handleCreateSession}
              />

              <NewSessionTypeModal
                isOpen={isNewSessionTypeModalOpen}
                onClose={closeNewSessionTypeModal}
                onSubmit={handleCreateSessionType}
              />

              <EditActivityModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                activity={selectedActivity}
              />

              <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title={t('activities.deleteConfirmTitle')}
                message={t('activities.deleteConfirm')}
              />
        </div>
    </div>
  );
}