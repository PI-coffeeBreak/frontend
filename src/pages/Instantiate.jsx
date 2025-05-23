import {
    FaArrowRight,
    FaRocket, FaCog
} from 'react-icons/fa';
import React, { useEffect } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { useEvent } from '../contexts/EventContext';
import { useTranslation } from 'react-i18next';

export default function Instantiate() {
    const { t } = useTranslation();
    const { eventInfo ,isLoading } = useEvent();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && eventInfo === null) {
            navigate('/setup');
        }
    }, [isLoading, eventInfo, navigate]);
    

    // Add section cards with direct homepage links
    const sectionCards = [
        {
            id: 'event-card',
            title: t('instantiate.cards.event.title'),
            description: t('instantiate.cards.event.description'),
            icon: FaRocket,
            path: '/instantiate/event',
            color: 'bg-accent'
        },
        {
            id: 'application-card',
            title: t('instantiate.cards.application.title'),
            description: t('instantiate.cards.application.description'),
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
                            {isLoading ? t('common.actions.loading') : `${t('instantiate.welcome')} ${eventInfo?.name || t('event.defaultTitle')}`}
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

                {/* Get Started Now Section */}
                <div className="shadow-lg p-2 rounded-lg mt-8 mb-8">
                    <div className="collapse collapse-arrow bg-base-100">
                        <input type="checkbox" className="peer" /> 
                        <div className="collapse-title text-xl font-bold text-primary flex items-center gap-2">
                            <FaRocket className="text-primary" />
                            {t('instantiate.getStarted.title', 'Get Started Now')}
                        </div>
                        <div className="collapse-content">
                            <div className="flex items-center gap-2 mb-6">
                                <p className="text-base-content/70">
                                    {t('instantiate.getStarted.description', 'Follow these steps to set up your event platform. We recommend following this order to ensure a smooth configuration process.')}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="bg-base-200 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 group">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                                                    <span className="text-primary">1.</span>
                                                    {t('instantiate.getStarted.eventSetup.title', 'Event Setup')}
                                                </h3>
                                                <p className="text-base-content/70 mb-4">
                                                    {t('instantiate.getStarted.eventSetup.description', 'Start by configuring your event details, including name, dates, and location. This information will be used throughout your event platform.')}
                                                </p>
                                                <Link 
                                                    to="/instantiate/event/info" 
                                                    className="btn btn-primary btn-sm group-hover:btn-primary-focus transition-colors duration-200"
                                                >
                                                    {t('instantiate.getStarted.eventSetup.button', 'Configure Event')}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-base-200 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 group">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                                                    <span className="text-primary">2.</span>
                                                    {t('instantiate.getStarted.colors.title', 'Theme & Colors')}
                                                </h3>
                                                <p className="text-base-content/70 mb-4">
                                                    {t('instantiate.getStarted.colors.description', 'Customize your event\'s visual identity by choosing colors that match your brand. This will affect the entire platform\'s appearance.')}
                                                </p>
                                                <Link 
                                                    to="/instantiate/application/colors" 
                                                    className="btn btn-primary btn-sm group-hover:btn-primary-focus transition-colors duration-200"
                                                >
                                                    {t('instantiate.getStarted.colors.button', 'Customize Colors')}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-base-200 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 group">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                                                    <span className="text-primary">3.</span>
                                                    {t('instantiate.getStarted.pages.title', 'Create Pages')}
                                                </h3>
                                                <p className="text-base-content/70 mb-4">
                                                    {t('instantiate.getStarted.pages.description', 'Build your event\'s content by creating pages. Add information about your event, speakers, schedule, and more using our component-based editor.')}
                                                </p>
                                                <Link 
                                                    to="/instantiate/application/pages" 
                                                    className="btn btn-primary btn-sm group-hover:btn-primary-focus transition-colors duration-200"
                                                >
                                                    {t('instantiate.getStarted.pages.button', 'Manage Pages')}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-base-200 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 group">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                                                    <span className="text-primary">4.</span>
                                                    {t('instantiate.getStarted.menus.title', 'Configure Menus')}
                                                </h3>
                                                <p className="text-base-content/70 mb-4">
                                                    {t('instantiate.getStarted.menus.description', 'Organize your navigation by creating menus. Add links to your pages and external resources to help participants find information easily.')}
                                                </p>
                                                <Link 
                                                    to="/instantiate/application/menus" 
                                                    className="btn btn-primary btn-sm group-hover:btn-primary-focus transition-colors duration-200"
                                                >
                                                    {t('instantiate.getStarted.menus.button', 'Edit Menus')}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-base-200 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 group">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                                                    <span className="text-primary">5.</span>
                                                    {t('instantiate.getStarted.plugins.title', 'Add Plugins')}
                                                </h3>
                                                <p className="text-base-content/70 mb-4">
                                                    {t('instantiate.getStarted.plugins.description', 'Enhance your event with additional features. Choose from various plugins to add functionality like floor plans, feedback forms, and more.')}
                                                </p>
                                                <Link 
                                                    to="/instantiate/event/plugins" 
                                                    className="btn btn-primary btn-sm group-hover:btn-primary-focus transition-colors duration-200"
                                                >
                                                    {t('instantiate.getStarted.plugins.button', 'Manage Plugins')}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-base-200 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 group">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                                                    <span className="text-primary">6.</span>
                                                    {t('instantiate.getStarted.preview.title', 'Preview & Test')}
                                                </h3>
                                                <p className="text-base-content/70 mb-4">
                                                    {t('instantiate.getStarted.preview.description', 'Review your event platform from a participant\'s perspective. Test all features and ensure everything works as expected before launching.')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-10 gap-6">
                    {/* <div className="hidden sm:block md:w-1/2 flex justify-center">
                        <iframe
                            src=""
                            className="w-2/3 h-[750px] border-0 rounded-lg shadow-lg"
                            title="Mobile App Preview"
                        ></iframe>
                    </div> */}
                    <div className="w-full flex justify-start flex-col gap-6">
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