import PropTypes from 'prop-types';
<<<<<<< HEAD
import { useTranslation } from "react-i18next";
=======
import { useState } from 'react';
>>>>>>> b61c5eb (refactored, and sessions page to)
import Activity from "../Activity.jsx";
import { FaSearch } from "react-icons/fa";
import { useActivities } from "../../contexts/ActivitiesContext";
import { useNotification } from "../../contexts/NotificationContext";
import DeleteConfirmationModal from './DeleteConfirmationModal';

export function ActivityList({ activities }) {
  const { t } = useTranslation();
  const { deleteActivity } = useActivities();
  const { showNotification } = useNotification();
  const [deletingActivityId, setDeletingActivityId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
<<<<<<< HEAD
  const handleDelete = async (id) => {
    if (window.confirm(t('activities.deleteConfirm'))) {
      try {
        await deleteActivity(id);
        showNotification(t('activities.deleteSuccess'), "success");
      } catch (error) {
        showNotification(t('activities.deleteError'), "error");
        console.error("Error deleting activity:", error);
      }
=======
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
      showNotification("Activity deleted successfully", "success");
      closeDeleteModal();
    } catch (error) {
      showNotification("Failed to delete activity", "error");
      console.error("Error deleting activity:", error);
    } finally {
      setIsDeleting(false);
>>>>>>> b61c5eb (refactored, and sessions page to)
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <FaSearch className="mx-auto text-4xl text-gray-400 mb-4" />
        <p className="text-2xl text-gray-500">{t('activities.noActivities')}</p>
        <p className="text-gray-400">{t('activities.trySearch')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full grid grid-cols-1 gap-4 overflow-hidden mt-6 md:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => (
          <Activity
            key={activity.id}
            id={activity.id}
            title={activity.name}
            description={activity.description}
            image={activity.image}
            category={activity.topic}
            type={activity.type}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>
      
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}

ActivityList.propTypes = {
  activities: PropTypes.array.isRequired
};