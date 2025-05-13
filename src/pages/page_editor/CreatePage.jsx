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
import { prepareComponentsWithDefaults } from "../../utils/pageUtils";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { keycloak } = useKeycloak();
    const { savePage, getPageNames, isLoading: isPagesLoading } = usePages();
    const { getDefaultPropsForComponent, getComponentSchema, isLoading: isComponentsLoading } = useComponents();
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

    const generateUniqueTitle = (baseTitle, existingTitles) => {
        let uniqueTitle = baseTitle;
        let counter = 1;

        while (existingTitles.includes(uniqueTitle)) {
            uniqueTitle = `${baseTitle} (${counter})`;
            counter++;
        }

        return uniqueTitle;
    };

    const handleSavePage = async () => {
        try {
            const existingTitles = getPageNames();
            let title = page.title.trim();

            if (!title) {
                title = "New Page";
            }

            // Ensure the title is unique
            const uniqueTitle = generateUniqueTitle(title, existingTitles);

            // Use the shared utility function to prepare components
            const componentsWithFullProps = prepareComponentsWithDefaults(sections, getComponentSchema);

            const pageData = {
                title: uniqueTitle,
                components: componentsWithFullProps,
            };

            // Save the page first
            await savePage(pageData);

            // Create menu option for the new page
            const menuOption = {
                icon: "FaFile", // Default icon for pages
                label: pageData.title,
                href: pageData.title.toLowerCase().replace(/\s+/g, '-'), // Convert title to URL-friendly format
            };

            const axiosInstance = axiosWithAuth(keycloak);
            await axiosInstance.post(
                `${import.meta.env.VITE_API_BASE_URL}/ui/menu/option`,
                menuOption
            );

            showNotification(t('pageEditor.create.createSuccess'), "success");
            navigate("/instantiate/application/pages");
        } catch (error) {
            console.error("Failed to create the page or menu option.", error);
            showNotification(t('pageEditor.create.createError'), "error");
        }
    };

    if (isComponentsLoading) {
        return <p>{t('pageEditor.create.loading')}</p>;
    }

    return (
        <div className="container mx-auto p-4 py-8">
            <PageHeader
                title={t('pageEditor.create.title')}
                subtitle={t('pageEditor.create.subtitle')}
                mode="Create"
                hasUnsavedChanges={hasUnsavedChanges}
            />

            <PageTitleInput
                title={page.title}
                onChange={(newTitle) => setPage({ ...page, title: newTitle })}
                placeholder={t('pageEditor.common.titlePlaceholder')}
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
                addComponentText={t('pageEditor.common.addComponent')}
                removeComponentText={t('pageEditor.common.removeComponent')}
                dragToReorderText={t('pageEditor.common.dragToReorder')}
                componentSettingsText={t('pageEditor.common.componentSettings')}
                noComponentsText={t('pageEditor.common.noComponents')}
                addFirstComponentText={t('pageEditor.common.addFirstComponent')}
            />

            <PageActions
                onBack={() => navigate("/instantiate/application/pages")}
                onSave={handleSavePage}
                isLoading={isPagesLoading}
                hasUnsavedChanges={hasUnsavedChanges}
                saveButtonText={t('pageEditor.create.saveButton')}
                backButtonText={t('pageEditor.common.backButton')}
            />
        </div>
    );
}