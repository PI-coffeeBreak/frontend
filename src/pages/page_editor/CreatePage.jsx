import React, { useState, useCallback, useEffect } from "react";
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
    const { createPage, isLoading: isPagesLoading } = usePages();
    const { getDefaultPropsForComponent, getComponentSchema, isLoading: isComponentsLoading } = useComponents();
    const { showNotification } = useNotification();

    const [title, setTitle] = useState("");
    const {
        sections,
        setSections,
        handleComponentTypeChange,
        handleComponentPropsChange,
        handleRemoveSection,
        handleAddSection,
    } = useSections([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const checkForUnsavedChanges = useCallback(() => {
        return title !== "" || sections.length > 0;
    }, [title, sections]);

    useEffect(() => {
        const hasChanges = checkForUnsavedChanges();
        setHasUnsavedChanges(hasChanges);
    }, [title, sections, checkForUnsavedChanges]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const handleNavigateAway = (destination) => {
        if (hasUnsavedChanges) {
            const userConfirmed = window.confirm(t('pageEditor.create.unsavedChanges'));
            if (!userConfirmed) {
                return;
            }
        }
        navigate(destination);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = sections.findIndex((section) => section.id === active.id);
            const newIndex = sections.findIndex((section) => section.id === over.id);
            setSections((prev) => arrayMove(prev, oldIndex, newIndex));
        }
    };

    const handleCreatePage = () => {
        if (!title.trim()) {
            showNotification(t('pageEditor.create.titleRequired'), "error");
            return;
        }

        const componentsWithFullProps = prepareComponentsWithDefaults(sections, getComponentSchema);

        const pageData = {
            title: title.trim(),
            components: componentsWithFullProps
        };

        createPage(pageData)
            .then(() => {
                showNotification(t('pageEditor.create.createSuccess'), "success");
                navigate("/instantiate/eventmaker/pages");
            })
            .catch((error) => {
                console.error("Failed to create the page.", error);
                showNotification(t('pageEditor.create.createError'), "error");
            });
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
                title={title}
                onChange={setTitle}
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
                addComponentText={t('pageEditor.common.addComponent')}
                removeComponentText={t('pageEditor.common.removeComponent')}
                dragToReorderText={t('pageEditor.common.dragToReorder')}
                componentSettingsText={t('pageEditor.common.componentSettings')}
                noComponentsText={t('pageEditor.common.noComponents')}
                addFirstComponentText={t('pageEditor.common.addFirstComponent')}
            />

            <PageActions
                onBack={() => handleNavigateAway("/instantiate/eventmaker/pages")}
                onSave={handleCreatePage}
                isLoading={isPagesLoading}
                hasUnsavedChanges={hasUnsavedChanges}
                saveButtonText={t('pageEditor.create.saveButton')}
                backButtonText={t('pageEditor.common.backButton')}
            />
        </div>
    );
}