import { useState, useEffect } from "react";
import { Save, RefreshCw, Undo, Calendar, Users, MapPin, Bell, Clock, Gift, Music, Camera } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeCustomizer() {
  const { theme, fetchThemeColors, updateThemeColors } = useTheme();
  
  const initialTheme = {
    "base-100": "#f3faff",
    "base-200": "#d6d6d3",
    "base-300": "#d6d6d3",
    "base-content": "#726d65",
    "primary": "#4f2b1d",
    "primary-content": "#f3faff",
    "secondary": "#c6baa2",
    "secondary-content": "#f1fbfb",
    "accent": "#faa275",
    "accent-content": "#f3fbf6",
    "neutral": "#caa751",
    "neutral-content": "#f3faff",
    "info": "#00b2dd",
    "info-content": "#f2fafd",
    "success": "#0cae00",
    "success-content": "#f5faf4",
    "warning": "#fbad00",
    "warning-content": "#221300",
    "error": "#ff1300",
    "error-content": "#fff6f4",
  }

  const [localTheme, setLocalTheme] = useState(initialTheme);
  const [originalTheme, setOriginalTheme] = useState(initialTheme);
  const [hexValues, setHexValues] = useState({});
  const [isApplied, setIsApplied] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");
  const [savedMessage, setSavedMessage] = useState(false);

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
      setOriginalTheme(theme);
      // Reset using the original theme from context
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
    setIsApplied(false);
  };

  const resetTheme = async () => {
    try {
      // Fetch latest theme from the server
      await fetchThemeColors();
      
      // The theme state will be updated by the useEffect that watches theme changes
      // This ensures we reset to the actual database values
      
      setIsApplied(false);
    } catch (error) {
      console.error("Error resetting theme:", error);
    }
  };

  const saveTheme = async () => {
    try {
      await updateThemeColors(hexValues);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
      setIsApplied(true);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  // User-friendly color names
  const colorMapping = {
    primary: "Main Brand Color",
    "primary-content": "Text on Main Color",
    secondary: "Secondary Brand Color",
    "secondary-content": "Text on Secondary Color",
    accent: "Accent Color (Highlights)",
    "accent-content": "Text on Accent Color",
    "base-100": "Background Color",
    "base-200": "Card Background",
    "base-300": "Border Color",
    "base-content": "Main Text Color",
    info: "Information Color",
    "info-content": "Text on Information Color",
    success: "Success Color",
    "success-content": "Text on Success Color",
    warning: "Warning Color",
    "warning-content": "Text on Warning Color",
    error: "Error Color",
    "error-content": "Text on Error Color",
    neutral: "Neutral Color",
    "neutral-content": "Text on Neutral Color",
  }

  // Group colors by type for better organization
  const colorGroups = {
    "Brand Colors": ["primary", "primary-content", "secondary", "secondary-content", "accent", "accent-content"],
    "Background & Text": ["base-100", "base-200", "base-300", "base-content"],
    "Status Colors": ["info", "success", "warning", "error"],
  }

  const renderPreview = () => (
    <div className="bg-base-100 p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-center mb-6" style={{ color: hexValues["base-content"] }}>TEDx Aveiro</h3>

      {/* Event Header */}
      <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: hexValues["primary"], color: hexValues["primary-content"] }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            <span className="font-bold">Talks</span>
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
              <h3 className="card-title" style={{ color: hexValues["base-content"] }}>Event Location</h3>
            </div>
            <p className="text-sm">Centro de Congressos de Aveiro</p>
            <p className="text-xs" style={{ color: hexValues["base-content"] }}>Cais da Fonte Nova, 3810-164 Aveiro</p>
          </div>
        </div>

        <div className="card shadow-sm" style={{ backgroundColor: hexValues["base-200"] }}>
          <div className="card-body p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" style={{ color: hexValues["primary"] }} />
              <h3 className="card-title" style={{ color: hexValues["base-content"] }}>Attendees</h3>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm">400 tickets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Artists */}
      <h4 className="font-semibold mb-3">Sponsors</h4>
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
      <h4 className="font-semibold mb-3">Event Updates</h4>
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: hexValues["info"], color: hexValues["info-content"] }}>
          <Bell className="w-4 h-4" style={{ color: hexValues["info"]}}/>
          <p className="text-sm">Event is about to start</p>
        </div>
        <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: hexValues["success"], color: hexValues["success-content"] }}>
          <Clock className="w-4 h-4" style={{ color: hexValues["success"] }}/>
          <p className="text-sm">Coffee Break in 10 minutes</p>
        </div>
        <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: hexValues["warning"], color: hexValues["warning-content"] }}>
          <Gift className="w-4 h-4" style={{ color: hexValues["warning"] }}/>
          <p className="text-sm">Talk x staring hour was delayed from 15:00 to 17:00</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button className="btn btn-outline" style={{ backgroundColor: hexValues["secondary"], color: hexValues["secondary-content"]}}>Event Schedule</button>
        <button className="btn btn-outline">Contact Organizer</button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-content">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Event Theme Designer</h2>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-circle btn-ghost text-primary-content"
                onClick={resetTheme}
                title="Reset to original theme"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button className="btn btn-sm btn-circle glass text-primary-content relative" onClick={saveTheme}>
                <Save className="w-4 h-4" />
                {savedMessage && (
                  <span className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                    Theme saved!
                  </span>
                )}
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm opacity-90">Customize your event's colors and see how they look in real-time</p>
        </div>

        {/* Tabs */}
        <div className="bg-base-200 px-6 pt-4">
          <div className="tabs tabs-boxed bg-base-300 inline-flex">
            <a className={`tab ${activeTab === "colors" ? "tab-active" : ""}`} onClick={() => setActiveTab("colors")}>
              Choose Colors
            </a>
            <a className={`tab ${activeTab === "preview" ? "tab-active" : ""}`} onClick={() => setActiveTab("preview")}>
              Preview Your Event
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-base-200 min-h-[500px]">
          {activeTab === "colors" ? (
            <div className="space-y-8">
              <div className="bg-base-100 p-4 rounded-lg shadow-sm">
                <p className="text-sm mb-4">
                  Click on any color below to change it. You'll see your changes in the "Preview Your Event" tab.
                </p>
              </div>

              {Object.entries(colorGroups).map(([groupName, colorKeys]) => (
                <div key={groupName} className="space-y-4">
                  <h3 className="font-semibold text-lg">{groupName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {colorKeys.map((key) => (
                      <div key={key} className="bg-base-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-lg shadow-inner border"
                            style={{ backgroundColor: hexValues[key] }}
                          ></div>
                          <div className="flex-1">
                            <label className="font-medium">{colorMapping[key] || key}</label>
                            <input
                              type="color"
                              value={hexValues[key] || "#000000"}
                              onChange={(e) => handleColorChange(key, e.target.value)}
                              className="w-full h-8 cursor-pointer mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            renderPreview()
          )}
        </div>
      </div>
    </div>
  );
}
