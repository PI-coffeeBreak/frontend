import React, { useMemo } from 'react';
import { useTranslation } from "react-i18next";
import { FaUsers, FaCalendarCheck, FaBell } from 'react-icons/fa';
import DashboardCard from '../components/common/DashboardCard.jsx';

export default function InstantiateHome() {
    const { t } = useTranslation();

    const cards = useMemo(() => [
        {
            id: 'users',
            title: t('menu.sections.home.links.users'),
            description: t('menu.sections.home.descriptions.users'),
            icon: FaUsers,
            path: "users",
            color: "primary",
            buttonText: t('menu.sections.home.buttons.users')
        },
        {
            id: 'sessions',
            title: t('menu.sections.home.links.sessions'),
            description: t('menu.sections.home.descriptions.sessions'),
            icon: FaCalendarCheck,
            path: "sessions",
            color: "secondary",
            buttonText: t('menu.sections.home.buttons.sessions')
        },
        {
            id: 'alerts',
            title: t('menu.sections.home.links.alerts'),
            description: t('menu.sections.home.descriptions.alerts'),
            icon: FaBell,
            path: "alerts",
            color: "accent",
            buttonText: t('menu.sections.home.buttons.alerts')
        }
    ], [t]);

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