// Helper to get color value from theme
export const getThemeColor = (theme, colorKey) => {
  if (theme[colorKey]) {
    return theme[colorKey];
  }

  if (colorKey.startsWith("#")) {
    return colorKey;
  }
  // Default fallback
  return theme["base-content"];
};

/**
 * Gets the CSS variable for a given color
 * @param {string} color - The color value from the Color enum (e.g. 'text-primary')
 * @returns {string} The CSS variable reference
 */
export const getColorVariable = (color) => {
  // Remove the 'text-' prefix and convert to CSS variable format
  const baseColor = color.replace("text-", "");
  return `var(--color-${baseColor})`;
};

/**
 * Gets the actual color value from theme for a given color key
 * @param {Object} theme - The theme object
 * @param {string} colorKey - The color key (e.g. 'base-content')
 * @returns {string} The actual color value
 */
export const getThemeColorValue = (theme, colorKey) => {
  const themeKey = colorKey.replace(/_/g, '-');
  return theme?.[themeKey] || '#000';
};
