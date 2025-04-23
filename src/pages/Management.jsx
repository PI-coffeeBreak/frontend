import React, { useMemo } from 'react';
import { FaUsers, FaCalendarAlt, FaBell } from 'react-icons/fa';
import DashboardCard from '../components/DashboardCard';

export default function Management() {
    const cards = useMemo(() => [
        {
            id: 'users',
            title: "Users",
            description: "Manage user accounts, roles, and permissions. Add new users, edit existing ones, or control access to different features of your event.",
            icon: FaUsers,
            path: "users",
            color: "blue",
            buttonText: "Manage Users"
        },
        {
            id: 'sessions',
            title: "Sessions",
            description: "Schedule and organize event sessions, workshops, and activities. Control timing, locations, and participant registration for all event activities.",
            icon: FaCalendarAlt,
            path: "sessions",
            color: "purple",
            buttonText: "View Sessions"
        },
        {
            id: 'alerts',
            title: "Alerts",
            description: "Create and send notifications to event participants. Keep everyone informed about important updates, schedule changes, and announcements.",
            icon: FaBell,
            path: "alerts",
            color: "red",
            buttonText: "Manage Alerts"
        },
    ], []);

    return (
        <div className="w-full min-h-svh p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-primary">Management</h1>
                <p className="text-lg text-base-content/70 mb-8">Manage all aspects of your event through these administrative tools</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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