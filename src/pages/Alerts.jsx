import CreateCard from "../components/CreateCard.jsx";
import { HiTemplate } from "react-icons/hi";
import { BiSolidBellPlus } from "react-icons/bi";
import React, { useState, useEffect, useRef } from "react";
import { useAlerts } from "../contexts/AlertsContext";
import { useNotification } from "../contexts/NotificationContext";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function Alerts() {
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [templateTitle, setTemplateTitle] = useState("");
    const [templateMessage, setTemplateMessage] = useState("");
    const { templates, getAlertTemplates, createAlertTemplate, updateAlertTemplate, deleteAlertTemplate, createAlert, isLoading, error } = useAlerts();
    const { showNotification } = useNotification();
    const [editingTemplate, setEditingTemplate] = useState(null);
    
    // Alert form state
    const [alertMessage, setAlertMessage] = useState("");
    const [highPriority, setHighPriority] = useState("");
    const alertMessageRef = useRef(null);

    useEffect(() => {
        // Fetch templates when component mounts
        loadTemplates();
    }, []);

    useEffect(() => {
        if (selectedTemplate && templates && templates.length > 0) {
            const templateData = templates.find(t => String(t.id) === String(selectedTemplate));
            if (templateData) {
                setAlertMessage(templateData.template);
            }
        }
    }, [templates, selectedTemplate]);

    const loadTemplates = async () => {
        try {
            await getAlertTemplates();
        } catch (error) {
            console.error("Failed to load templates:", error);
            showNotification("Failed to load templates", "error");
        }
    };

    const handleCreateTemplate = async (e) => {
        e.preventDefault();
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
            setTemplateTitle("");
            setTemplateMessage("");
            document.getElementById('template_modal').close();
        } catch (error) {
            console.error("Error with template:", error);
            showNotification(`Failed to ${editingTemplate ? 'update' : 'create'} template`, "error");
        }
    };

    const handleCreateAlert = async (e) => {
        e.preventDefault();
        if (!alertMessage || highPriority === "") {
            showNotification("Message and high priority setting are required", "error");
            return;
        }

        try {
            // Call the API to create the alert
            const result = await createAlert({
                message: alertMessage,
                priority: highPriority === "Yes" ? "High" : "Low",
                template_id: selectedTemplate || null
            });
            
            console.log("Alert created:", result);
            showNotification("Alert created successfully", "success");
            resetAlertForm();
            document.getElementById('alert_modal').close();
        } catch (error) {
            console.error("Error creating alert:", error);
            showNotification("Failed to create alert", "error");
        }
    };

    const handleTemplateSelect = (e) => {
        const templateId = e.target.value;
        setSelectedTemplate(templateId);
        
        if (templateId) {
            // Compare as strings to handle different data types (string vs number)
            const selectedTemplateData = templates.find(t => String(t.id) === String(templateId));
            console.log("Selected template:", templateId, "Template data:", selectedTemplateData);
            
            if (selectedTemplateData) {
                console.log("Setting message to:", selectedTemplateData.template);
                setAlertMessage(selectedTemplateData.template);
                
                // Focus on the message field after updating for better UX
                setTimeout(() => {
                    if (alertMessageRef.current) {
                        alertMessageRef.current.focus();
                    }
                }, 100);
            }
        } else {
            // Clear message if no template is selected
            setAlertMessage("");
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        if (confirm("Are you sure you want to delete this template?")) {
            try {
                await deleteAlertTemplate(templateId);
                showNotification("Template deleted successfully", "success");
            } catch (error) {
                console.error("Error deleting template:", error);
                showNotification("Failed to delete template", "error");
            }
        }
    };

    const handleEditTemplate = (template) => {
        setEditingTemplate(template);
        setTemplateTitle(template.name);
        setTemplateMessage(template.template);
        openTemplateModal();
    };

    const openAlertModal = () => {
        resetAlertForm();
        document.getElementById('alert_modal').showModal();
    };
    
    const openTemplateModal = () => {
        document.getElementById('template_modal').showModal();
    };

    const resetTemplateForm = () => {
        setEditingTemplate(null);
        setTemplateTitle("");
        setTemplateMessage("");
    };

    const resetAlertForm = () => {
        setAlertMessage("");
        setSelectedTemplate("");
        setHighPriority("");
    };

    return (
        <div className="w-full min-h-svh p-8">
            <h1 className="text-3xl font-bold">Create Alerts</h1>
            <div className="grid grid-cols-3 gap-4 mt-8">
                <CreateCard
                    icon={BiSolidBellPlus}
                    title="Create an alert"
                    description="Create a new alert to notify users about an upcoming event."
                    onClick={openAlertModal}
                />
                <CreateCard
                    icon={HiTemplate}
                    title="Create a Template"
                    description="Create a template to send alerts more efficiently."
                    onClick={() => {
                        resetTemplateForm();
                        openTemplateModal();
                    }}
                />
            </div>
            
            <h1 className="text-3xl font-bold mt-8">Existing Templates</h1>
            
            {isLoading ? (
                <div className="flex justify-center mt-4">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : error ? (
                <div className="alert alert-error mt-4">
                    <span>{error}</span>
                </div>
            ) : templates.length === 0 ? (
                <div className="alert alert-info mt-4">
                    <span>No templates found. Create one to get started!</span>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4 mt-4">
                    {templates.map((template) => (
                        <div key={template.id} className="card bg-base-300 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">{template.name}</h2>
                                <p className="whitespace-pre-wrap">{template.template}</p>
                                <div className="card-actions justify-end mt-4">
                                    <button 
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleEditTemplate(template)}
                                    >
                                        <FaEdit className="mr-1" /> Edit
                                    </button>
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleDeleteTemplate(template.id)}
                                    >
                                        <FaTrash className="mr-1" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <dialog id="alert_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button 
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={resetAlertForm}
                        >✕</button>
                    </form>
                    <h3 className="text-lg font-bold">Create New Alert</h3>
                    <p className="py-4">Fill in the details to create a new alert.</p>
                    <form onSubmit={handleCreateAlert}>
                        <div className="mt-4">
                            <label htmlFor="alertTemplate" className="block">Choose Template</label>
                            <select
                                id="alertTemplate"
                                className="text-base-100 input w-full h-12 bg-secondary rounded-xl"
                                value={selectedTemplate}
                                onChange={handleTemplateSelect}
                            >
                                <option value="">Select a template</option>
                                {templates.map((t) => (
                                    <option key={t.id} value={String(t.id)}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="alertMessage" className="block">Message</label>
                            <textarea
                                id="alertMessage"
                                ref={alertMessageRef}
                                className="text-base-100 input w-full h-24 bg-secondary rounded-xl"
                                value={alertMessage}
                                onChange={(e) => setAlertMessage(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="highPriority" className="block">High Priority</label>
                            <select
                                id="highPriority"
                                className="text-base-100 input w-full h-12 bg-secondary rounded-xl"
                                value={highPriority}
                                onChange={(e) => setHighPriority(e.target.value)}
                                required
                            >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary mt-4 mx-auto w-1/3 flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? <span className="loading loading-spinner loading-sm"></span> : 'Create Alert'}
                        </button>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop bg-none bg-opacity-10">
                    <button onClick={resetAlertForm}>close</button>
                </form>
            </dialog>
            <dialog id="template_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button 
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={resetTemplateForm}
                        >✕</button>
                    </form>
                    <h3 className="text-lg font-bold">
                        {editingTemplate ? 'Edit Template' : 'Create New Template'}
                    </h3>
                    <p className="py-4">
                        {editingTemplate 
                            ? 'Update the template details below.' 
                            : 'Fill in the details to create a new template.'}
                    </p>
                    <form onSubmit={handleCreateTemplate}>
                        <div>
                            <label htmlFor="templateTitle">Title</label>
                            <input
                                type="text"
                                id="templateTitle"
                                placeholder="Enter template title"
                                className="text-base-100 input w-full h-12 bg-secondary rounded-xl"
                                value={templateTitle}
                                onChange={(e) => setTemplateTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="templateMessage" className="block">Template Message</label>
                            <textarea
                                id="templateMessage"
                                className="text-base-100 input w-full h-24 bg-secondary rounded-xl"
                                value={templateMessage}
                                onChange={(e) => setTemplateMessage(e.target.value)}
                                required
                            ></textarea>
                            <p className="text-sm text-base-content/70 mt-2">
                                You can use variables like {'{name}'}, {'{date}'}, etc. in your template.
                            </p>
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary mt-4 mx-auto w-1/3 flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading 
                                ? <span className="loading loading-spinner loading-sm"></span> 
                                : editingTemplate ? 'Update Template' : 'Create Template'
                            }
                        </button>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop bg-none bg-opacity-10">
                    <button onClick={resetTemplateForm}>close</button>
                </form>
            </dialog>
        </div>
    );
}