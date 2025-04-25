import PropTypes from 'prop-types';
import { Modal } from './Modal.jsx';
import { FaExclamationTriangle } from 'react-icons/fa';

export function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Delete Activity",
  message = "Are you sure you want to delete this activity, this action cannot be undone.",
  isLoading = false 
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <div className="py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-primary">
            <FaExclamationTriangle size={24} />
          </div>
          <p>{message}</p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                <span>Deleting...</span>
              </div>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

DeleteConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  isLoading: PropTypes.bool
};

export default DeleteConfirmationModal; 