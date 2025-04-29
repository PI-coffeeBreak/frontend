import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { 
    SortableContext, 
    verticalListSortingStrategy,
    sortableKeyboardCoordinates 
} from "@dnd-kit/sortable";
import { DynamicComponentConfiguration } from "./DynamicComponentConfiguration";
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { useTranslation } from 'react-i18next';

export function PageContent({
    sections,
    onDragEnd,
    onComponentTypeChange,
    onComponentPropsChange,
    onRemoveSection,
    onAddSection,
    getDefaultPropsForComponent,
    modifiers = []
}) {
    const { t } = useTranslation();
    const containerRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const renderSections = () => {
        if (sections.length === 0) {
            return (
                <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-base-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    <p className="text-base-content/70 text-lg font-medium">{t('components.pageContent.noSections')}</p>
                    <p className="text-base-content/50 mt-2 max-w-md mx-auto">
                        {t('components.pageContent.startBuilding')}
                    </p>
                </div>
            );
        }

        return sections.map((section) => (
            <DynamicComponentConfiguration
                key={section.id}
                id={section.id}
                componentData={section.componentData}
                onComponentTypeChange={onComponentTypeChange}
                onComponentPropsChange={onComponentPropsChange}
                onRemove={() => onRemoveSection(section.id)}
            />
        ));
    };

    const combinedModifiers = [
        restrictToVerticalAxis,
        restrictToParentElement,
        ...modifiers
    ];

    return (
        <div ref={containerRef} className="relative h-full">
            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={onDragEnd}
                modifiers={combinedModifiers}
                measuring={{
                    droppable: {
                        strategy: 'always'
                    }
                }}
                autoScroll={{
                    threshold: {
                        x: 0,
                        y: 0.2
                    },
                    acceleration: 10,
                    interval: 10
                }}
            >
                <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4 pb-8">
                        {renderSections()}
                        <button
                            className="flex items-center justify-center gap-2 w-full p-5 border-2 border-dashed border-base-300 rounded-lg 
                            hover:bg-base-200 transition-all duration-200 font-medium text-base-content/80"
                            onClick={() => {
                                const componentType = "Text";
                                const newSection = {
                                    id: `section-${Date.now()}`,
                                    componentData: {
                                        name: componentType,
                                        props: getDefaultPropsForComponent(componentType),
                                    },
                                };
                                onAddSection(newSection);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t('components.pageContent.addNewSection')}
                        </button>
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}

PageContent.propTypes = {
    sections: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        componentData: PropTypes.shape({
            name: PropTypes.string.isRequired,
            props: PropTypes.object.isRequired
        }).isRequired
    })).isRequired,
    onDragEnd: PropTypes.func.isRequired,
    onComponentTypeChange: PropTypes.func.isRequired,
    onComponentPropsChange: PropTypes.func.isRequired,
    onRemoveSection: PropTypes.func.isRequired,
    onAddSection: PropTypes.func.isRequired,
    getDefaultPropsForComponent: PropTypes.func.isRequired,
    modifiers: PropTypes.array
};