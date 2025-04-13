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
