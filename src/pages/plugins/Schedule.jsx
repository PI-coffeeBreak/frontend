import { useEffect, useRef, useState } from "react";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal.jsx";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import Activity from "../../components/common/Activity.jsx";
import { useActivities } from "../../contexts/ActivitiesContext.jsx";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import { FaCalendarAlt, FaChevronDown, FaChevronUp, FaSearch, FaTimes } from "react-icons/fa";
import { useEvent } from "../../contexts/EventContext";
import {t} from "i18next";

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

// Helper function to format a Date to ISO string without timezone conversion
const formatToLocalISOString = (date) => {
    return `${date.getFullYear()}-${
        String(date.getMonth() + 1).padStart(2, '0')
    }-${
        String(date.getDate()).padStart(2, '0')
    }T${
        String(date.getHours()).padStart(2, '0')
    }:${
        String(date.getMinutes()).padStart(2, '0')
    }:${
        String(date.getSeconds()).padStart(2, '0')
    }`;
};

export default function DragDropCalendar() {
    const calendarRef = useRef(null);
    const [activitiesCollapsed, setActivitiesCollapsed] = useState(false);
    const [activeFilter, setActiveFilter] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { eventInfo } = useEvent();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [activityToRemove, setActivityToRemove] = useState(null);

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
    }, []);

    useEffect(() => {
        if (activities.length > 0 && calendarRef.current) {
            // Use ref to track if draggable is initialized
            const draggableRef = { current: null };

            const timer = setTimeout(() => {
                // Only initialize if not already initialized
                if (!draggableRef.current) {
                    draggableRef.current = new Draggable(document.getElementById('draggable-activities'), {
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
                }
            }, 1000);

            return () => {
                clearTimeout(timer);
                if (draggableRef.current) {
                    draggableRef.current.destroy();
                    draggableRef.current = null;
                }
            };
        }
    }, [activities]);

    // Existing event handlers remain unchanged
    const handleEventReceive = async (info) => {
        const activityId = parseInt(info.event.extendedProps["data-id"]);
        const activity = findActivityById(activities, activityId);

        if (activity) {
            setCalendarActivities((prev) => [...prev, activity]);
            setOutsideActivities((prev) => prev.filter((act) => act.id !== activityId));

            // Create a localized ISO string that preserves the time exactly as displayed
            const startTime = info.event.start;
            const localISOString = formatToLocalISOString(startTime);

            await updateActivity(activityId, { date: localISOString });
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

        // Create a localized ISO string that preserves the time exactly as displayed
        const startTime = info.event.start;
        const localISOString = formatToLocalISOString(startTime);

        await updateActivity(activityId, { date: localISOString });

        setCalendarActivities((prev) =>
            prev.map((act) =>
                act.id === activityId ? { ...act, date: localISOString } : act
            )
        );
    };

    const handleEventClick = (info) => {
        const activityId = parseInt(info.event.extendedProps["data-id"]);
        const activityTitle = info.event.title;
        setActivityToRemove({ id: activityId, title: activityTitle, event: info.event });
        setDeleteModalOpen(true);
    };

    const confirmRemoveActivity = async () => {
        if (activityToRemove) {
            const { id, event } = activityToRemove;

            await updateActivity(id, { date: null });

            setCalendarActivities((prev) => prev.filter((act) => act.id !== id));
            setOutsideActivities((prev) => {
                const isAlreadyPresent = prev.some((act) => act.id === id);
                return isAlreadyPresent
                    ? prev
                    : [...prev, activities.find((act) => act.id === id)];
            });

            event.remove();
            setActivityToRemove(null);
            setDeleteModalOpen(false);
        }
    };

    useEffect(() => {
        if (calendarRef.current) {
            calendarRef.current.getApi().updateSize();
        }
    }, [activitiesCollapsed]);

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

    const [selectedType, setSelectedType] = useState("");

    const handleResetFilters = () => {
        setSelectedType("");
    };

    const filteredActivities = outsideActivities.filter(activity => {
        const matchesSearch = !searchQuery ||
            activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = !selectedType || activity.type_id.toString() === selectedType;

        return matchesSearch && matchesType;
    });

    // Calculate statistics
    const totalScheduledActivities = calendarActivities.length;
    const totalUnscheduledActivities = outsideActivities.length;
    const totalActivitiesDuration = calendarActivities.reduce((total, act) => total + (act.duration || 0), 0);
    const hours = Math.floor(totalActivitiesDuration / 60);
    const minutes = totalActivitiesDuration % 60;



    return (
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 h-[calc(100vh-64px)]">
            <div className="">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold my-8">Event Schedule</h1>
                    <button
                        onClick={toggleActivitiesPanel}
                        className="btn btn-sm btn-secondary rounded-xl"
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
                {/* Activities panel row */}
                <div className={`transition-all duration-300 bg-base-100 ${
                    activitiesCollapsed
                        ? "h-0"
                        : "flex flex-row w-full"
                }`}>
                    {/* Activities panel */}
                    <div
                        id="draggable-activities"
                        className="flex-grow w-0 overflow-y-auto"
                    >
                        <div className="mx-auto">
                            <div className="flex gap-4">
                                <div>
                                    <label className="input input-bordered w-full rounded-xl flex items-center gap-2">
                                        <FaSearch className="text-gray-400"/>
                                        <input
                                            type="text"
                                            className="grow"
                                            placeholder="Search activities"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </label>
                                </div>
                                <div className="filter">
                                    <select
                                        className="select select-bordered rounded-xl"
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {activityTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 gap-2 w-full">
                                    <div className="bg-secondary flex items-center pl-2 gap-2 rounded-xl">
                                        <h1 className="text-secondary-content  font-light">Scheduled</h1>
                                        <div className="text-secondary-content text-xl font-bold">{totalScheduledActivities}</div>
                                    </div>
                                    <div className="bg-secondary flex items-center pl-2 gap-2 rounded-xl">
                                        <h1 className="text-secondary-content  font-light">Unscheduled</h1>
                                        <div className="text-secondary-content text-xl font-bold">{totalUnscheduledActivities}</div>
                                    </div>
                                    <div className="bg-secondary flex items-center pl-2 gap-2 rounded-xl">
                                        <h1 className="text-secondary-content  font-light">Total Duration</h1>
                                        <div className="text-secondary-content text-xl font-bold">{hours}h {minutes}</div>
                                    </div>
                                </div>

                            </div>
                            <div className="flex-grow overflow-hidden">
                                {/* Horizontal scrolling container */}
                                <div className="overflow-x-auto pb-2 hide-scrollbar max-w-full">
                                    <div className="flex flex-row flex-nowrap mt-4 gap-2 w-max">
                                        {filteredActivities.map((activity) => (
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
                                                className="fc-event activity-card shrink-0"
                                                data-id={activity.id}
                                                data-title={activity.name}
                                                style={{ width: '180px' }}
                                            />
                                        ))}
                                        {filteredActivities.length === 0 && (
                                            <div className="min-w-full flex justify-center items-center py-12">
                                                <div className="text-center mx-auto">
                                                    <FaSearch className="mx-auto text-3xl text-gray-400 mb-4" />
                                                    <p className="text-xl text-gray-500">{t('activities.noActivities')}</p>
                                                    <p className="text-gray-400">{t('activities.trySearch')}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Calendar container */}
                <div className="flex-grow overflow-auto p-1">
                    <div className="h-full">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="timeGridWeek"
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "timeGridWeek,timeGridDay",
                            }}
                            height="100%"
                            editable={true}
                            droppable={true}
                            eventReceive={handleEventReceive}
                            eventDrop={handleEventDrop}
                            eventResize={handleEventResize}
                            eventClick={handleEventClick}
                            slotDuration={"00:15:00"}
                            slotLabelInterval={"00:30:00"}
                            slotMinTime="00:00:00"
                            slotMaxTime="24:00:00"
                            snapDuration={"00:01:00"}
                            allDaySlot={false}
                            dayMaxEvents={true}
                            nowIndicator={true}
                            scrollTime={new Date().getHours() + ":00:00"}
                            timeZone="local"
                            validRange={{
                                start: eventInfo?.start_time ? new Date(eventInfo.start_time) : undefined,
                                end: eventInfo?.end_time ? new Date(eventInfo.end_time) : undefined
                            }}
                            slotLabelFormat={{
                                hour: "2-digit",
                                minute: "2-digit",
                                meridiem: false,
                                hour12: false,
                            }}
                            eventTimeFormat={{
                                hour: "2-digit",
                                minute: "2-digit",
                                meridiem: false,
                                hour12: false,
                                timeZone: "local",
                            }}
                            forceEventDuration={true}
                            defaultTimedEventDuration={"00:30:00"}
                            events={calendarActivities.map((activity) => {
                                const startDate = new Date(activity.date);
                                const durationInMs = activity.duration * 60000;
                                const endDate = new Date(startDate.getTime() + durationInMs);

                                const activityType = activityTypes.find(type => type.id === activity.type_id);
                                const backgroundColor = activityType?.color || '#3788d8';

                                return {
                                    id: activity.id,
                                    title: activity.name,
                                    start: startDate,
                                    end: endDate,
                                    backgroundColor,
                                    borderColor: backgroundColor,
                                    textColor: '#ffffff',
                                    extendedProps: {
                                        "data-id": activity.id,
                                        "data-title": activity.name,
                                        "description": activity.description,
                                        "category": activity.topic
                                    },
                                };
                            })}
                        />
                    </div>
                </div>
            </div>
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmRemoveActivity}
                title={`Remove Activity`}
                message={`Are you sure you want to remove "${activityToRemove?.title}" from the schedule?`}
            />
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }
                .hide-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(0,0,0,0.2);
                    border-radius: 4px;
                }
                .hide-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                /* For Firefox */
                .hide-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0,0,0,0.2) transparent;
                }
                
                /* Prevent text selection in draggable activity cards */
                .fc-event, .activity-card {
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                }
            `}</style>
        </div>
    );
}
