import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { FaFileExcel, FaPlus, FaTags } from 'react-icons/fa';
import CreateCard from "../CreateCard.jsx";

export function CreateActivityCards({
  onOpenNewSessionTypeModal,
  onOpenExcelModal, 
  onOpenNewSessionModal, 
  canCreateActivities = true 
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      <CreateCard
        icon={FaFileExcel}
        title={t('activities.import.title')}
        description={t('activities.import.description')}
        onClick={onOpenExcelModal}
        disabled={!canCreateActivities}
        disabledMessage={t('activities.permissions.disabled')}
      />
      <CreateCard
        icon={FaPlus}
        title={t('activities.create.title')}
        description={t('activities.create.description')}
        onClick={onOpenNewSessionModal}
        disabled={!canCreateActivities}
        disabledMessage={t('activities.permissions.disabled')}
      />
      <CreateCard
        icon={FaTags}
        title={t('activities.types.title')}
        description={t('activities.types.description')}
        onClick={onOpenNewSessionTypeModal}
        disabled={!canCreateActivities}
        disabledMessage={t('activities.permissions.disabled')}
      />
    </div>
  );
}

CreateActivityCards.propTypes = {
  onOpenExcelModal: PropTypes.func.isRequired,
  onOpenNewSessionModal: PropTypes.func.isRequired,
  onOpenNewSessionTypeModal: PropTypes.func.isRequired,
  canCreateActivities: PropTypes.bool
};