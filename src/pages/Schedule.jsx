import { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import Activity from "../components/Activity.jsx";

export default function DragDropCalendar() {
    const calendarRef = useRef(null);
    const draggableRef = useRef(null);

    useEffect(() => {
        if (typeof window !== "undefined" && calendarRef.current) {
            const timer = setTimeout(() => {
                const draggable = new Draggable(draggableRef.current, {
                    itemSelector: ".fc-event",
                    eventData: function(eventEl) {
                        return {
                            title: eventEl.getAttribute("data-title"),
                            duration: "02:00"
                        };
                    }
                });
                return () => draggable.destroy();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <div className="container mx-auto">
            <h3 className="font-bold mb-2">Atividades</h3>
            <div className="w-full grid grid-cols-3 gap-4 overflow-hidden" ref={draggableRef}>
                <Activity
                    title="Innovation and Technology: Shaping the Future"
                    description="Exploring how innovation and technology are transforming."
                    image="/12.jpg"
                    category="Technology"
                    type="Talk"
                />
                <Activity
                    title="AI and the Future of Work"
                    description="How artificial intelligence is reshaping job markets and skill requirements."
                    image="/13.jpg"
                    category="AI"
                    type="Workshop"
                />
                <Activity
                    title="Sustainable Tech Solutions"
                    description="Innovations driving a more sustainable and eco-friendly future."
                    image="/14.jpg"
                    category="Sustainability"
                    type="Lecture"
                />
                <Activity
                    title="The Future of Mobility"
                    description="Exploring the future of transportation and mobility."
                    image="/15.jpg"
                    category="Transportation"
                    type="Panel"
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