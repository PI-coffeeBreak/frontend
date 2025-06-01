import { useState } from "react";
import { useActivities } from "../../contexts/ActivitiesContext";
import { ActivityList } from "../../components/activities/ActivityList";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { baseUrl } from "../../consts";
import { FaRobot, FaSpinner } from "react-icons/fa";
import { useNotification } from "../../contexts/NotificationContext";

function ActivityClassification() {
    const { activities, activityTypes, fetchActivities } = useActivities();
    const [loadingId, setLoadingId] = useState(null);
    const [classifyingAll, setClassifyingAll] = useState(false);
    const { t } = useTranslation();
    const { showNotification } = useNotification();

    // Filter activities without a type
    const untypedActivities = activities.filter(a => !a.type_id);

    // Call the categorizer for a specific activity
    const handleCategorize = async (activityId) => {
        setLoadingId(activityId);
        try {
            await axios.get(`${baseUrl}/activity-classification-plugin/activity-classifications/${activityId}`);
            showNotification(t("Activity categorized successfully!"), "success");
            fetchActivities(); // Refresh the list
        } catch (err) {
            const errorMessage = err.response?.data?.message || t("Error categorizing activity.");
            showNotification(errorMessage, "error");
        }
        setLoadingId(null);
    };

    // Classify all untyped activities
    const handleClassifyAll = async () => {
        setClassifyingAll(true);
        try {
            await Promise.all(
                untypedActivities.map(activity =>
                    axios.get(`${baseUrl}/activity-classification-plugin/activity-classifications/${activity.id}`)
                )
            );
            showNotification(t("All activities categorized successfully!"), "success");
            fetchActivities();
        } catch (err) {
            const errorMessage = err.response?.data?.message || t("Error categorizing some activities.");
            showNotification(errorMessage, "error");
        }
        setClassifyingAll(false);
    };

    // Custom action renderer for ActivityList
    const renderAction = (activity) => (
        <button
            onClick={() => handleCategorize(activity.id)}
            disabled={loadingId === activity.id || classifyingAll}
            className={`btn btn-primary btn-sm rounded-xl ${
                loadingId === activity.id ? 'loading' : ''
            }`}
        >
            {loadingId === activity.id ? (
                <>
                    <FaSpinner className="animate-spin mr-2" />
                    {t("Categorizing...")}
                </>
            ) : (
                <>
                    <FaRobot className="mr-2" />
                    {t("Categorize")}
                </>
            )}
        </button>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">{t("Activity Classification")}</h2>
                    <p className="text-gray-600">
                        {t("Use AI to automatically categorize your activities based on their content.")}
                    </p>
                </div>

                {untypedActivities.length > 0 ? (
                    <>
                        <div className="flex justify-between items-center">
                            <div className="text-gray-600">
                                {t("Found")} {untypedActivities.length} {t("uncategorized activities")}
                            </div>
                            <button
                                onClick={handleClassifyAll}
                                disabled={classifyingAll}
                                className={`btn btn-primary rounded-xl ${
                                    classifyingAll ? 'loading' : ''
                                }`}
                            >
                                {classifyingAll ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        {t("Classifying all...")}
                                    </>
                                ) : (
                                    <>
                                        <FaRobot className="mr-2" />
                                        {t("Classify All")}
                                    </>
                                )}
                            </button>
                        </div>

                        <ActivityList
                            activities={untypedActivities}
                            activityTypes={activityTypes}
                            renderAction={renderAction}
                        />
                    </>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <FaRobot className="mx-auto text-4xl text-gray-400 mb-4" />
                        <p className="text-xl text-gray-600">{t("No uncategorized activities found")}</p>
                        <p className="text-gray-500 mt-2">{t("All your activities have been categorized")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ActivityClassification;