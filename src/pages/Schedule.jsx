import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import Activity from "../components/Activity.jsx";
import { baseUrl } from '../consts.js';

const activitiesBaseUrl = `${baseUrl}/activities`;
const activityTypesBaseUrl = `${baseUrl}/activity-types`;

export default function DragDropCalendar() {
    const calendarRef = useRef(null);
    const draggableRef = useRef(null);
    const [activityTypes, setActivityTypes] = useState([]);
    const [activities, setActivities] = useState([]);
    const [calendar_activities, setCalendarActivities] = useState([]);  // Activities already in the calendar
    const [outside_activities, setOutsideActivities] = useState([]);  // Activities not yet added to the calendar

    const fetchActivityTypes = async () => {
        const response = await fetch(activityTypesBaseUrl);
        const data = await response.json();
        console.log("Tipos de Atividades:", data);
        setActivityTypes(data);
    }

    const fetchActivities = async () => {
        const response = await fetch(activitiesBaseUrl);
        const data = await response.json();
        console.log("Atividades:", data);
        
        // Separate activities based on whether they already have a valid date
        const calendarEvents = data.filter(activity => activity.date && new Date(activity.date).getTime() > 0);
        const outsideEvents = data.filter(activity => !activity.date || new Date(activity.date).getTime() <= 0);
        
        setActivities(data);
        setCalendarActivities(calendarEvents);  // Activities with a valid date
        setOutsideActivities(outsideEvents);    // Activities without a valid date
    }

    useEffect(() => {
        fetchActivityTypes();
        fetchActivities();
    }, []);

    useEffect(() => {
        if (activities.length > 0 && calendarRef.current) {
            const timer = setTimeout(() => {
                const draggable = new Draggable(draggableRef.current, {
                    itemSelector: ".fc-event",
                    eventData: function(eventEl) {
                        const activityId = eventEl.getAttribute("data-id");
                        const activity = activities.find((activity) => activity.id === parseInt(activityId));
                
                        if (!activity) {
                            console.error("Activity not found for ID:", activityId);
                        }
                
                        return {
                            title: eventEl.getAttribute("data-title"),
                            duration: activity && activity.duration && activity.duration > 0
                                ? `${Math.floor(activity.duration / 60).toString().padStart(2, '0')}:${(activity.duration % 60).toString().padStart(2, '0')}` 
                                : "02:00",
                            "data-id": activityId,
                        };
                    }
                });
                return () => draggable.destroy();
            }, 1000);
    
            return () => clearTimeout(timer);
        }
    }, [activities]);

    const handleEventReceive = async (info) => {
        const activityId = parseInt(info.event.extendedProps["data-id"]);
        const activity = activities.find((activity) => activity.id === activityId);
        
        if (activity) {
            // Add the activity to the calendar_activities state
            setCalendarActivities((prev) => [...prev, activity]);
            // Remove the activity from outside_activities
            setOutsideActivities((prev) => prev.filter((act) => act.id !== activityId));
    
            const newStartTime = info.event.start.toISOString();
    
            const updatedActivity = {
                ...activity,
                date: newStartTime,  // Update the date with the new start time
            };
    
            try {
                // Send a PUT request to update the activity with the new date
                const response = await fetch(activitiesBaseUrl + `/${activityId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedActivity),
                });
    
                if (!response.ok) {
                    throw new Error('Failed to update activity');
                }
    
                console.log("Activity updated:", updatedActivity);
    
                fetchActivities();
    
            } catch (error) {
                console.error("Error updating activity:", error);
            }
        } else {
            console.error("Activity not found for ID:", activityId);
        }
    };    

    // Handle resizing event (when duration is changed by resizing the event)
    const handleEventResize = async (info) => {
        const activityId = parseInt(info.event.extendedProps["data-id"]);
        const activity = activities.find((activity) => activity.id === activityId);

        if (activity) {
            // Calculate new duration (in minutes) based on start and end times
            const newDuration = Math.round((info.event.end - info.event.start) / 60000);

            const updatedActivity = {
                ...activity,
                duration: newDuration,
            };

            try {
                // Send a PUT request to update the activity with the new duration
                const response = await fetch(activitiesBaseUrl + `/${activityId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedActivity),
                });

                if (!response.ok) {
                    throw new Error('Failed to update activity');
                }

                console.log("Activity duration updated:", updatedActivity);

                setCalendarActivities((prev) =>
                    prev.map((act) =>
                        act.id === activityId ? { ...act, duration: newDuration } : act
                    )
                );

            } catch (error) {
                console.error("Error updating activity:", error);
            }
        }
    };

    const handleEventDrop = async (info) => {
        const activityId = parseInt(info.event.extendedProps["data-id"]);
        const activity = activities.find((activity) => activity.id === activityId);
    
        if (activity) {
            // Create an updated activity with the new start time (from event drop)
            const updatedActivity = {
                ...activity,
                date: info.event.start.toISOString(),
            };
    
            try {
                // Send a PUT request to update the activity with the new date
                const response = await fetch(activitiesBaseUrl + `/${activityId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedActivity),
                });
    
                if (!response.ok) {
                    throw new Error('Failed to update activity');
                }
    
                console.log("Activity moved and updated:", updatedActivity);
    
                setCalendarActivities((prev) =>
                    prev.map((act) =>
                        act.id === activityId ? { ...act, date: updatedActivity.date } : act
                    )
                );
    
            } catch (error) {
                console.error("Error updating activity:", error);
            }
        }
    };
    

    const handleEventClick = async (info) => {
        if (confirm(`Remove activity "${info.event.title}" from the schedule?`)) {
            const activityId = parseInt(info.event.extendedProps["data-id"]);
            const activity = activities.find((activity) => activity.id === activityId);
    
            if (activity) {
                // Create an updated activity with date set to null
                const updatedActivity = {
                    ...activity,
                    date: null,
                };
    
                try {
                    // Send a PUT request to update the activity with the new date (null)
                    const response = await fetch(activitiesBaseUrl + `/${activityId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedActivity),  // Send the updated activity data
                    });
    
                    if (!response.ok) {
                        throw new Error('Failed to update activity');
                    }
    
                    console.log("Activity updated:", updatedActivity);
    
                    // Remove the activity from calendar_activities
                    setCalendarActivities((prev) => prev.filter((act) => act.id !== activityId));
    
                    setOutsideActivities((prev) => [...prev, activity]);
                    info.event.remove();
    
                    // Refetch activities
                    fetchActivities();
    
                } catch (error) {
                    console.error("Error updating activity:", error);
                }
            } else {
                console.error("Activity not found for ID:", activityId);
            }
        }
    };

    return (
        <div className="container mx-auto">
            <h3 className="font-bold mb-2">Atividades</h3>
            <div className="w-full grid grid-cols-3 gap-4 overflow-hidden" ref={draggableRef}>

                {/* Atividades (Outside Calendar) */}
                {outside_activities.map((activity, i) => (
                    <Activity
                        key={i}
                        id={activity.id}
                        title={activity.name}
                        description={activity.description}
                        image={activity.image}
                        category={activity.topic}
                        type={activityTypes.find(type => type.id === activity.type_id).type}
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
                    eventDrop={handleEventDrop}  // Handle event drop (dragging to a new time slot)
                    eventResize={handleEventResize}  // Handle event resize (changing duration)
                    eventClick={handleEventClick}
                    slotMinTime="08:00:00"
                    slotMaxTime="18:00:00"
                    allDaySlot={false}
                    events={calendar_activities.map((activity) => {
                        const durationInMs = activity.duration * 60000;  // Convert duration from minutes to milliseconds
                        const endTime = new Date(new Date(activity.date).getTime() + durationInMs); // Calculate the end time
                        
                        return {
                            id: activity.id,
                            title: activity.name,
                            start: activity.date,
                            end: endTime.toISOString(),  // Set the end time based on duration
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