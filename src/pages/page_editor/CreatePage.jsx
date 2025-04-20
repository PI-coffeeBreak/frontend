import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { arrayMove } from "@dnd-kit/sortable";
import { useComponents } from "../../contexts/ComponentsContext";
import { usePages } from "../../contexts/PagesContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useKeycloak } from "@react-keycloak/web";
import { axiosWithAuth } from "../../utils/axiosWithAuth";
import { PageHeader } from "../../components/event_maker/pages/PageHeader";
import { PageTitleInput } from "../../components/event_maker/pages/PageTitleInput";
import { PageContent } from "../../components/event_maker/pages/PageContent";
import { PageActions } from "../../components/event_maker/pages/PageActions";
import { useSections } from "../../hooks/useSections";
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { DynamicComponentConfiguration } from "../../components/event_maker/pages/DynamicComponentConfiguration";

// Prevent unnecessary re-renders when dragging
const MemoizedDynamicComponentConfiguration = React.memo(
    DynamicComponentConfiguration, 
    (prevProps, nextProps) => {
        return (
            prevProps.id === nextProps.id &&
            prevProps.componentData.name === nextProps.componentData.name &&
            JSON.stringify(prevProps.componentData.props) === JSON.stringify(nextProps.componentData.props)
        );
    }
);

export function CreatePage() {
    const navigate = useNavigate();
    const { keycloak } = useKeycloak();
    const { savePage, isLoading: isPagesLoading } = usePages();
    const { getDefaultPropsForComponent, isLoading: isComponentsLoading } = useComponents();
    const { showNotification } = useNotification();

    const [page, setPage] = useState({ title: "" });
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);
    const {
        sections,
        setSections,
        handleComponentTypeChange,
        handleComponentPropsChange,
        handleRemoveSection,
        handleAddSection,
    } = useSections([]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = sections.findIndex((section) => section.id === active.id);
            const newIndex = sections.findIndex((section) => section.id === over.id);
            setSections((prev) => arrayMove(prev, oldIndex, newIndex));
        }
    };

    const handleSavePage = async () => {
        try {
            const pageData = {
                title: page.title || "New Page",
                components: sections.map((section) => ({
                    ...section.componentData.props,
                    name: section.componentData.name,
                })),
            };

            // Save the page first
            await savePage(pageData);

            // Create menu option for the new page
            const menuOption = {
                icon: "FaFile", // Default icon for pages
                label: pageData.title,
                href: pageData.title.toLowerCase().replace(/\s+/g, '-') // Convert title to URL-friendly format
            };

            const axiosInstance = axiosWithAuth(keycloak);
            await axiosInstance.post(
                `${import.meta.env.VITE_API_BASE_URL}/ui/menu/option`,
                menuOption
            );

            showNotification("Page and menu option created successfully!", "success");
            navigate("/instantiate/eventmaker/pages");
        } catch (error) {
            console.error("Failed to create the page or menu option.", error);
            showNotification("Failed to create the page or menu option.", "error");
        }
    };

    if (isComponentsLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="container mx-auto p-4 py-8">
            <PageHeader
                title="Create New Page"
                subtitle="Design your new page by adding and arranging components"
                mode="Create"
                hasUnsavedChanges={hasUnsavedChanges}
            />

            <PageTitleInput
                title={page.title}
                onChange={(newTitle) => setPage({ ...page, title: newTitle })}
            />

            <PageContent
                sections={sections}
                onDragEnd={handleDragEnd}
                onComponentTypeChange={handleComponentTypeChange}
                onComponentPropsChange={handleComponentPropsChange}
                onRemoveSection={handleRemoveSection}
                onAddSection={handleAddSection}
                getDefaultPropsForComponent={getDefaultPropsForComponent}
                modifiers={[restrictToVerticalAxis]}
                DynamicComponentConfiguration={MemoizedDynamicComponentConfiguration}
            />

            <PageActions
                onBack={() => navigate("/instantiate/eventmaker/pages")}
                onSave={handleSavePage}
                isLoading={isPagesLoading}
                saveButtonText="Save Page"
                hasUnsavedChanges={hasUnsavedChanges}
            />
        </div>
    );
}