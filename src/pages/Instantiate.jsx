import React from 'react';
import { Link } from 'react-router-dom';
import { FaPalette, FaCogs, FaCalendarAlt, FaPuzzlePiece, FaUsers, FaBars, FaArrowRight, FaFile } from 'react-icons/fa';
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
            icon: FaCogs,
            path: 'management',
            color: 'bg-blue-500'
        },
        {
            id: 'event-maker-card',
            title: t('instantiate.cards.eventMaker.title'),
            description: t('instantiate.cards.eventMaker.description'),
            icon: FaPalette,
            path: 'eventmaker',
            color: 'bg-purple-500'
        }
    ];

    const quickLinks = [
        {
            id: 'management',
            title: t('menu.sections.management.title'),
            description: t('menu.sections.management.description'),
            icon: FaCogs,
            path: 'management',
            links: [
                { label: t('menu.sections.management.links.users'), path: 'management/users', icon: FaUsers },
                { label: t('menu.sections.management.links.sessions'), path: 'management/sessions', icon: FaCalendarAlt },
            ]
        },
        {
            id: 'event-maker',
            title: t('menu.sections.eventMaker.title'),
            description: t('menu.sections.eventMaker.description'),
            icon: FaPalette,
            path: 'eventmaker',
            links: [
                { label: t('menu.sections.eventMaker.links.colors'), path: 'eventmaker/colors', icon: FaPalette },
                { label: t('menu.sections.eventMaker.links.eventInfo'), path: 'eventmaker/edit', icon: FaCogs },
                { label: t('menu.sections.eventMaker.links.menus'), path: 'eventmaker/menus', icon: FaBars },
                { label: t('menu.sections.eventMaker.links.pages'), path: 'eventmaker/pages', icon: FaFile },
                { label: t('menu.sections.eventMaker.links.plugins'), path: 'eventmaker/choose-plugins', icon: FaPuzzlePiece }
            ]
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

                {/* Main Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
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

                <div className="flex flex-col gap-12">
                    {/* Quick access links */}
                    <div className="w-full">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            <FaCogs className="text-primary" /> {t('instantiate.quickAccess')}
                        </h2>
                        <div className="grid gap-6">
                            {quickLinks.map((section) => (
                                <div key={section.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                                    <div className="card-body">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <section.icon className="text-2xl text-primary" />
                                                <h2 className="card-title">{section.title}</h2>
                                            </div>
                                            {/* Section homepage link */}
                                            <Link 
                                                to={section.path} 
                                                className="btn btn-sm btn-ghost"
                                                title={`View ${section.title} Dashboard`}
                                            >
                                                <FaArrowRight />
                                            </Link>
                                        </div>
                                        <p className="text-base-content/70 mb-4">{section.description}</p>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {section.links.map((link) => (
                                                <Link
                                                    key={link.path}
                                                    to={link.path}
                                                    className="flex items-center gap-3 p-3 rounded-lg bg-base-200 hover:bg-primary/10 transition-colors"
                                                >
                                                    <link.icon className="text-xl text-primary" />
                                                    <span>{link.label}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}