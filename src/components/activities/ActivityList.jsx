import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { useState } from 'react';
import Activity from "../common/Activity.jsx";
import { FaSearch } from "react-icons/fa";
import { useActivities } from "../../contexts/ActivitiesContext";
import { useNotification } from "../../contexts/NotificationContext";
import DeleteConfirmationModal from '../common/DeleteConfirmationModal.jsx';

export function ActivityList({ activities, activityTypes, onDelete, onEdit, mode = 'delete' }) {
  const { t } = useTranslation();
  const { deleteActivity } = useActivities();
  const { showNotification } = useNotification();
  const [deletingActivityId, setDeletingActivityId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id) => {
    if (onDelete) {
      // Use the parent component's delete handler if provided
      onDelete(id);
    } else {
      // Otherwise use the internal delete handler
      setDeletingActivityId(id);
      setIsDeleteModalOpen(true);
    }
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
    } catch (error) {
      showNotification(t('activities.deleteError'), "error");
      console.error("Error deleting activity:", error);
    } finally {
      setIsDeleting(false);
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
            onDelete={mode === 'delete' || mode === 'both' ? handleDeleteClick : undefined}
            onEdit={mode === 'edit' || mode === 'both' ? onEdit : undefined}
            mode={mode}
            metadata={activity.metadata}
            activityTypes={activityTypes}
          />
        ))}
      </div>

      {(mode === 'delete' || (mode === 'both' && !onDelete)) && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          isLoading={isDeleting}
          title={t('activities.deleteConfirmTitle')}
          message={t('activities.deleteConfirm')}
        />
      )}
    </>
  );
}

ActivityList.propTypes = {
  activities: PropTypes.array.isRequired,
  activityTypes: PropTypes.array.isRequired,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  mode: PropTypes.oneOf(['edit', 'delete', 'both'])
};
