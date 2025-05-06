import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useMenus } from "../contexts/MenuContext.jsx";
import { useNotification } from "../contexts/NotificationContext";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from "@dnd-kit/utilities";
import { FaPlus, FaEdit, FaTrash, FaBars, FaSearch } from "react-icons/fa";
import { IconSelector } from "../components/event_maker/IconSelector.jsx";
import { useTranslation } from "react-i18next";

function SortableMenuItem({ option, onEdit, onDelete }) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: option.id });
  
  const { getIconComponent } = useMenus();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const IconComponent = getIconComponent(option.icon);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-white p-4 mb-2 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center"
    >
      <div className="flex items-center gap-3">
        <div {...listeners} {...attributes} className="cursor-grab text-gray-400 hover:text-gray-600">
          <FaBars />
        </div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-full bg-primary/10 text-primary">
            <IconComponent />
          </span>
          <div>
            <p className="font-medium">{option.label}</p>
            <p className="text-xs text-gray-500">{option.href}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onEdit(option)}
          className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
          title={t('menuEditor.actions.edit')}
        >
          <FaEdit />
        </button>
        <button 
          onClick={() => onDelete(option.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
          title={t('menuEditor.actions.delete')}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

SortableMenuItem.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    icon: PropTypes.string,
    label: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

function AddOptionModal({ isOpen, onClose, newOption, setNewOption, onAdd }) {
  const { t } = useTranslation();
  const labelInputId = React.useId();
  const urlInputId = React.useId();
  const modalRef = React.useRef(null);
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);

  React.useEffect(() => {
    const dialog = modalRef.current;
    if (dialog) {
      if (isOpen) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleDialogClose = () => {
    onClose();
  };

  return (
    <dialog 
      id="add_option_modal" 
      className="modal"
      ref={modalRef}
      onClose={handleDialogClose}
    >
      <div className="modal-box w-11/12 max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-xl mb-4">{t('menuEditor.modal.add.title')}</h3>
        
        <div className={`icon-selector-container ${isIconSelectorOpen ? 'h-[450px]' : 'h-auto'} transition-all duration-300`}>
          <IconSelector 
            value={newOption.icon} 
            onChange={(icon) => setNewOption({...newOption, icon})}
            maxDisplayIcons={200}
            onSelectorToggle={setIsIconSelectorOpen}
          />
        </div>
        
        <div className="space-y-3 mt-3">
          <div>
            <label 
              htmlFor={labelInputId} 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('menuEditor.modal.add.label')}
            </label>
            <input
              id={labelInputId}
              type="text"
              value={newOption.label}
              onChange={(e) => setNewOption({...newOption, label: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder={t('menuEditor.modal.add.labelPlaceholder')}
            />
          </div>
          
          <div>
            <label 
              htmlFor={urlInputId}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('menuEditor.modal.add.url')}
            </label>
            <input
              id={urlInputId}
              type="text"
              value={newOption.href}
              onChange={(e) => setNewOption({...newOption, href: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder={t('menuEditor.modal.add.urlPlaceholder')}
            />
          </div>
        </div>
        
        <div className="modal-action mt-4">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            {t('menuEditor.modal.add.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAdd}
          >
            {t('menuEditor.modal.add.add')}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>{t('menuEditor.modal.add.cancel')}</button>
      </form>
    </dialog>
  );
}

AddOptionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  newOption: PropTypes.shape({
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired
  }).isRequired,
  setNewOption: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired
};

function EditOptionModal({ isOpen, onClose, editingOption, setEditingOption, onUpdate }) {
  const { t } = useTranslation();
  const editLabelInputId = React.useId();
  const editUrlInputId = React.useId();
  const modalRef = React.useRef(null);
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);

  React.useEffect(() => {
    const dialog = modalRef.current;
    if (dialog) {
      if (isOpen) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleDialogClose = () => {
    onClose();
  };

  return (
    <dialog 
      id="edit_option_modal" 
      className="modal"
      ref={modalRef}
      onClose={handleDialogClose}
    >
      <div className="modal-box w-11/12 max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-xl mb-4">{t('menuEditor.modal.edit.title')}</h3>
        
        {editingOption && (
          <>
            <div className={`icon-selector-container ${isIconSelectorOpen ? 'h-[450px]' : 'h-auto'} transition-all duration-300`}>
              <IconSelector 
                value={editingOption.icon} 
                onChange={(icon) => setEditingOption({...editingOption, icon})}
                maxDisplayIcons={200}
                onSelectorToggle={setIsIconSelectorOpen}
              />
            </div>
            
            <div className="space-y-3 mt-3">
              <div>
                <label 
                  htmlFor={editLabelInputId}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t('menuEditor.modal.add.label')}
                </label>
                <input
                  id={editLabelInputId}
                  type="text"
                  value={editingOption.label}
                  onChange={(e) => setEditingOption({...editingOption, label: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label 
                  htmlFor={editUrlInputId}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t('menuEditor.modal.add.url')}
                </label>
                <input
                  id={editUrlInputId}
                  type="text"
                  value={editingOption.href}
                  onChange={(e) => setEditingOption({...editingOption, href: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </>
        )}
        
        <div className="modal-action mt-4">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            {t('menuEditor.modal.edit.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onUpdate}
          >
            {t('menuEditor.modal.edit.update')}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>{t('menuEditor.modal.edit.cancel')}</button>
      </form>
    </dialog>
  );
}

EditOptionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editingOption: PropTypes.shape({
    id: PropTypes.string,
    icon: PropTypes.string,
    label: PropTypes.string,
    href: PropTypes.string
  }),
  setEditingOption: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export function MenuEditor() {
  const { t } = useTranslation();
  const { 
    menuOptions, 
    isLoading, 
    error, 
    getMenuOptions, 
    addMenuOption, 
    updateMenuOption, 
    deleteMenuOption, 
    updateMenuOptionsOrder 
  } = useMenus();
  const { showNotification } = useNotification();
  
  const [editingOption, setEditingOption] = useState(null);
  const [newOption, setNewOption] = useState({
    icon: "FaHome",
    label: "",
    href: ""
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    getMenuOptions();
  }, []);

  useEffect(() => {
    if (!menuOptions || !Array.isArray(menuOptions)) {
      setFilteredOptions([]);
      return;
    }
    
    const filtered = menuOptions.filter(option => 
      option?.label && typeof option.label === 'string' ? 
        option.label.toLowerCase().includes((searchTerm || '').toLowerCase()) : 
        false
    );
    
    setFilteredOptions(filtered);
  }, [menuOptions, searchTerm]);

  const handleAddOption = async () => {
    try {
      if (!newOption.label.trim() || !newOption.href.trim()) {
        showNotification(t('menuEditor.validation.requiredFields'), "error");
        return;
      }

      await addMenuOption(newOption);
      showNotification(t('menuEditor.actions.addSuccess'), "success");
      setNewOption({ icon: "FaHome", label: "", href: "" });
      setIsAddModalOpen(false);
      
      await getMenuOptions();
    } catch (error) {
      console.error("Error adding menu option:", error);
      showNotification(t('menuEditor.actions.addError'), "error");
    }
  };

  const handleUpdateOption = async () => {
    try {
      if (!editingOption.label.trim() || !editingOption.href.trim()) {
        showNotification(t('menuEditor.validation.requiredFields'), "error");
        return;
      }

      await updateMenuOption(editingOption.id, editingOption);
      showNotification(t('menuEditor.actions.updateSuccess'), "success");
      setIsEditModalOpen(false);
      
      await getMenuOptions();
    } catch (error) {
      console.error("Error updating menu option:", error);
      showNotification(t('menuEditor.actions.updateError'), "error");
    }
  };

  const handleDeleteOption = async (id) => {
    if (window.confirm(t('menuEditor.actions.deleteConfirm'))) {
      try {
        await deleteMenuOption(id);
        showNotification(t('menuEditor.actions.deleteSuccess'), "success");
        
        await getMenuOptions();
      } catch (error) {
        console.error("Error deleting menu option:", error);
        showNotification(t('menuEditor.actions.deleteError'), "error");
      }
    }
  };

  const handleEditOption = (option) => {
    setEditingOption(option);
    setIsEditModalOpen(true);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    try {
      const oldIndex = menuOptions.findIndex(item => item.id === active.id);
      const newIndex = menuOptions.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedOptions = arrayMove(menuOptions, oldIndex, newIndex);
        await updateMenuOptionsOrder(reorderedOptions);
        showNotification(t('menuEditor.actions.orderSuccess'), "success");
        
        await getMenuOptions();
      }
    } catch (error) {
      console.error("Error reordering menu options:", error);
      showNotification(t('menuEditor.actions.orderError'), "error");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('menuEditor.title')}</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary gap-2"
        >
          <FaPlus /> {t('menuEditor.addButton')}
        </button>
      </div>

      <div className="bg-base-200 p-4 rounded-lg mb-6">
        <p className="text-base-content/70">
          {t('menuEditor.description')}
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <label htmlFor="menuSearchInput" className="sr-only">{t('menuEditor.searchPlaceholder')}</label>
          <input
            id="menuSearchInput"
            type="text"
            placeholder={t('menuEditor.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {renderContent()}

      <AddOptionModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        newOption={newOption}
        setNewOption={setNewOption}
        onAdd={handleAddOption}
      />
      
      <EditOptionModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editingOption={editingOption}
        setEditingOption={setEditingOption}
        onUpdate={handleUpdateOption}
      />
    </div>
  );

  function renderContent() {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
              <button 
                onClick={getMenuOptions} 
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                {t('menuEditor.validation.reload')}
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (!menuOptions || !Array.isArray(menuOptions)) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {t('menuEditor.validation.invalidData')}
              </p>
              <button 
                onClick={getMenuOptions} 
                className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600"
              >
                {t('menuEditor.validation.reload')}
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (filteredOptions.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">{t('menuEditor.emptyState.title')}</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? t('menuEditor.emptyState.description.search', { searchTerm }) : t('menuEditor.emptyState.description.default')}
          </p>
          {renderEmptyStateAction()}
        </div>
      );
    }
    
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={filteredOptions.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <fieldset className="space-y-2">
            <legend className="sr-only">{t('menuEditor.title')}</legend>
            {filteredOptions.map(option => (
              <SortableMenuItem 
                key={option.id} 
                option={option} 
                onEdit={handleEditOption}
                onDelete={handleDeleteOption}
              />
            ))}
          </fieldset>
        </SortableContext>
      </DndContext>
    );
  }

  function renderEmptyStateAction() {
    if (searchTerm) {
      return (
        <button
          onClick={() => setSearchTerm("")}
          className="text-primary hover:underline"
        >
          {t('menuEditor.emptyState.clearSearch')}
        </button>
      );
    }
    
    return (
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="btn btn-primary btn-sm gap-1"
      >
        <FaPlus size={12} /> {t('menuEditor.emptyState.addFirstItem')}
      </button>
    );
  }
}