/**
 * Processes sections to ensure all component properties are populated with their schema defaults
 * @param {Array} sections Array of section objects with componentData
 * @param {Function} getComponentSchema Function to get component schema
 * @returns {Array} Array of fully populated component objects
 */
export function prepareComponentsWithDefaults(sections, getComponentSchema) {
  return sections.map((section) => {
    const componentName = section.componentData.name;
    const schema = getComponentSchema(componentName);
    const currentProps = section.componentData.props || {};
    
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
}