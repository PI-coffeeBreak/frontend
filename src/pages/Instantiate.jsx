import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaPalette,
    FaCogs,
    FaCalendarAlt,
    FaPuzzlePiece,
    FaUsers,
    FaBars,
    FaArrowRight,
    FaFile,
    FaRocket, FaCog
} from 'react-icons/fa';
import { useEvent } from '../contexts/EventContext';
import { useTranslation } from 'react-i18next';

export default function Instantiate() {
    const { t } = useTranslation();
    const { eventInfo, isLoading } = useEvent();

    

    // Add section cards with direct homepage links
    const sectionCards = [
        {
            id: 'management-card',
            title: t('instantiate.cards.management.title'),
            description: t('instantiate.cards.management.description'),
            icon: FaRocket,
            path: '/instantiate/event',
            color: 'bg-accent'
        },
        {
            id: 'event-maker-card',
            title: t('instantiate.cards.eventMaker.title'),
            description: t('instantiate.cards.eventMaker.description'),
            icon: FaCog,
            path: '/instantiate/application',
            color: 'bg-secondary'
        }
    ];


    return (
        <div className="w-full p-8">
            <div className="max-w-7xl mx-auto">
                {/* Hero section with event info */}
                <div className="flex flex-col lg:flex-row justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-primary">
                            {isLoading ? t('common.loading') : `${t('instantiate.welcome')} ${eventInfo?.name || t('event.defaultTitle')}`}
                        </h1>
                        <p className="text-lg text-base-content/70">
                            {t('instantiate.accessTools')}
                        </p>
                    </div>
                    
                    {/* Event date/time info */}
                    {eventInfo && (
                        <div className="mt-4 lg:mt-0 bg-base-200 p-3 rounded-lg">
                            <p className="text-sm">
                                <span className="font-medium">{t('instantiate.eventDate')}: </span>
                                {new Date(eventInfo.start_time).toLocaleDateString()} - {new Date(eventInfo.end_time).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>

                {/* App preview phone mockup */}
                <div className="mb-10 flex flex-col md:flex-row gap-6">
                    <div className="hidden sm:block md:w-1/2 flex justify-center">
                        <iframe
                            src="http://localhost:5175/app/"
                            className="w-2/3 h-[750px] border-0 rounded-lg shadow-lg"
                            title="Mobile App Preview"
                        ></iframe>
                    </div>
                    <div className="w-full md:w-1/2 flex justify-start flex-col gap-6">
                        {sectionCards.map(card => (
                            <Link
                                key={card.id}
                                to={card.path}
                                className="group card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <div className="card-body">
                                    <div className="flex justify-between items-center">
                                        <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                                            <card.icon className="text-white text-xl" />
                                        </div>
                                        <FaArrowRight className="text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                                    </div>
                                    <h2 className="card-title mt-4">{card.title}</h2>
                                    <p className="text-base-content/70">{card.description}</p>
                                    <div className="mt-4">
                        <span className="text-primary text-sm font-medium group-hover:underline">
                            {t('instantiate.openDashboard')}
                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>


            </div>
        </div>
    );
}