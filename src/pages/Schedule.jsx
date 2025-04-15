import { useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import Activity from "../components/Activity.jsx";
import { useActivities } from "../contexts/ActivitiesContext";
import { useNotification } from "../contexts/NotificationContext";

// Helper function to find an activity by ID
const findActivityById = (activities, activityId) => {
    const activity = activities.find((activity) => activity.id === parseInt(activityId));
    if (!activity) {
        console.error("Activity not found for ID:", activityId);
    }
    return activity;
};

// Helper function to format the duration
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

    const {
        activities,
        activityTypes,
        calendarActivities,
        outsideActivities,
        fetchActivities,
        fetchActivityTypes,
        updateActivity,
        setCalendarActivities,
        setOutsideActivities,
    } = useActivities();

    const { showNotification } = useNotification();

    useEffect(() => {
        fetchActivityTypes();
        fetchActivities();
    }, []);

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
                setOutsideActivities(prev => prev.filter(activity => activity.id !== parseInt(id)));
                showNotification("Activity deleted successfully", "success");
            } catch (error) {
                showNotification("Failed to delete activity", "error");
            }
        }
    };

    return (
        <div className="container mx-auto">
            <h3 className="font-bold mb-2">Atividades</h3>
            <div className="w-full grid grid-cols-3 gap-4 overflow-hidden" ref={draggableRef}>
                {/* Atividades (Outside Calendar) */}
                {outsideActivities.map((activity) => (
                    <Activity
                        key={activity.id} // Use the unique `id` property as the key
                        id={activity.id}
                        title={activity.name}
                        description={activity.description}
                        image={activity.image}
                        category={activity.topic}
                        type={activityTypes.find((type) => type.id === activity.type_id)?.type}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
            <div className="w-full lg:w-3/4 overflow-auto">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    editable={true}
                    droppable={true}
                    eventReceive={handleEventReceive}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    eventClick={handleEventClick}
                    slotMinTime="08:00:00"
                    slotMaxTime="18:00:00"
                    allDaySlot={false}
                    events={calendarActivities.map((activity) => {
                        const durationInMs = activity.duration * 60000; // Convert duration from minutes to milliseconds
                        const endTime = new Date(
                            new Date(activity.date).getTime() + durationInMs
                        ); // Calculate the end time

                        return {
                            id: activity.id,
                            title: activity.name,
                            start: activity.date,
                            end: endTime.toISOString(), // Set the end time based on duration
                            extendedProps: {
                                "data-id": activity.id,
                                "data-title": activity.name,
                            },
                        };
                    })}
                />
            </div>
        </div>
    );
}