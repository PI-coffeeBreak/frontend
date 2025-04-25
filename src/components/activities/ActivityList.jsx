import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import Activity from "../Activity.jsx";
import { FaSearch } from "react-icons/fa";
import { useActivities } from "../../contexts/ActivitiesContext";
import { useNotification } from "../../contexts/NotificationContext";

export function ActivityList({ activities }) {
  const { t } = useTranslation();
  const { deleteActivity } = useActivities();
  const { showNotification } = useNotification();
  
  const handleDelete = async (id) => {
    if (window.confirm(t('activities.deleteConfirm'))) {
      try {
        await deleteActivity(id);
        showNotification(t('activities.deleteSuccess'), "success");
      } catch (error) {
        showNotification(t('activities.deleteError'), "error");
        console.error("Error deleting activity:", error);
      }
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
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

ActivityList.propTypes = {
  activities: PropTypes.array.isRequired
};