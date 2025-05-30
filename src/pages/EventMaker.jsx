import React, { useMemo } from 'react';
import { FaPalette, FaPuzzlePiece, FaEdit, FaBars, FaFileAlt } from 'react-icons/fa';
import DashboardCard from '../components/common/DashboardCard.jsx';
import { useTranslation } from 'react-i18next';

export default function EventMaker() {
    const { t } = useTranslation();
    
    const cards = useMemo(() => [
        {
            id: 'pages',
            title: t('eventMaker.cards.pages.title'),
            description: t('eventMaker.cards.pages.description'),
            icon: FaFileAlt,
            path: "/instantiate/application/pages",
            color: "emerald",
            buttonText: t('eventMaker.cards.pages.buttonText')
        },
        {
            id: 'menus',
            title: t('eventMaker.cards.menus.title'),
            description: t('eventMaker.cards.menus.description'),
            icon: FaBars,
            path: "/instantiate/application/menus",
            color: "cyan",
            buttonText: t('eventMaker.cards.menus.buttonText')
        },
        {
            id: 'colors',
            title: t('eventMaker.cards.colors.title'),
            description: t('eventMaker.cards.colors.description'),
            icon: FaPalette,
            path: "/instantiate/application/colors",
            color: "fuchsia",
            buttonText: t('eventMaker.cards.colors.buttonText')
        },
    ], [t]);

    return (
        <div className="w-full min-h-svh p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-primary">{t('eventMaker.title')}</h1>
                <p className="text-lg text-base-content/70 mb-8">{t('eventMaker.subtitle')}</p>
                
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