import React, { useMemo } from 'react';
import { FaUsers, FaCalendarAlt, FaBell } from 'react-icons/fa';
import DashboardCard from '../components/common/DashboardCard.jsx';
import { useTranslation } from 'react-i18next';

export default function Management() {
    const { t } = useTranslation();
    
    const cards = useMemo(() => [
        {
            id: 'users',
            title: t('management.cards.users.title'),
            description: t('management.cards.users.description'),
            icon: FaUsers,
            path: "users",
            color: "blue",
            buttonText: t('management.cards.users.buttonText')
        },
        {
            id: 'sessions',
            title: t('management.cards.sessions.title'),
            description: t('management.cards.sessions.description'),
            icon: FaCalendarAlt,
            path: "sessions",
            color: "purple",
            buttonText: t('management.cards.sessions.buttonText')
        },
    ], [t]);

    return (
        <div className="w-full min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-primary">{t('management.title')}</h1>
                <p className="text-lg text-base-content/70 mb-8">{t('management.subtitle')}</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
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