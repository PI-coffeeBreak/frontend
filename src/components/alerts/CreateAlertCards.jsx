import PropTypes from 'prop-types';
import { BiSolidBellPlus } from "react-icons/bi";
import { HiTemplate } from "react-icons/hi";
import CreateCard from "../CreateCard.jsx";

export function CreateAlertCards({
  onOpenAlertModal,
  onOpenTemplateModal
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      <CreateCard
        icon={BiSolidBellPlus}
        title="Create an alert"
        description="Create a new alert to notify users about an upcoming event."
        onClick={onOpenAlertModal}
      />
      <CreateCard
        icon={HiTemplate}
        title="Create a Template"
        description="Create a template to send alerts more efficiently."
        onClick={onOpenTemplateModal}
      />
    </div>
  );
}

CreateAlertCards.propTypes = {
  onOpenAlertModal: PropTypes.func.isRequired,
  onOpenTemplateModal: PropTypes.func.isRequired
}; 