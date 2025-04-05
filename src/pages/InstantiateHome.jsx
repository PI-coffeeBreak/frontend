import React, { useMemo } from 'react';
import { FaUsers, FaCalendarCheck, FaBell } from 'react-icons/fa';
import DashboardCard from '../components/DashboardCard';

export default function InstantiateHome() {
    const cards = useMemo(() => [
        {
            id: 'users',
            title: "Users",
            description: "Manage your event's participants, speakers, and staff. View profiles, assign roles, and handle user permissions all in one place.",
            icon: FaUsers,
            path: "users",
            color: "primary",
            buttonText: "Manage Users"
        },
        {
            id: 'sessions',
            title: "Sessions",
            description: "Create and organize event sessions, workshops, and activities. Schedule timings and assign speakers to create the perfect agenda.",
            icon: FaCalendarCheck,
            path: "sessions",
            color: "secondary",
            buttonText: "Manage Sessions"
        },
        {
            id: 'alerts',
            title: "Alerts",
            description: "Keep your attendees informed with real-time notifications. Send important updates, reminders, and announcements throughout your event.",
            icon: FaBell,
            path: "alerts",
            color: "accent",
            buttonText: "Manage Alerts"
        }
    ], []);

    return (
        <div className="w-full min-h-svh p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-primary">Event Dashboard</h1>
                <p className="text-lg text-base-content/70 mb-12">Monitor and manage all aspects of your event from one central location</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card) => (
                        <DashboardCard
                            key={card.id}
                            {...card}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}