import { useState, useEffect } from "react"
import { Save, Undo } from "lucide-react"
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import { useTranslation } from "react-i18next";

export function ThemeCustomizer() {
  const { t } = useTranslation();
  const { theme, fetchThemeColors, updateThemeColors, initialTheme } = useTheme();
  const { showNotification } = useNotification();
  const [hexValues, setHexValues] = useState({});

  // Load saved theme from context on component mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        await fetchThemeColors();
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };
    
    loadTheme();
  }, []);

  // Update local state when context theme changes
  useEffect(() => {
    if (Object.keys(theme).length > 0) {
      setHexValues(theme);
      
      // Apply the theme to CSS variables
      Object.keys(theme).forEach((key) => {
        document.documentElement.style.setProperty(`--color-${key}`, theme[key]);
      });
    }
  }, [theme]);

  const handleColorChange = (key, hexValue) => {
    const newHexValues = { ...hexValues, [key]: hexValue };
    setHexValues(newHexValues);

    // Update the theme state with the new hex value
    const newTheme = { ...theme };
    newTheme[key] = hexValue;
  };

  const resetTheme = async () => {
    try {
      await fetchThemeColors();
      showNotification(t('themeCustomizer.actions.reset'), "info");
    } catch (error) {
      console.error("Error resetting theme:", error);
      showNotification(t('themeCustomizer.error.reset'), "error");
    }
  };

  const saveTheme = async () => {
    try {
      await updateThemeColors(hexValues);
      showNotification(t('themeCustomizer.success.save'), "success");
    } catch (error) {
      console.error("Error saving theme:", error);
      showNotification(t('themeCustomizer.error.save'), "error");
    }
  };

  // User-friendly color names
  const colorMapping = {
    primary: t('themeCustomizer.colorNames.primary'),
    "primary-content": t('themeCustomizer.colorNames.primary-content'),
    secondary: t('themeCustomizer.colorNames.secondary'),
    "secondary-content": t('themeCustomizer.colorNames.secondary-content'),
    accent: t('themeCustomizer.colorNames.accent'),
    "accent-content": t('themeCustomizer.colorNames.accent-content'),
    "base-100": t('themeCustomizer.colorNames.base-100'),
    "base-200": t('themeCustomizer.colorNames.base-200'),
    "base-300": t('themeCustomizer.colorNames.base-300'),
    "base-content": t('themeCustomizer.colorNames.base-content'),
    info: t('themeCustomizer.colorNames.info'),
    "info-content": t('themeCustomizer.colorNames.info-content'),
    success: t('themeCustomizer.colorNames.success'),
    "success-content": t('themeCustomizer.colorNames.success-content'),
    warning: t('themeCustomizer.colorNames.warning'),
    "warning-content": t('themeCustomizer.colorNames.warning-content'),
    error: t('themeCustomizer.colorNames.error'),
    "error-content": t('themeCustomizer.colorNames.error-content'),
    neutral: t('themeCustomizer.colorNames.neutral'),
    "neutral-content": t('themeCustomizer.colorNames.neutral-content'),
  }

  // Group colors by type for better organization
  const colorGroups = {
    [t('themeCustomizer.colorGroups.brandColors')]: ["primary", "primary-content", "secondary", "secondary-content", "accent", "accent-content"],
    [t('themeCustomizer.colorGroups.backgroundText')]: ["base-100", "base-200", "base-300", "base-content"],
    [t('themeCustomizer.colorGroups.statusColors')]: ["info", "info-content", "success", "success-content", "warning", "warning-content", "error", "error-content"],
    [t('themeCustomizer.colorGroups.neutrals')]: ["neutral", "neutral-content"],
  }

  return (
    <div className="w-full min-h-svh p-2 lg:p-8">
      <div className="flex items-center justify-between mb-6 pt-8">
        <h2 className="text-3xl font-bold">{t('themeCustomizer.title')}</h2>
        <div className="flex gap-2">
          <button
            className="btn btn-secondary rounded-xl"
            onClick={resetTheme}
            title={t('themeCustomizer.actions.resetTitle')}
          >
            <Undo className="w-4 h-4" />
            {t('themeCustomizer.actions.reset')}
          </button>
          <button
            className="btn btn-primary rounded-xl"
            onClick={saveTheme}
          >
            <Save className="w-4 h-4" />
            {t('themeCustomizer.actions.save')}
          </button>
        </div>
      </div>
      <div className="space-y-8">
        {Object.entries(colorGroups).map(([groupName, colorKeys]) => (
          <div key={groupName} className="">
            <div className="">
              <h3 className="text-lg">{groupName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {colorKeys.map((key) => (
                  <div key={key} className="bg-base-200/70 p-4 rounded-xl flex flex-col items-center justify-center">
                    <span className="font-medium mb-2">{colorMapping[key] || key}</span>
                    <label className="flex flex-col items-center relative mt-1 mx-auto">
                      <input
                        type="color"
                        value={hexValues[key] || "#000000"}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="absolute inset-0 w-12 h-12 opacity-0 cursor-pointer"
                        tabIndex={-1}
                        aria-label={colorMapping[key] || key}
                        style={{ zIndex: 2 }}
                      />
                      <span
                        className="w-12 h-12 rounded-xl shadow-inner border-2 border-base-300 flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: key.includes('content') ? hexValues[key.replace('-content', '')] : hexValues[key],
                          color: key.includes('content') ? hexValues[key] : undefined,
                        }}
                      >
                        {key.includes('content') && t('themeCustomizer.actions.text')}
                      </span>
                      <span className="text-xs font-mono bg-base-300 px-2 py-0.5 rounded mt-1 inline-block">
                        {hexValues[key]}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
