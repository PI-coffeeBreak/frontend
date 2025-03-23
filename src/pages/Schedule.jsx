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
    }

    useEffect(() => {
        fetchActivityTypes();
        fetchActivities();
    }
    , []);

    useEffect(() => {
        console.log("Fetched Activities:", activities);
        if (activities.length > 0 && calendarRef.current) {
          const timer = setTimeout(() => {
            const draggable = new Draggable(draggableRef.current, {
              itemSelector: ".fc-event",
              eventData: function(eventEl) {
                const activityId = eventEl.getAttribute("data-id");
                console.log("ID da Atividade:", activityId);
                
                // Check if activities are populated correctly before calling find
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

                };
              }
            });
            return () => draggable.destroy();
          }, 1000);
      
          return () => clearTimeout(timer);
        }
      }, [activities]);
      

    return (
        <div className="container mx-auto">
            <h3 className="font-bold mb-2">Atividades</h3>
            <div className="w-full grid grid-cols-3 gap-4 overflow-hidden" ref={draggableRef}>

                {/* Atividades */}

                {activities.map((activity, i) => (
                    <Activity
                        key={i}
                        id={activity.id}
                        title={activity.name}
                        description={activity.description}
                        image={activity.image}
                        category={activity.topic}
                        // find activity type name by id
                        type={activity_types.find(type => type.id === activity.type_id).type}
                    />
                ))}
                <Activity
                    title="AI and the Future of Work"
                    description="How artificial intelligence is reshaping job markets and skill requirements."
                    image="/13.jpg"
                    category="AI"
                    type="Workshop"
                />

            </div>
            <div className="w-full lg:w-3/4 overflow-auto">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    editable={true}
                    droppable={true}
                    eventReceive={(info) => {
                        if (!info.event.extendedProps.added) {
                            info.event.setExtendedProp("added", true);
                        } else {
                            info.revert();
                            return;
                        }
                        console.log("Evento Adicionado:", info.event.title);
                    }}
                    eventClick={(info) => {
                        if (confirm(`Remover a atividade \"${info.event.title}\" do calendário?`)) {
                            info.event.remove();
                        }
                    }}
                    slotMinTime="08:00:00"
                    slotMaxTime="18:00:00"
                    allDaySlot={false}
                />
            </div>
        </div>
    );
}