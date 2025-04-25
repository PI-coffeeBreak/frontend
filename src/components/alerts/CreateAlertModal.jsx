import PropTypes from 'prop-types';
import { useRef } from 'react';
import { useAlerts } from '../../contexts/AlertsContext';
import { Modal } from '../common/Modal';
import FormField from '../common/FormField';

export function CreateAlertModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  templates = [] 
}) {
  const { isLoading } = useAlerts();
  const alertMessageRef = useRef(null);

  const getAlertButtonText = () => {
    if (isLoading) {
      return <span className="loading loading-spinner loading-sm"></span>;
    }
    return 'Create Alert';
  };
  
  const handleTemplateSelect = (e) => {
    const templateId = e.target.value;
    
    if (templateId) {
      const selectedTemplateData = templates.find(t => String(t.id) === String(templateId));
      
      if (selectedTemplateData && alertMessageRef.current) {
        alertMessageRef.current.value = selectedTemplateData.template;
        
        setTimeout(() => {
          if (alertMessageRef.current) {
            alertMessageRef.current.focus();
          }
        }, 100);
      }
    } else if (alertMessageRef.current) {
      alertMessageRef.current.value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Alert"
      description="Fill in the details to create a new alert."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="Choose Template" id="alertTemplate">
          <select
            id="alertTemplate"
            name="selectedTemplate"
            className="select select-bordered w-full"
            defaultValue=""
            onChange={handleTemplateSelect}
          >
            <option value="">Select a template</option>
            {templates.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>
        </FormField>
        
        <FormField label="Message" id="alertMessage" required>
          <textarea
            id="alertMessage"
            ref={alertMessageRef}
            name="alertMessage"
            className="textarea textarea-bordered w-full h-24"
            placeholder="Enter alert message"
            required
          ></textarea>
        </FormField>
        
        <FormField label="High Priority" id="highPriority" required>
          <select
            id="highPriority"
            name="highPriority"
            className="select select-bordered w-full"
            defaultValue=""
            required
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </FormField>
        
        <div className="mt-6 flex justify-end">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {getAlertButtonText()}
          </button>
        </div>
      </form>
    </Modal>
  );
}

CreateAlertModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  templates: PropTypes.array
}; 