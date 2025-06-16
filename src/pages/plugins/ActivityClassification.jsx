import { useState } from "react";
import { useActivities } from "../../contexts/ActivitiesContext";
import { ActivityList } from "../../components/activities/ActivityList";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { baseUrl } from "../../consts";
import { FaRobot, FaSpinner } from "react-icons/fa";
import { useNotification } from "../../contexts/NotificationContext";
import { axiosWithAuth } from "../../utils/axiosWithAuth";
import { useKeycloak } from "@react-keycloak/web";
import { Modal } from "../../components/common/Modal";

function ActivityClassification() {
    const { activities, activityTypes, fetchActivities } = useActivities();
    const [loadingId, setLoadingId] = useState(null);
    const [classifyingAll, setClassifyingAll] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [classificationResults, setClassificationResults] = useState(null);
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const { keycloak } = useKeycloak();

    // Filter activities without a type
    const untypedActivities = activities.filter(a => !a.type_id);

    // Call the categorizer for a specific activity
    const handleCategorize = async (activityId) => {
        setLoadingId(activityId);
        try {
            await axiosWithAuth(keycloak).get(`${baseUrl}/activity-classification/${activityId}`);
            showNotification(t("Activity categorized successfully!"), "success");
            fetchActivities(); // Refresh the list
        } catch (err) {
            const errorMessage = err.response?.data?.message || t("Error categorizing activity.");
            showNotification(errorMessage, "error");
        }
        setLoadingId(null);
    };

    // Polling helper
    const pollStatus = async (taskId, onDone, onError) => {
        let attempts = 0;
        const maxAttempts = 60; // 2 minutes
        const poll = async () => {
            try {
                const response = await axiosWithAuth(keycloak).get(`${baseUrl}/activity-classification/status/${taskId}`);
                if (response.data.status === "done") {
                    onDone(response.data.result);
                } else if (response.data.status === "error") {
                    onError(response.data.error || t("Error during classification."));
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(poll, 2000);
                } else {
                    onError(t("Classification timed out."));
                }
            } catch (err) {
                onError(err.response?.data?.detail || t("Error checking classification status."));
            }
        };
        poll();
    };

    // Classify all untyped activities (background task)
    const handleClassifyAll = async () => {
        setClassifyingAll(true);
        setClassificationResults(null);
        try {
            // Start the background task
            const triggerResponse = await axiosWithAuth(keycloak).post(`${baseUrl}/activity-classification/trigger`);
            const taskId = triggerResponse.data.task_id;
            // Poll for status
            pollStatus(
                taskId,
                (result) => {
                    setClassificationResults(result);
                    setShowModal(true);
                    showNotification(t("All activities categorized successfully!"), "success");
                    fetchActivities();
                    setClassifyingAll(false);
                },
                (errorMsg) => {
                    showNotification(errorMsg, "error");
                    setClassifyingAll(false);
                }
            );
        } catch (err) {
            const errorMessage = err.response?.data?.message || t("Error starting classification task.");
            showNotification(errorMessage, "error");
            setClassifyingAll(false);
        }
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
            <Modal
                isOpen={showModal || classifyingAll}
                onClose={() => setShowModal(false)}
                title={classifyingAll ? t("Classifying all...") : t("Classification Results")}
                description={classifyingAll ? t("Please wait while activities are being classified. This may take a moment.") : t("The following activities were mapped to each type:")}
            >
                {classifyingAll ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <FaSpinner className="animate-spin text-3xl mb-4 text-primary" />
                        <span className="text-gray-600">{t("Classifying all activities. Please wait...")}</span>
                    </div>
                ) : classificationResults && Object.keys(classificationResults).length > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(classificationResults).map(([type, acts]) => (
                            <div key={type}>
                                <div className="font-bold text-primary mb-2">{type}</div>
                                <ul className="list-disc ml-6">
                                    {acts.map((act) => (
                                        <li key={act.activity_id} className="text-gray-700">
                                            {act.activity_name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500">{t("No activities were classified.")}</div>
                )}
            </Modal>
        </div>
    );
}

export default ActivityClassification;