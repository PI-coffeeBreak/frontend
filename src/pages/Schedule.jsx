import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import Activity from "../components/Activity.jsx";
import { useActivities } from "../contexts/ActivitiesContext";
import { useNotification } from "../contexts/NotificationContext";
import { FaCalendarAlt, FaChevronDown, FaChevronUp, FaSearch, FaTimes } from "react-icons/fa";

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
    const [activeFilter, setActiveFilter] = useState(null); // Add a new state for the active filter
    const [searchQuery, setSearchQuery] = useState(''); // Add a new state for search query

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

    const handleFilterClick = (typeId) => {
        // If clicking the active filter or "All", clear the filter
        if (typeId === activeFilter || typeId === "all") {
            setActiveFilter(null);
        } else {
            setActiveFilter(typeId);
        }
    };

    // Filter the activities based on the active filter and search query
    const filteredActivities = outsideActivities
    .filter(activity => 
        (!activeFilter || activity.type_id === activeFilter) && 
        (!searchQuery || activity.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Calculate statistics
    const totalScheduledActivities = calendarActivities.length;
    const totalUnscheduledActivities = outsideActivities.length;
    const totalActivitiesDuration = calendarActivities.reduce((total, act) => total + (act.duration || 0), 0);
    const hours = Math.floor(totalActivitiesDuration / 60);
    const minutes = totalActivitiesDuration % 60;

    return (
        <div className="flex flex-col pt-8 h-[calc(100vh-64px)]">
            {/* Page header */}
            <div className="bg-base-100 py-2 px-4 shadow-sm border-b">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold flex items-center gap-2">
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
                {/* Activities panel row */}
                <div className={`transition-all duration-300 bg-base-100 border-b ${
                    activitiesCollapsed
                        ? "max-h-0 py-0 overflow-hidden"
                        : "flex flex-row w-full overflow-hidden py-1"
                }`}>
                    {/* Activities panel */}
                    <div 
                        id="draggable-activities"
                        className="flex-grow w-0 overflow-y-auto"
                    >
                        <div className="container mx-auto px-3">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-sm">Available Activities</h3>
                                <div className="flex gap-1 flex-wrap justify-end">
                                    <button 
                                        className={`btn btn-xs ${activeFilter === null ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => handleFilterClick("all")}
                                    >
                                        All
                                    </button>
                                    {activityTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            className={`btn btn-xs ${activeFilter === type.id ? 'ring-2 ring-offset-1' : ''}`}
                                            style={{ 
                                                backgroundColor: type.color || "inherit",
                                                opacity: activeFilter === null || activeFilter === type.id ? 1 : 0.6 
                                            }}
                                            onClick={() => handleFilterClick(type.id)}
                                        >
                                            {type.type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-2 flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        placeholder="Search activities..." 
                                        className="input input-sm input-bordered w-full pl-8" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <FaSearch className="absolute left-3 top-2.5 text-base-content/40" />
                                </div>
                                {searchQuery && (
                                    <button className="btn btn-sm btn-ghost" onClick={() => setSearchQuery('')}>
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                            <div className="flex-grow overflow-hidden">
                                {/* Horizontal scrolling container */}
                                <div className="overflow-x-auto pb-2 hide-scrollbar max-w-full">
                                    <div className="flex flex-row flex-nowrap gap-2 w-max">
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
                                            <div className="p-1 bg-base-200 rounded-lg text-center w-full">
                                                <p className="text-base-content/70 text-sm">
                                                    {activeFilter 
                                                        ? "No activities match the selected filter." 
                                                        : "No unscheduled activities available."}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Stats panel - unchanged */}
                    <div className="w-48 md:w-64 px-2 py-1 border-l flex flex-col justify-center bg-base-200">
                        <h3 className="font-bold text-xs mb-1">Statistics</h3>
                        <div className="flex flex-col gap-2">
                            <div className="stat p-0">
                                <div className="stat-title text-xs">Scheduled</div>
                                <div className="stat-value text-sm">{totalScheduledActivities}</div>
                            </div>
                            <div className="stat p-0">
                                <div className="stat-title text-xs">Unscheduled</div>
                                <div className="stat-value text-sm">{totalUnscheduledActivities}</div>
                            </div>
                            <div className="stat p-0">
                                <div className="stat-title text-xs">Total Duration</div>
                                <div className="stat-value text-sm">{hours}h {minutes}m</div>
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
                            scrollTime={new Date().getHours() + ":00:00"} // Scroll to current hour
                            timeZone="local"
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