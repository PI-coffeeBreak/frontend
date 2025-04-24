import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import Activity from "../components/Activity.jsx";
import { useActivities } from "../contexts/ActivitiesContext";
import { useNotification } from "../contexts/NotificationContext";
import { FaCalendarAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";

// Helper functions remain unchanged
const findActivityById = (activities, activityId) => {
    const activity = activities.find((activity) => activity.id === parseInt(activityId));
    if (!activity) {
        console.error("Activity not found for ID:", activityId);
    }
    return activity;
};

const formatDuration = (duration) => {
    if (duration > 0) {
        const hours = Math.floor(duration / 60).toString().padStart(2, "0");
        const minutes = (duration % 60).toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    }
    return "02:00"; // Default duration
};

export default function DragDropCalendar() {
    const calendarRef = useRef(null);
    const draggableRef = useRef(null);
    const [activitiesCollapsed, setActivitiesCollapsed] = useState(false);

    const {
        activities,
        activityTypes,
        calendarActivities,
        outsideActivities,
        fetchActivities,
        fetchActivityTypes,
        updateActivity,
        deleteActivity, // Added this since it's used in handleDelete
        setCalendarActivities,
        setOutsideActivities,
    } = useActivities();

    const { showNotification } = useNotification();

    // Existing useEffects remain unchanged
    useEffect(() => {
        fetchActivityTypes();
        fetchActivities();
    }, [fetchActivityTypes, fetchActivities]);

    useEffect(() => {
        if (activities.length > 0 && calendarRef.current) {
            const timer = setTimeout(() => {
                const draggable = new Draggable(draggableRef.current, {
                    itemSelector: ".fc-event",
                    eventData: function (eventEl) {
                        const activityId = eventEl.getAttribute("data-id");
                        const activity = findActivityById(activities, activityId);

                        return {
                            title: eventEl.getAttribute("data-title"),
                            duration: formatDuration(activity?.duration || 0),
                            "data-id": activityId,
                        };
                    },
                });
                return () => draggable.destroy();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [activities]);

    // Existing event handlers remain unchanged
    const handleEventReceive = async (info) => {
        const activityId = parseInt(info.event.extendedProps["data-id"]);
        const activity = findActivityById(activities, activityId);

        if (activity) {
            setCalendarActivities((prev) => [...prev, activity]);
            setOutsideActivities((prev) => prev.filter((act) => act.id !== activityId));

            const newStartTime = info.event.start.toISOString();

            await updateActivity(activityId, { date: newStartTime });
        }
    };

    const handleEventResize = async (info) => {
        const activityId = parseInt(info.event.extendedProps["data-id"]);
        const newDuration = Math.round((info.event.end - info.event.start) / 60000);

        await updateActivity(activityId, { duration: newDuration });

        setCalendarActivities((prev) =>
            prev.map((act) =>
                act.id === activityId ? { ...act, duration: newDuration } : act
            )
        );
    };

    const handleEventDrop = async (info) => {
        const activityId = parseInt(info.event.extendedProps["data-id"]);
        const newStartTime = info.event.start.toISOString();

        await updateActivity(activityId, { date: newStartTime });

        setCalendarActivities((prev) =>
            prev.map((act) =>
                act.id === activityId ? { ...act, date: newStartTime } : act
            )
        );
    };

    const handleEventClick = async (info) => {
        if (confirm(`Remove activity "${info.event.title}" from the schedule?`)) {
            const activityId = parseInt(info.event.extendedProps["data-id"]);

            await updateActivity(activityId, { date: null });

            setCalendarActivities((prev) => prev.filter((act) => act.id !== activityId));
            setOutsideActivities((prev) => [
                ...prev,
                activities.find((act) => act.id === activityId),
            ]);

            info.event.remove();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this activity?")) {
            try {
                await deleteActivity(id);
                setOutsideActivities((prev) =>
                    prev.filter((activity) => activity.id !== parseInt(id))
                );
                showNotification("Activity deleted successfully", "success");
            } catch (error) {
                showNotification("Failed to delete activity", "error");
                console.error("Error deleting activity:", error);
            }
        }
    };

    // Toggle activities panel collapse state
    const toggleActivitiesPanel = () => {
        setActivitiesCollapsed(!activitiesCollapsed);
    };

    return (
        <div className="flex flex-col pt-8 h-[calc(100vh-64px)]">
            {/* Page header */}
            <div className="bg-base-100 p-4 shadow-sm border-b">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FaCalendarAlt className="text-primary" />
                        Event Schedule
                    </h1>
                    <button
                        onClick={toggleActivitiesPanel}
                        className="btn btn-sm btn-outline"
                    >
                        {activitiesCollapsed ? "Show Activities" : "Hide Activities"}
                        {activitiesCollapsed ? (
                            <FaChevronDown className="ml-2" />
                        ) : (
                            <FaChevronUp className="ml-2" />
                        )}
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col flex-grow overflow-hidden">
                {/* Activities panel - collapsible */}
                <div
                    className={`transition-all duration-300 bg-base-100 border-b ${
                        activitiesCollapsed
                            ? "max-h-0 py-0 overflow-hidden"
                            : "max-h-[40vh] overflow-y-auto py-4"
                    }`}
                    ref={draggableRef}
                >
                    <div className="container mx-auto px-4">
                        <h3 className="font-bold mb-4 text-lg">Available Activities</h3>
                        <div className="flex flex-grow gap-4 flex-wrap">
                            {/* Activities outside calendar */}
                            {outsideActivities.map((activity) => (
                                <Activity
                                    key={activity.id}
                                    id={activity.id}
                                    title={activity.name}
                                    description={activity.description}
                                    image={activity.image}
                                    category={activity.topic}
                                    type={activityTypes.find(
                                        (type) => type.id === activity.type_id
                                    )?.type}
                                    onDelete={handleDelete}
                                />
                            ))}
                            {outsideActivities.length === 0 && (
                                <div className="p-4 bg-base-200 rounded-lg text-center col-span-full">
                                    <p className="text-base-content/70">
                                        No unscheduled activities available.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Calendar - takes remaining height */}
                <div className="flex-grow overflow-auto p-4">
                    <div className="h-full">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="timeGridWeek"
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "dayGridMonth,timeGridWeek,timeGridDay",
                            }}
                            height="100%"
                            editable={true}
                            droppable={true}
                            eventReceive={handleEventReceive}
                            eventDrop={handleEventDrop}
                            eventResize={handleEventResize}
                            eventClick={handleEventClick}
                            slotDuration={"00:15:00"}
                            slotLabelInterval={"01:00:00"}
                            slotMinTime="00:00:00"
                            slotMaxTime="24:00:00"
                            allDaySlot={false}
                            eventTimeFormat={{
                                hour: "2-digit",
                                minute: "2-digit",
                                meridiem: false,
                                hour12: false,
                            }}
                            events={calendarActivities.map((activity) => {
                                const durationInMs = activity.duration * 60000;
                                const endTime = new Date(
                                    new Date(activity.date).getTime() + durationInMs
                                );

                                return {
                                    id: activity.id,
                                    title: activity.name,
                                    start: activity.date,
                                    end: endTime.toISOString(),
                                    extendedProps: {
                                        "data-id": activity.id,
                                        "data-title": activity.name,
                                    },
                                };
                            })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}