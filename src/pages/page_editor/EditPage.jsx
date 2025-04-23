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

export function EditPage() {
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
            navigate("/instantiate/eventmaker/pages");
        }
    }, [pages, pageTitle, navigate]);

    const handleNavigateAway = (destination) => {
        if (hasUnsavedChanges) {
            const userConfirmed = window.confirm(
                "You have unsaved changes. Do you really want to leave this page? All changes will be lost."
            );
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
        // Get fully populated component data with all schema properties
        const componentsWithFullProps = sections.map((section) => {
            const componentName = section.componentData.name;
            const schema = getComponentSchema(componentName);
            const currentProps = section.componentData.props;
            
            // Create a new object with all schema properties and their defaults
            const fullProps = {};
            
            // If schema exists, populate properties with defaults
            if (schema && schema.properties) {
                // Add all schema properties with their default values
                Object.entries(schema.properties).forEach(([propName, propSchema]) => {
                    // Skip the name and component_id as they're handled separately
                    if (propName !== 'name' && propName !== 'component_id') {
                        // Use the current value if it exists, otherwise use the default
                        fullProps[propName] = currentProps[propName] !== undefined 
                            ? currentProps[propName] 
                            : (propSchema.default !== undefined ? propSchema.default : null);
                    }
                });
            }
            
            // Return the component with all properties (existing + default values)
            return {
                ...fullProps,
                name: componentName,
                component_id: section.id
            };
        });

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
            showNotification("No changes detected", "info");
            return;
        }

        const dataToSave = { ...pageData, page_id: page.page_id };

        console.log("Saving page data:", dataToSave);

        updatePage(page.page_id, dataToSave)
            .then(() => {
                showNotification("Page updated successfully!", "success");
                navigate("/instantiate/eventmaker/pages");
            })
            .catch((error) => {
                console.error("Failed to update the page.", error);
                showNotification("Failed to update the page.", "error");
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
        return <p>Loading...</p>;
    }

    if (!page) {
        return <p>Loading page data...</p>;
    }

    return (
        <div className="container mx-auto p-4 py-8">
            <PageHeader
                title={page.title}
                subtitle="Edit your page components and content"
                mode="Edit"
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
            />

            <PageActions
                onBack={() => handleNavigateAway("/instantiate/eventmaker/pages")}
                onSave={handleUpdatePage}
                isLoading={isPagesLoading}
                hasUnsavedChanges={hasUnsavedChanges}
                saveButtonText="Update Page"
            />
        </div>
    );
}