import { useState } from "react";

export const useSections = (initialSections = []) => {
  const [sections, setSections] = useState(initialSections);

  const handleComponentTypeChange = (id, newType) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === id
          ? {
              ...section,
              componentData: {
                name: newType,
                props: {},
              },
            }
          : section
      )
    );
  };

  const handleComponentPropsChange = (id, updatedProps) => {
    // Verificar se há propriedades de mídia e garantir que o UUID seja preservado
    const processedProps = { ...updatedProps };
    Object.entries(updatedProps).forEach(([key, value]) => {
      if (value && typeof value === "object" && "uuid" in value) {
        processedProps[key] = { uuid: value.uuid };
      }
    });

    setSections((prevSections) => {
      const newSections = prevSections.map((section) =>
        section.id === id
          ? {
              ...section,
              componentData: {
                ...section.componentData,
                props: processedProps,
              },
            }
          : section
      );
      return newSections;
    });
  };

  const handleRemoveSection = (id) => {
    setSections((prevSections) =>
      prevSections.filter((section) => section.id !== id)
    );
  };

  const handleAddSection = (newSection) => {
    setSections((prevSections) => [...prevSections, newSection]);
  };

  return {
    sections,
    setSections,
    handleComponentTypeChange,
    handleComponentPropsChange,
    handleRemoveSection,
    handleAddSection,
  };
};
