import { useState } from "react";

export const useSections = (initialSections = []) => {
  const [sections, setSections] = useState(initialSections);

  const handleComponentTypeChange = (id, newType) => {
    console.log("useSections - handleComponentTypeChange:", { id, newType });
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
    console.log("useSections - handleComponentPropsChange:", {
      id,
      updatedProps,
      "current sections": sections,
    });

    // Verificar se há propriedades de mídia e garantir que o UUID seja preservado
    const processedProps = { ...updatedProps };
    Object.entries(updatedProps).forEach(([key, value]) => {
      if (value && typeof value === "object" && "uuid" in value) {
        console.log("useSections - Processing media property:", { key, value });
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
      console.log("useSections - Updated sections:", {
        newSections,
        "section being updated": id,
        "new props": processedProps,
      });
      return newSections;
    });
  };

  const handleRemoveSection = (id) => {
    console.log("useSections - handleRemoveSection:", { id });
    setSections((prevSections) =>
      prevSections.filter((section) => section.id !== id)
    );
  };

  const handleAddSection = (newSection) => {
    console.log("useSections - handleAddSection:", { newSection });
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
