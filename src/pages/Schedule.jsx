import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import Activity from "../components/Activity.jsx";

export default function DragDropCalendar() {
    const calendarRef = useRef(null);
    const draggableRef = useRef(null);
    const [activity_types, setActivityTypes] = useState([]);
    const [activities, setActivities] = useState([]);
    const [calendar_activities, setCalendarActivities] = useState([]);  // Store activities added to the calendar
    const [outside_activities, setOutsideActivities] = useState([]);  // Store activities not yet added to the calendar

    const fetchActivityTypes = async () => {
        const response = await fetch('http://localhost:8000/activity-types/');
        const data = await response.json();
        console.log("Tipos de Atividades:", data);
        setActivityTypes(data);
    }

    const fetchActivities = async () => {
        const response = await fetch('http://localhost:8000/activities/');
        const data = await response.json();
        console.log("Atividades:", data);
        setActivities(data);
        setOutsideActivities(data);
    }

    useEffect(() => {
        fetchActivityTypes();
        fetchActivities();
    }, []);

    useEffect(() => {
        console.log("Fetched Activities:", activities);
        if (activities.length > 0 && calendarRef.current) {
            const timer = setTimeout(() => {
                const draggable = new Draggable(draggableRef.current, {
                    itemSelector: ".fc-event",
                    eventData: function(eventEl) {
                        const activityId = eventEl.getAttribute("data-id");
                        console.log("ID da Atividade:", activityId);
                        
                        const activity = activities.find((activity) => activity.id === parseInt(activityId));
                        console.log("Evento Arrastado:", activity);
                
                        if (!activity) {
                            console.error("Activity not found for ID:", activityId);  // Error if activity is undefined
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


    const handleEventReceive = (info) => {
        const activityId = parseInt(info.event.extendedProps["data-id"]);
        const activity = activities.find((activity) => activity.id === activityId);
        console.log("Evento Recebido:", info.event.title);
        console.log("ID da Atividade:", activityId);
        console.log("Atividade:", activity);

        if (activity) {
            // Add the activity to the calendar_activities state
            setCalendarActivities((prev) => [...prev, activity]);
            // Remove the activity from outside_activities
            setOutsideActivities((prev) => prev.filter((act) => act.id !== activityId));
            console.log("Evento Adicionado:", info.event.title);
        }
    };

    const handleEventClick = (info) => {
        if (confirm(`Remover a atividade "${info.event.title}" do calendário?`)) {
            // Remove from calendar_activities when event is removed
            const activityId = parseInt(info.event.extendedProps["data-id"]);
            setCalendarActivities((prev) => prev.filter((act) => act.id !== activityId));
            // Optionally, add back to outside_activities if you want
            const activity = activities.find((activity) => activity.id === activityId);
            if (activity) {
                setOutsideActivities((prev) => [...prev, activity]);
            }
            info.event.remove();
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
                        type={activity_types.find(type => type.id === activity.type_id).type}
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
                    eventClick={handleEventClick}
                    slotMinTime="08:00:00"
                    slotMaxTime="18:00:00"
                    allDaySlot={false}
                />
            </div>
        </div>
    );
}