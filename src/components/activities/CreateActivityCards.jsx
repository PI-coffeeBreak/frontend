import PropTypes from 'prop-types';
import { FaFileExcel, FaPlus, FaTags } from 'react-icons/fa';
import CreateCard from "../CreateCard.jsx";

/**
 * Component displaying cards for creating different types of activities
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onOpenExcelModal - Function to open the Excel import modal
 * @param {Function} props.onOpenNewSessionModal - Function to open the new session modal
 * @param {Function} props.onOpenNewSessionTypeModal - Function to open the new session type modal
 * @param {boolean} props.canCreateActivities - Whether the user has permission to create activities
 */
export function CreateActivityCards({
  onOpenNewSessionTypeModal,
  onOpenExcelModal, 
  onOpenNewSessionModal, 
  canCreateActivities = true 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      <CreateCard
        icon={FaFileExcel}
        title="Add with an Excel file"
        description="Upload an Excel file to quickly add multiple sessions at once."
        onClick={onOpenExcelModal}
        disabled={!canCreateActivities}
        disabledMessage="You don't have permission to create activities"
      />
      <CreateCard
        icon={FaPlus}
        title="Create a new session"
        description="Create a new session manually."
        onClick={onOpenNewSessionModal}
        disabled={!canCreateActivities}
        disabledMessage="You don't have permission to create activities"
      />
      <CreateCard
        icon={FaTags}
        title="Create a new session type"
        description="Create a new session type manually."
        onClick={onOpenNewSessionTypeModal}
        disabled={!canCreateActivities}
        disabledMessage="You don't have permission to create activities"
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