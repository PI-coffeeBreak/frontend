import { useState } from "react";
import { ActivityList } from "../components/activities/ActivityList";
import { ActivityFilters } from "../components/activities/ActivityFilters";
import { CreateActivityCards } from "../components/activities/CreateActivityCards";
import { ExcelImportModal } from "../components/activities/ExcelImportModal";
import { NewSessionModal } from "../components/activities/NewSessionModal";
import { useActivities } from "../contexts/ActivitiesContext";
import { useNotification } from "../contexts/NotificationContext";
import { useKeycloak } from "@react-keycloak/web";
import { axiosWithAuth } from "../utils/axiosWithAuth";
import { baseUrl } from "../consts";

/**
 * Activities page component for managing event sessions and activities
 */
export default function Activities() {
  // Use the ActivitiesContext to access activities data and operations
  const { 
    activities, 
    activityTypes,
    fetchActivities,
    updateActivity,
    getActivityType // Using getActivityType function from context
  } = useActivities();

  // Use notification context for feedback messages
  const { showNotification } = useNotification();
  
  // Get keycloak for role/permission checks
  const { keycloak } = useKeycloak();

  // Check if user can create activities based on their roles
  const canCreateActivities = () => {
    if (!keycloak || !keycloak.authenticated) {
      return false;
    }
    
    const roles = keycloak.tokenParsed?.realm_access?.roles || [];
    const allowedRoles = ['cb-staff', 'cb-organizer', 'cb-customization'];
    
    return allowedRoles.some(role => roles.includes(role));
  };

  // Modal state
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Filter activities based on search term and selected type
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchQuery || 
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = !selectedType || activity.type_id.toString() === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Map activity data to include type name instead of just ID
  const mappedActivities = filteredActivities.map(activity => ({
    ...activity,
    type: getActivityType(activity.type_id) // Add type name using the getActivityType function
  }));

  // Handler for opening the Excel import modal
  const openExcelModal = () => setIsExcelModalOpen(true);
  
  // Handler for closing the Excel import modal
  const closeExcelModal = () => setIsExcelModalOpen(false);
  
  // Handler for opening the new session modal
  const openNewSessionModal = () => setIsNewSessionModalOpen(true);
  
  // Handler for closing the new session modal
  const closeNewSessionModal = () => setIsNewSessionModalOpen(false);

  /**
   * Handle importing activities from Excel
   * @param {FormData} formData - FormData containing the Excel file
   */
  const handleImportExcel = async (formData) => {
    try {
      const response = await axiosWithAuth(keycloak).post(`${baseUrl}/activities/batch`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Show success notification
      showNotification("Activities successfully imported", "success");
      
      // Refresh activities list
      fetchActivities();
      
      // Close the import modal
      closeExcelModal();
      
      return response.data;
    } catch (error) {
      console.error("Error importing activities:", error);
      showNotification(
        error.response?.data?.message || "Failed to import activities", 
        "error"
      );
      throw error;
    }
  };

  /**
   * Handle creating a new session/activity
   * @param {Object} sessionData - New session data
   */
  const handleCreateSession = async (sessionData) => {
    try {
      // Format data for API submission
      const payload = {
        name: sessionData.name,
        description: sessionData.description,
        // Rename date to start_time for the API
        start_time: sessionData.date,
        duration: parseInt(sessionData.duration, 10),
        type_id: typeof sessionData.type_id === 'string' 
          ? parseInt(sessionData.type_id, 10) 
          : sessionData.type_id,
        topic: sessionData.topic || "",
        speaker: sessionData.speaker || "",
        facilitator: sessionData.facilitator || ""
      };

      console.log("Sending activity data:", payload);
      
      let response;
      
      if (sessionData.image) {
        // If there's an image, we still need to use FormData
        const formData = new FormData();
        
        // Add the image file
        formData.append('image', sessionData.image);
        
        // Add the JSON data as a string in a field called 'data'
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
        
        response = await axiosWithAuth(keycloak).post(`${baseUrl}/activities`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // If no image, we can use JSON directly
        response = await axiosWithAuth(keycloak).post(`${baseUrl}/activities`, payload, {
          headers: { 
            'Content-Type': 'application/json'
          }
        });
      }
      
      // Show success notification
      showNotification("Session created successfully", "success");
      
      // Refresh activities list
      fetchActivities();
      
      // Close the session modal
      closeNewSessionModal();
      
      return response.data;
    } catch (error) {
      console.error("Error creating session:", error);
      
      // Handle different error formats
      if (error.response?.data?.detail) {
        // FastAPI validation error format
        const errorMessages = Array.isArray(error.response.data.detail) 
          ? error.response.data.detail.map(err => `${err.loc[1]}: ${err.msg}`).join(', ')
          : error.response.data.detail;
        showNotification(errorMessages, "error");
      } else {
        // Generic error message
        showNotification(
          error.response?.data?.message || "Failed to create session", 
          "error"
        );
      }
      throw error;
    }
  };

  return (
    <div className="w-full min-h-svh p-2 lg:p-8">
      <h1 className="text-3xl font-bold">Create Sessions</h1>

      {/* Action cards to create activities */}
      <CreateActivityCards 
        onOpenExcelModal={openExcelModal}
        onOpenNewSessionModal={openNewSessionModal}
        canCreateActivities={canCreateActivities()}
      />

      <h1 className="text-3xl font-bold mt-8">Sessions</h1>

      {/* Search and filter section */}
      <ActivityFilters
        activityTypes={activityTypes}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      {/* Activity list with mapped activities */}
      <ActivityList activities={mappedActivities} />

      {/* Import Excel modal */}
      <ExcelImportModal 
        isOpen={isExcelModalOpen}
        onClose={closeExcelModal}
        onImport={handleImportExcel}
      />

      {/* Create new session modal */}
      <NewSessionModal 
        isOpen={isNewSessionModalOpen}
        onClose={closeNewSessionModal}
        onSubmit={handleCreateSession}
      />
    </div>
  );
}