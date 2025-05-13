import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { arrayMove } from "@dnd-kit/sortable";
import { useComponents } from "../../contexts/ComponentsContext";
import { usePages } from "../../contexts/PagesContext";
import { useNotification } from "../../contexts/NotificationContext";
import { PageHeader } from "../../components/event_maker/pages/PageHeader";
import { PageTitleInput } from "../../components/event_maker/pages/PageTitleInput";
import { PageContent } from "../../components/event_maker/pages/PageContent";
import { PageActions } from "../../components/event_maker/pages/PageActions";
import { useSections } from "../../hooks/useSections";
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { prepareComponentsWithDefaults } from "../../utils/pageUtils";
import { useTranslation } from "react-i18next";

export function EditPage() {
    const { t } = useTranslation();
    const { pageTitle } = useParams();
    const navigate = useNavigate();
    const { pages, getPages, updatePage, isLoading: isPagesLoading } = usePages();
    const { getDefaultPropsForComponent, getComponentSchema, isLoading: isComponentsLoading } = useComponents();
    const { showNotification } = useNotification();

    const [page, setPage] = useState(null);
    const {
        sections,
        setSections,
        handleComponentTypeChange,
        handleComponentPropsChange,
        handleRemoveSection,
        handleAddSection,
    } = useSections([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [originalData, setOriginalData] = useState(null);

    // Função para verificar se há mudanças não salvas
    const checkForUnsavedChanges = useCallback(() => {
        if (!originalData || !page) return false;

        const currentData = {
            title: page.title,
            components: sections.map((section) => ({
                ...section.componentData.props,
                name: section.componentData.name,
            })),
        };

        const titleChanged = originalData.title !== currentData.title;
        const componentsChanged = !compareComponents(originalData.components, currentData.components);

        return titleChanged || componentsChanged;
    }, [originalData, page, sections]);

    // Efeito para detectar mudanças não salvas
    useEffect(() => {
        const hasChanges = checkForUnsavedChanges();
        setHasUnsavedChanges(hasChanges);
    }, [page, sections, checkForUnsavedChanges]);

    // Aviso ao tentar sair da página com mudanças não salvas
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

    useEffect(() => {
        if (pages.length === 0) {
            getPages();
        }
    }, [pages, getPages]);

    useEffect(() => {
        const decodedTitle = decodeURIComponent(pageTitle);
        const foundPage = pages.find((p) => p.title === decodedTitle);
        if (foundPage) {
            setPage(foundPage);
            const transformedSections = (foundPage.components || []).map((component) => ({
                id: component.component_id,
                componentData: {
                    name: component.name,
                    props: { ...component },
                },
            }));
            setSections(transformedSections);

            // Salvar dados originais para comparação
            setOriginalData({
                title: foundPage.title,
                components: foundPage.components || [],
            });
        } else if (pages.length > 0) {
            navigate("/instantiate/application/pages");
        }
    }, [pages, pageTitle, navigate]);

    const handleNavigateAway = (destination) => {
        if (hasUnsavedChanges) {
            const userConfirmed = window.confirm(t('pageEditor.edit.unsavedChanges'));
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

    const handleUpdatePage = () => {
        // Use the shared utility function to prepare components
        const componentsWithFullProps = prepareComponentsWithDefaults(sections, getComponentSchema);

        const pageData = {
            title: page.title,
            components: componentsWithFullProps
        };

        // Compare current data with original page data
        const originalComponents = page.components || [];
        const componentsEqual = compareComponents(originalComponents, pageData.components);
        const originalTitle = pages.find(p => p.page_id === page.page_id)?.title || "";
        const titleEqual = originalTitle === pageData.title;

        // If nothing has changed, show a notification and return early
        if (titleEqual && componentsEqual) {
            showNotification(t('pageEditor.edit.noChanges'), "info");
            return;
        }

        const dataToSave = { ...pageData, page_id: page.page_id };

        updatePage(page.page_id, dataToSave)
            .then(() => {
                showNotification(t('pageEditor.edit.updateSuccess'), "success");
                navigate("/instantiate/application/pages");
            })
            .catch((error) => {
                console.error("Failed to update the page.", error);
                showNotification(t('pageEditor.edit.updateError'), "error");
            });
    };

    const compareComponents = (originalComponents, newComponents) => {
        if (originalComponents.length !== newComponents.length) {
            return false;
        }

        for (let i = 0; i < originalComponents.length; i++) {
            const original = originalComponents[i];
            const current = newComponents[i];

            if (original.name !== current.name) {
                return false;
            }

            const originalProps = { ...original };
            const currentProps = { ...current };

            delete originalProps.component_id;
            delete originalProps.name;
            delete currentProps.component_id;
            delete currentProps.name;

            for (const key in originalProps) {
                if (originalProps[key] !== currentProps[key]) {
                    return false;
                }
            }

            for (const key in currentProps) {
                if (originalProps[key] === undefined) {
                    return false;
                }
            }
        }

        return true;
    };

    if (isPagesLoading || isComponentsLoading) {
        return <p>{t('pageEditor.edit.loading')}</p>;
    }

    if (!page) {
        return <p>{t('pageEditor.edit.loading')}</p>;
    }

    return (
        <div className="container mx-auto p-4 py-8">
            <PageHeader
                title={page.title}
                subtitle={t('pageEditor.edit.subtitle')}
                mode="Edit"
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
                addComponentText={t('pageEditor.common.addComponent')}
                removeComponentText={t('pageEditor.common.removeComponent')}
                dragToReorderText={t('pageEditor.common.dragToReorder')}
                componentSettingsText={t('pageEditor.common.componentSettings')}
                noComponentsText={t('pageEditor.common.noComponents')}
                addFirstComponentText={t('pageEditor.common.addFirstComponent')}
            />

            <PageActions
                onBack={() => handleNavigateAway("/instantiate/eventmaker/pages")}
                onSave={handleUpdatePage}
                isLoading={isPagesLoading}
                hasUnsavedChanges={hasUnsavedChanges}
                saveButtonText={t('pageEditor.edit.saveButton')}
                backButtonText={t('pageEditor.common.backButton')}
            />
        </div>
    );
}