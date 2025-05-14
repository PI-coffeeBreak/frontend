import { useState, useEffect } from "react"
import { Save, Undo, Calendar, Users, MapPin, Bell, Clock, Gift, Music, Camera } from "lucide-react"
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import { useTranslation } from "react-i18next";


export function ThemeCustomizer() {
  const { t } = useTranslation();
  const { theme, fetchThemeColors, updateThemeColors, initialTheme } = useTheme();
  const { showNotification } = useNotification();

  const [localTheme, setLocalTheme] = useState(initialTheme);
  const [hexValues, setHexValues] = useState({});
  const [activeTab, setActiveTab] = useState("colors");

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
      setLocalTheme(theme);
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
    const newTheme = { ...localTheme };
    newTheme[key] = hexValue;
    setLocalTheme(newTheme);

    // Apply the new theme to CSS variables
    document.documentElement.style.setProperty(`--color-${key}`, hexValue);
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

  const renderPreview = () => (
    <div className="">
      <h3 className="text-xl font-bold text-center mb-6" style={{ color: hexValues["base-content"] }}>{t('themeCustomizer.preview.title')}</h3>

      {/* Event Header */}
      <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: hexValues["primary"], color: hexValues["primary-content"] }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            <span className="font-bold">{t('themeCustomizer.preview.talks')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">May 24, 2025</span>
          </div>
        </div>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card shadow-sm" style={{ backgroundColor: hexValues["base-200"]}}>
          <div className="card-body p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" style={{ color: hexValues["primary"] }} />
              <h3 className="card-title" style={{ color: hexValues["base-content"] }}>{t('themeCustomizer.preview.eventLocation')}</h3>
            </div>
            <p className="text-sm">Centro de Congressos de Aveiro</p>
            <p className="text-xs" style={{ color: hexValues["base-content"] }}>Cais da Fonte Nova, 3810-164 Aveiro</p>
          </div>
        </div>

        <div className="card shadow-sm" style={{ backgroundColor: hexValues["base-200"] }}>
          <div className="card-body p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" style={{ color: hexValues["primary"] }} />
              <h3 className="card-title" style={{ color: hexValues["base-content"] }}>{t('themeCustomizer.preview.attendees')}</h3>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm">400 {t('themeCustomizer.preview.tickets')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Artists */}
      <h4 className="font-semibold mb-3">{t('themeCustomizer.preview.sponsors')}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: hexValues["accent"], color: hexValues["accent-content"] }}>
          <Camera className="w-4 h-4 mx-auto mb-1" />
          <p className="font-medium">Glicinias Plaza</p>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: hexValues["secondary"], color: hexValues["secondary-content"] }}>
          <Camera className="w-4 h-4 mx-auto mb-1" />
          <p className="font-medium">Civilria</p>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: hexValues["primary"], color: hexValues["primary-content"] }}>
          <Camera className="w-4 h-4 mx-auto mb-1" />
          <p className="font-medium">Saint-Gobain</p>
        </div>
      </div>

      {/* Status Updates */}
      <h4 className="font-semibold mb-3">{t('themeCustomizer.preview.eventUpdates')}</h4>
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: hexValues["info"], color: hexValues["info-content"] }}>
          <Bell className="w-4 h-4" style={{ color: hexValues["info-content"]}}/>
          <p className="text-sm">{t('themeCustomizer.preview.eventStart')}</p>
        </div>
        <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: hexValues["success"], color: hexValues["success-content"] }}>
          <Clock className="w-4 h-4" style={{ color: hexValues["success-content"] }}/>
          <p className="text-sm">{t('themeCustomizer.preview.coffeeBreak')}</p>
        </div>
        <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: hexValues["warning"], color: hexValues["warning-content"] }}>
          <Gift className="w-4 h-4" style={{ color: hexValues["warning-content"] }}/>
          <p className="text-sm">{t('themeCustomizer.preview.talkDelay')}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button className="btn btn-outline" style={{ backgroundColor: hexValues["secondary"], color: hexValues["secondary-content"]}}>{t('themeCustomizer.preview.eventSchedule')}</button>
        <button className="btn btn-outline">{t('themeCustomizer.preview.contactOrganizer')}</button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex border-b border-base-300 mb-6">
        <button
          className={`px-4 py-2 font-semibold text-sm border-b-2 ${
            activeTab === "colors"
              ? "border-primary text-primary"
              : "border-transparent hover:border-base-300"
          }`}
          onClick={() => setActiveTab("colors")}
          role="tab"
          aria-selected={activeTab === "colors"}
          aria-controls="colors-panel"
          id="colors-tab"
        >
          {t('themeCustomizer.tabs.colors')}
        </button>

        <button
          className={`px-4 py-2 font-semibold text-sm border-b-2 ${
            activeTab === "preview"
              ? "border-primary text-primary"
              : "border-transparent hover:border-base-300"
          }`}
          onClick={() => setActiveTab("preview")}
          role="tab"
          aria-selected={activeTab === "preview"}
          aria-controls="preview-panel"
          id="preview-tab"
        >
          {t('themeCustomizer.tabs.preview')}
        </button>
      </div>

      {/* Colors Panel */}
      <div
        id="colors-panel"
        role="tabpanel"
        aria-labelledby="colors-tab"
        className={activeTab === "colors" ? "" : "hidden"}
      >
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

      {/* Preview Panel */}
      <div
        id="preview-panel"
        role="tabpanel"
        aria-labelledby="preview-tab"
        className={activeTab === "preview" ? "" : "hidden"}
      >
        <div className="">
          <div className="">
            {renderPreview()}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <button
          className="btn btn-secondary rounded-xl"
          onClick={resetTheme}
          title={t('themeCustomizer.actions.resetTitle')}
        >
          {t('themeCustomizer.actions.reset')}
        </button>
        <button
          className="btn btn-primary rounded-xl"
          onClick={saveTheme}
        >
          {t('themeCustomizer.actions.save')}
        </button>
      </div>
    </>
  );
}
