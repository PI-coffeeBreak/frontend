import {
    FaRocket,
    FaCheckCircle,
} from 'react-icons/fa';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'instantiate_completed_steps';

export default function GetStarted() {
    const { t } = useTranslation();
    const [completedSteps, setCompletedSteps] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });
    const [isExpanded, setIsExpanded] = useState(() => {
        const saved = localStorage.getItem('instantiate_expanded');
        return saved ? JSON.parse(saved) : false;
    });

    // Save completed steps to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completedSteps));
    }, [completedSteps]);

    // Save expanded state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('instantiate_expanded', JSON.stringify(isExpanded));
    }, [isExpanded]);

    // Check if a step is completed
    const isStepCompleted = (stepId) => {
        return completedSteps.includes(stepId);
    };

    // Mark a step as completed
    const markStepAsCompleted = (stepId) => {
        if (!isStepCompleted(stepId)) {
            setCompletedSteps([...completedSteps, stepId]);
        }
    };

    // Get step status icon
    const getStepStatusIcon = (stepId) => {
        if (isStepCompleted(stepId)) {
            return <FaCheckCircle className="text-success" />;
        }
        return null;
    };

    // Get Started steps configuration
    const getStartedSteps = [
        {
            id: 'event-setup',
            title: t('instantiate.getStarted.eventSetup.title', 'Event Setup'),
            description: t('instantiate.getStarted.eventSetup.description', 'Start by configuring your event details, including name, dates, and location. This information will be used throughout your event platform.'),
            path: '/instantiate/event/info',
            buttonText: t('instantiate.getStarted.eventSetup.button', 'Configure Event')
        },
        {
            id: 'colors',
            title: t('instantiate.getStarted.colors.title', 'Theme & Colors'),
            description: t('instantiate.getStarted.colors.description', 'Customize your event\'s visual identity by choosing colors that match your brand. This will affect the entire platform\'s appearance.'),
            path: '/instantiate/application/colors',
            buttonText: t('instantiate.getStarted.colors.button', 'Customize Colors')
        },
        {
            id: 'pages',
            title: t('instantiate.getStarted.pages.title', 'Create Pages'),
            description: t('instantiate.getStarted.pages.description', 'Build your event\'s content by creating pages. Add information about your event, speakers, schedule, and more using our component-based editor.'),
            path: '/instantiate/application/pages',
            buttonText: t('instantiate.getStarted.pages.button', 'Manage Pages')
        },
        {
            id: 'menus',
            title: t('instantiate.getStarted.menus.title', 'Configure Menus'),
            description: t('instantiate.getStarted.menus.description', 'Organize your navigation by creating menus. Add links to your pages and external resources to help participants find information easily.'),
            path: '/instantiate/application/menus',
            buttonText: t('instantiate.getStarted.menus.button', 'Edit Menus')
        },
        {
          id: 'icons',
          title: t('instantiate.getStarted.icons.title', 'Customize Icons'),
          description: t('instantiate.getStarted.icons.description', 'Personalize your event\'s Application icons to create a unique and cohesive visual experience. Choose and customize icons that match your event\'s style.'),
          path: '/instantiate/application/icons',
          buttonText: t('instantiate.getStarted.icons.button', 'Edit Icons')
        },
        {
            id: 'plugins',
            title: t('instantiate.getStarted.plugins.title', 'Add Plugins'),
            description: t('instantiate.getStarted.plugins.description', 'Enhance your event with additional features. Choose from various plugins to add functionality like floor plans, feedback forms, and more.'),
            path: '/instantiate/event/plugins',
            buttonText: t('instantiate.getStarted.plugins.button', 'Manage Plugins')
        }
    ];

    return (
        <div className="shadow-lg p-2 rounded-lg mt-8 mb-8">
            <div className="collapse collapse-arrow bg-base-100">
                <input 
                    type="checkbox" 
                    className="peer" 
                    checked={isExpanded}
                    onChange={(e) => setIsExpanded(e.target.checked)}
                /> 
                <div className="collapse-title text-xl font-bold text-primary flex items-center gap-2">
                    <FaRocket className="text-primary" />
                    {t('instantiate.getStarted.title', 'Get Started Now')}
                    {completedSteps.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-normal ${completedSteps.length === getStartedSteps.length ? 'text-success' : 'text-base-content/70'}`}>
                                {completedSteps.length === getStartedSteps.length ? (
                                    <span className="flex items-center gap-1">
                                        <FaCheckCircle className="text-success" />
                                        {t('instantiate.getStarted.allCompleted', 'All steps completed!')}
                                    </span>
                                ) : (
                                    `${completedSteps.length}/${getStartedSteps.length} ${t('instantiate.getStarted.stepsCompleted', 'steps completed')}`
                                )}
                            </span>
                        </div>
                    )}
                </div>
                <div className="collapse-content">
                    <div className="flex items-center gap-2 mb-6">
                        <p className="text-base-content/70">
                            {t('instantiate.getStarted.description', 'Follow these steps to set up your event platform. We recommend following this order to ensure a smooth configuration process.')}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {getStartedSteps.slice(0, 3).map((step, index) => (
                                <div 
                                    key={step.id}
                                    className="bg-base-200 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                                                <span className="text-primary">{index + 1}.</span>
                                                {step.title}
                                                {getStepStatusIcon(step.id)}
                                            </h3>
                                            <p className="text-base-content/70 mb-4">
                                                {step.description}
                                            </p>
                                            <Link 
                                                to={step.path} 
                                                className="btn btn-primary btn-sm"
                                                onClick={() => markStepAsCompleted(step.id)}
                                            >
                                                {step.buttonText}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4">
                            {getStartedSteps.slice(3).map((step, index) => (
                                <div 
                                    key={step.id}
                                    className="bg-base-200 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                                                <span className="text-primary">{index + 4}.</span>
                                                {step.title}
                                                {getStepStatusIcon(step.id)}
                                            </h3>
                                            <p className="text-base-content/70 mb-4">
                                                {step.description}
                                            </p>
                                            <Link 
                                                to={step.path} 
                                                className="btn btn-primary btn-sm"
                                                onClick={() => markStepAsCompleted(step.id)}
                                            >
                                                {step.buttonText}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="mt-8 p-6 bg-base-200 rounded-lg">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-primary mb-2">
                                    {t('instantiate.getStarted.preview.title', 'Check your event application')}
                                </h3>
                                <p className="text-base-content/70">
                                    {t('instantiate.getStarted.preview.description', 'Open your event application in a new tab to see how it looks and works.')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 