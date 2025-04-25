import { useState, useEffect } from "react";
import { CreateAlertCards } from "../components/alerts/CreateAlertCards";
import { AlertList } from "../components/alerts/AlertList";
import { AlertFilters } from "../components/alerts/AlertFilters";
import { AlertTemplateModal } from "../components/alerts/AlertTemplateModal";
import { CreateAlertModal } from "../components/alerts/CreateAlertModal";
import { useAlerts } from "../contexts/AlertsContext";
import { useNotification } from "../contexts/NotificationContext";

export default function Alerts() {
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
            showNotification("Failed to load templates", "error");
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
            showNotification("Template title and message are required", "error");
            return;
        }

        try {
            if (editingTemplate) {
                await updateAlertTemplate(editingTemplate.id, {
                    name: templateTitle,
                    template: templateMessage
                });
                showNotification("Template updated successfully", "success");
                setEditingTemplate(null);
            } else {
                await createAlertTemplate({
                    name: templateTitle,
                    template: templateMessage
                });
                showNotification("Template created successfully", "success");
            }
            closeTemplateModal();
        } catch (error) {
            console.error("Error with template:", error);
            showNotification(`Failed to ${editingTemplate ? 'update' : 'create'} template`, "error");
        }
    };

    const handleCreateAlert = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const alertMessage = formData.get('alertMessage');
        const selectedTemplate = formData.get('selectedTemplate');
        const highPriority = formData.get('highPriority');

        if (!alertMessage || !highPriority) {
            showNotification("Message and high priority setting are required", "error");
            return;
        }

        try {
            // Call the API to create the alert
            await createAlert({
                message: alertMessage,
                priority: highPriority === "Yes" ? "High" : "Low",
                template_id: selectedTemplate || null
            });
            
            showNotification("Alert created successfully", "success");
            closeAlertModal();
        } catch (error) {
            console.error("Error creating alert:", error);
            showNotification("Failed to create alert", "error");
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
        <div className="w-full min-h-svh p-2 lg:p-8">
            <h1 className="text-3xl font-bold">Create Alerts</h1>
            
            <CreateAlertCards 
                onOpenAlertModal={openAlertModal}
                onOpenTemplateModal={openTemplateModal}
            />
            
            <h1 className="text-3xl font-bold mt-8">Alert Templates</h1>
            
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