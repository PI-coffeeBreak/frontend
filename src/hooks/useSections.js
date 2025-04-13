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
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === id
          ? {
              ...section,
              componentData: {
                ...section.componentData,
                props: updatedProps,
              },
            }
          : section
      )
    );
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
