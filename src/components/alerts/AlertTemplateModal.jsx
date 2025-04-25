import PropTypes from 'prop-types';
import { useAlerts } from '../../contexts/AlertsContext';
import { Modal } from '../common/Modal';

const FormField = ({ label, id, required = false, error, children }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium mb-1">
      {label} {required && <span className="text-error">*</span>}
    </label>
    {children}
    {error && <p className="text-error text-sm mt-1">{error}</p>}
  </div>
);

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
  children: PropTypes.node.isRequired
};

export function AlertTemplateModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingTemplate = null 
}) {
  const { isLoading } = useAlerts();
  
  const getTemplateButtonText = () => {
    if (isLoading) {
      return <span className="loading loading-spinner loading-sm"></span>;
    }
    return editingTemplate ? 'Update Template' : 'Create Template';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTemplate ? 'Edit Template' : 'Create New Template'}
      description={editingTemplate 
        ? 'Update the template details below.' 
        : 'Fill in the details to create a new template.'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="Title" id="templateTitle" required>
          <input
            type="text"
            id="templateTitle"
            placeholder="Enter template title"
            className="input input-bordered w-full"
            name="templateTitle"
            defaultValue={editingTemplate?.name || ''}
            required
          />
        </FormField>
        
        <FormField label="Template Message" id="templateMessage" required>
          <textarea
            id="templateMessage"
            className="textarea textarea-bordered w-full h-24"
            name="templateMessage"
            defaultValue={editingTemplate?.template || ''}
            placeholder="Enter template message"
            required
          ></textarea>
        </FormField>
        
        <div className="mt-6 flex justify-end">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {getTemplateButtonText()}
          </button>
        </div>
      </form>
    </Modal>
  );
}

AlertTemplateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingTemplate: PropTypes.object
}; 