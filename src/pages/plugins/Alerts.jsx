import { useState, useEffect } from "react";
import { CreateAlertCards } from "../../components/alerts/CreateAlertCards.jsx";
import { AlertList } from "../../components/alerts/AlertList.jsx";
import { AlertFilters } from "../../components/alerts/AlertFilters.jsx";
import { AlertTemplateModal } from "../../components/alerts/AlertTemplateModal.jsx";
import { CreateAlertModal } from "../../components/alerts/CreateAlertModal.jsx";
import { useAlerts } from "../../contexts/AlertsContext.jsx";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import { useTranslation } from "react-i18next";

export default function Alerts() {
    const { t } = useTranslation();
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const { templates, getAlertTemplates, createAlertTemplate, updateAlertTemplate, createAlert, isLoading } = useAlerts();
    const { showNotification } = useNotification();
    
    // Modal state
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    useEffect(() => {
        // Fetch templates when component mounts
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            await getAlertTemplates();
        } catch (error) {
            console.error("Failed to load templates:", error);
            showNotification(t('alerts.errors.loadTemplates'), "error");
        }
    };

    // Filtering templates based on search query
    const filteredTemplates = templates.filter(template => {
        return !searchQuery || 
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.template.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Modal handlers
    const openAlertModal = () => setIsAlertModalOpen(true);
    const closeAlertModal = () => setIsAlertModalOpen(false);
    
    const openTemplateModal = () => setIsTemplateModalOpen(true);
    const closeTemplateModal = () => {
        setIsTemplateModalOpen(false);
        setEditingTemplate(null);
    };

    const handleEditTemplate = (template) => {
        setEditingTemplate(template);
        openTemplateModal();
    };

    // Form submission handlers
    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const templateTitle = formData.get('templateTitle');
        const templateMessage = formData.get('templateMessage');

        if (!templateTitle || !templateMessage) {
            showNotification(t('alerts.errors.requiredFields'), "error");
            return;
        }

        try {
            if (editingTemplate) {
                await updateAlertTemplate(editingTemplate.id, {
                    name: templateTitle,
                    template: templateMessage
                });
                showNotification(t('alerts.success.templateUpdated'), "success");
                setEditingTemplate(null);
            } else {
                await createAlertTemplate({
                    name: templateTitle,
                    template: templateMessage
                });
                showNotification(t('alerts.success.templateCreated'), "success");
            }
            closeTemplateModal();
        } catch (error) {
            console.error("Error with template:", error);
            showNotification(t(editingTemplate ? 'alerts.errors.updateTemplate' : 'alerts.errors.createTemplate'), "error");
        }
    };

    const handleCreateAlert = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const alertMessage = formData.get('alertMessage');
        const selectedTemplate = formData.get('selectedTemplate');
        const highPriority = formData.get('highPriority');

        if (!alertMessage || !highPriority) {
            showNotification(t('alerts.errors.requiredFields'), "error");
            return;
        }

        try {
            // Call the API to create the alert
            await createAlert({
                message: alertMessage,
                priority: highPriority === "Yes" ? "High" : "Low",
                template_id: selectedTemplate || null
            });
            
            showNotification(t('alerts.success.alertCreated'), "success");
            closeAlertModal();
        } catch (error) {
            console.error("Error creating alert:", error);
            showNotification(t('alerts.errors.createAlert'), "error");
        }
    };

    // Loading state
    if (isLoading && templates.length === 0) {
        return (
            <div className="w-full min-h-svh p-8 flex justify-center items-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold my-8">{t('alerts.title')}</h1>
            
            <CreateAlertCards 
                onOpenAlertModal={openAlertModal}
                onOpenTemplateModal={openTemplateModal}
            />
            
            <h1 className="text-3xl font-bold mt-8">{t('alerts.templates.title')}</h1>
            
            <AlertFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />
            
            <AlertList 
                templates={filteredTemplates} 
                onEditTemplate={handleEditTemplate}
            />

            <CreateAlertModal 
                isOpen={isAlertModalOpen}
                onClose={closeAlertModal}
                onSubmit={handleCreateAlert}
                templates={templates}
            />

            <AlertTemplateModal
                isOpen={isTemplateModalOpen}
                onClose={closeTemplateModal}
                onSubmit={handleCreateTemplate}
                editingTemplate={editingTemplate}
            />
        </div>
    );
}