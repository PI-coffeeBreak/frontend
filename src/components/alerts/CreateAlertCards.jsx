import PropTypes from 'prop-types';
import { BiSolidBellPlus } from "react-icons/bi";
import { HiTemplate } from "react-icons/hi";
import CreateCard from "../common/CreateCard.jsx";
import { useTranslation } from "react-i18next";

export function CreateAlertCards({
  onOpenAlertModal,
  onOpenTemplateModal
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      <CreateCard
        icon={BiSolidBellPlus}
        title={t('alerts.createAlert.title')}
        description={t('alerts.createAlert.description')}
        onClick={onOpenAlertModal}
      />
      <CreateCard
        icon={HiTemplate}
        title={t('alerts.createTemplate.title')}
        description={t('alerts.createTemplate.description')}
        onClick={onOpenTemplateModal}
      />
    </div>
  );
}

CreateAlertCards.propTypes = {
  onOpenAlertModal: PropTypes.func.isRequired,
  onOpenTemplateModal: PropTypes.func.isRequired
}; 