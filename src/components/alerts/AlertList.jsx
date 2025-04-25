import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import { useAlerts } from "../../contexts/AlertsContext";
import { useNotification } from "../../contexts/NotificationContext";
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';

export function AlertList({ templates, onEditTemplate }) {
  const { deleteAlertTemplate } = useAlerts();
  const { showNotification } = useNotification();
  const [deletingTemplateId, setDeletingTemplateId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteClick = (templateId) => {
    setDeletingTemplateId(templateId);
    setIsDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingTemplateId(null);
  };
  
  const confirmDelete = async () => {
    if (!deletingTemplateId) return;
    
    setIsDeleting(true);
    try {
      await deleteAlertTemplate(deletingTemplateId);
      showNotification("Template deleted successfully", "success");
      closeDeleteModal();
    } catch (error) {
      showNotification("Failed to delete template", "error");
      console.error("Error deleting template:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <FaSearch className="mx-auto text-4xl text-gray-400 mb-4" />
        <p className="text-2xl text-gray-500">No templates found</p>
        <p className="text-gray-400">Create a new template to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full grid grid-cols-1 gap-4 mt-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <div key={template.id} className="card bg-white shadow-md">
            <div className="card-body">
              <h2 className="card-title text-secondary">{template.name}</h2>
              <p className="">{template.template}</p>
              <div className="card-actions text-gray-400 absolute top-4 right-4 justify-end">
                <button 
                  className="btn btn-ghost"
                  onClick={() => onEditTemplate(template)}
                >
                  <FaEdit className="" />
                </button>
                <button 
                  className="btn btn-ghost"
                  onClick={() => handleDeleteClick(template.id)}
                >
                  <FaTrash className="" />
                </button>
              </div>
            </div>
          </div>
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

AlertList.propTypes = {
  templates: PropTypes.array.isRequired,
  onEditTemplate: PropTypes.func.isRequired
}; 