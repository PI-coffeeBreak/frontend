import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PropTypes } from 'prop-types';
import { 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaClone, 
    FaToggleOn, 
    FaSearch, 
    FaArrowUp,
    FaInfoCircle,
    FaExclamationTriangle,
    FaCheckCircle,
    FaLightbulb,
    FaMobileAlt,
    FaDesktop,
    FaSave,
    FaEye,
    FaChevronDown,
    FaChevronRight
} from 'react-icons/fa';

// Extracted components
const PageGuideSection = ({ title, icon, children, isActive, onToggle }) => {
    const sectionId = `section-${title.toLowerCase().replace(/\s+/g, '-')}`;
    const titleId = `${sectionId}-title`;

    return (
        <div className={`collapse bg-base-200 transition-all duration-200 ${isActive ? 'collapse-open' : 'collapse-close'}`}>
            <button 
                className="collapse-title text-xl font-semibold flex items-center gap-2 w-full text-left hover:bg-base-300 transition-colors duration-200"
                onClick={onToggle}
                aria-expanded={isActive}
                aria-controls={sectionId}
                id={titleId}
            >
                {icon}
                <span>{title}</span>
                {isActive ? (
                    <FaChevronDown className="ml-auto text-primary transition-transform duration-200" aria-hidden="true" />
                ) : (
                    <FaChevronRight className="ml-auto text-primary transition-transform duration-200" aria-hidden="true" />
                )}
            </button>
            <section 
                id={sectionId}
                className="collapse-content"
                aria-labelledby={titleId}
            >
                {children}
            </section>
        </div>
    );
};

PageGuideSection.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    isActive: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired
};

const InfoCard = ({ title, icon, children }) => (
    <div className="bg-base-100 p-4 rounded-lg shadow-sm">
        <h4 className="font-medium mb-3 flex items-center gap-2">
            {icon}
            {title}
        </h4>
        {children}
    </div>
);

InfoCard.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired
};

const ListItem = ({ icon, title, description }) => (
    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
        {icon}
        <div>
            <span className="font-medium">{title}</span>
            <p className="text-sm text-base-content/70">{description}</p>
        </div>
    </li>
);

ListItem.propTypes = {
    icon: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
};

const ComponentList = ({ items }) => (
    <ul className="space-y-3">
        {items.map((item, index) => (
            <ListItem
                key={index}
                icon={<span className="font-medium text-primary group-hover:scale-110 transition-transform duration-200">•</span>}
                title={item.title}
                description={item.description}
            />
        ))}
    </ul>
);

ComponentList.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired
        })
    ).isRequired
};

export function PageGuide() {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('creating');

    const handleSectionClick = (section) => {
        setActiveSection(activeSection === section ? null : section);
    };

    const basicComponents = [
        {
            title: t('pageGuide.components.basic.title', 'Title'),
            description: t('pageGuide.components.basic.titleDesc', 'Create clear headings and section titles')
        },
        {
            title: t('pageGuide.components.basic.text', 'Text'),
            description: t('pageGuide.components.basic.textDesc', 'Add paragraphs and formatted content')
        },
        {
            title: t('pageGuide.components.basic.image', 'Image'),
            description: t('pageGuide.components.basic.imageDesc', 'Display images with optional captions')
        },
        {
            title: t('pageGuide.components.basic.video', 'Video'),
            description: t('pageGuide.components.basic.videoDesc', 'Display videos to your participants')
        },
        {
            title: t('pageGuide.components.basic.location', 'Location'),
            description: t('pageGuide.components.basic.locationDesc', 'Show maps and venue information')
        }
    ];

    const pluginComponents = [
        {
            title: t('pageGuide.components.plugins.alert', 'Alert'),
            description: t('pageGuide.components.plugins.alertDesc', 'Display important notices and warnings')
        },
        {
            title: t('pageGuide.components.plugins.speaker', 'Speaker'),
            description: t('pageGuide.components.plugins.speakerDesc', 'Display speakers list')
        },
        {
            title: t('pageGuide.components.plugins.sponsors', 'Sponsors'),
            description: t('pageGuide.components.plugins.sponsorsDesc', 'Display sponsor logos and information')
        },
        {
            title: t('pageGuide.components.plugins.feedback', 'Feedback Form'),
            description: t('pageGuide.components.plugins.feedbackDesc', 'Collect user feedback and ratings')
        }
    ];

    return (
        <div className="bg-base-100 p-4 rounded-xl max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <FaInfoCircle className="text-primary text-3xl" />
                <h2 className="text-2xl font-bold">{t('pageGuide.title', 'How to Use Pages')}</h2>
            </div>
            
            <div className="my-6 mx-2 text-justify text-base-content/80">
                <p className="">
                    {t('pageGuide.introduction', 'This guide will help you understand how to create and manage pages in your event. Pages are custom sections where you can display information, collect data, or provide specific functionality to your event participants. You can add various components to build interactive and informative pages that enhance your event experience.')}
                </p>
            </div>
            
            <div className="space-y-2">
                {/* Creating Pages */}
                <PageGuideSection
                    title={t('pageGuide.creating.title', 'Creating Pages')}
                    icon={<FaPlus className="text-primary" />}
                    isActive={activeSection === 'creating'}
                    onToggle={() => handleSectionClick('creating')}
                >
                    <div className="space-y-4">
                        <p className="text-base-content/80">
                            {t('pageGuide.creating.description', 'Start by clicking the "Create Page" button. Give your page a title and start adding components to build your content.')}
                        </p>
                        <InfoCard
                            title={t('pageGuide.creating.bestPractices')}
                            icon={<FaCheckCircle className="text-success" />}
                        >
                            <ul className="list-disc list-inside space-y-2 text-base-content/80">
                                <li>{t('pageGuide.creating.practice1', 'Choose a clear, descriptive title')}</li>
                                <li>{t('pageGuide.creating.practice2', 'Plan your content structure before adding components')}</li>
                                <li>{t('pageGuide.creating.practice3', 'Start with basic components and enhance gradually')}</li>
                            </ul>
                        </InfoCard>
                    </div>
                </PageGuideSection>

                {/* Available Components */}
                <PageGuideSection
                    title={t('pageGuide.components.title', 'Available Components')}
                    icon={<FaDesktop className="text-primary" />}
                    isActive={activeSection === 'components'}
                    onToggle={() => handleSectionClick('components')}
                >
                    <div className="space-y-4">
                        <InfoCard
                            title={t('pageGuide.components.explanation', 'Components are the building blocks of your pages. Each component represents a specific type of content or functionality that you can add to your page. Think of them as pre-built elements that you can customize to create your desired layout and content.')}
                            icon={<FaDesktop className="text-primary" />}
                        >
                            <p className="text-base-content/80">
                                {t('pageGuide.components.explanation', 'Components are the building blocks of your pages. Each component represents a specific type of content or functionality that you can add to your page. Think of them as pre-built elements that you can customize to create your desired layout and content.')}
                            </p>
                        </InfoCard>
                        
                        <div className="bg-base-100 p-4 rounded-lg shadow-sm mb-4 border-l-4 border-primary">
                            <div className="flex items-start gap-2">
                                <FaExclamationTriangle className="text-primary mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-base-content/90">
                                        {t('pageGuide.components.pluginDisclaimer.title', 'Plugin Configuration')}
                                    </p>
                                    <p className="text-sm text-base-content/70 mt-1">
                                        {t('pageGuide.components.pluginDisclaimer.description', 'Some plugins may require additional configuration through their dedicated pages. You can access these settings by clicking the external link icon (↗️) next to the plugin in the Plugins page or in the side panel "plugins" menu.')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard
                                title={t('pageGuide.components.basic.description', 'Basic Components')}
                                icon={<FaDesktop className="text-primary" />}
                            >
                                <ComponentList items={basicComponents} />
                            </InfoCard>

                            <InfoCard
                                title={t('pageGuide.components.plugins.description', 'Plugins/Extensions Components')}
                                icon={<FaMobileAlt className="text-primary" />}
                            >
                                <ComponentList items={pluginComponents} />
                            </InfoCard>
                        </div>
                    </div>
                </PageGuideSection>

                {/* Managing Pages */}
                <PageGuideSection
                    title={t('pageGuide.managing.title', 'Managing Pages')}
                    icon={<FaEdit className="text-primary" />}
                    isActive={activeSection === 'managing'}
                    onToggle={() => handleSectionClick('managing')}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                            title={t('pageGuide.managing.search.title', 'Search & Filter')}
                            icon={<FaSearch className="text-primary" />}
                        >
                            <p className="text-base-content/80 mb-3">
                                {t('pageGuide.managing.search.description', 'Use the search bar to find pages quickly. Filter pages by their status (enabled/disabled).')}
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-base-content/80">
                                <li className="hover:text-primary transition-colors duration-200">{t('pageGuide.managing.search.tip1', 'Search by page title')}</li>
                                <li className="hover:text-primary transition-colors duration-200">{t('pageGuide.managing.search.tip2', 'Filter to show all, enabled, or disabled pages')}</li>
                                <li className="hover:text-primary transition-colors duration-200">{t('pageGuide.managing.search.tip3', 'Combine search and filters for precise results')}</li>
                            </ul>
                        </InfoCard>
                        <InfoCard
                            title={t('pageGuide.managing.status.title', 'Page Status')}
                            icon={<FaToggleOn className="text-primary" />}
                        >
                            <p className="text-base-content/80 mb-3">
                                {t('pageGuide.managing.status.description', 'Toggle page visibility using the enable/disable switch. Disabled pages won\'t appear in the menu.')}
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-base-content/80">
                                <li className="hover:text-primary transition-colors duration-200">{t('pageGuide.managing.status.tip1', 'Enable pages when they\'re ready for viewing')}</li>
                                <li className="hover:text-primary transition-colors duration-200">{t('pageGuide.managing.status.tip2', 'Disable pages during maintenance or updates')}</li>
                                <li className="hover:text-primary transition-colors duration-200">{t('pageGuide.managing.status.tip3', 'Check page status before making changes')}</li>
                            </ul>
                        </InfoCard>
                    </div>
                </PageGuideSection>

                {/* Page Actions */}
                <PageGuideSection
                    title={t('pageGuide.actions.title', 'Page Actions')}
                    icon={<FaClone className="text-primary" />}
                    isActive={activeSection === 'actions'}
                    onToggle={() => handleSectionClick('actions')}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                            title={t('pageGuide.actions.edit.title', 'Editing')}
                            icon={<FaEdit className="text-primary" />}
                        >
                            <ul className="space-y-3">
                                <ListItem
                                    icon={<FaArrowUp className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />}
                                    title={t('pageGuide.actions.edit.reorder', 'Drag and drop to reorder components')}
                                    description={t('pageGuide.actions.edit.reorderDesc', 'Change the order of components by dragging them')}
                                />
                                <ListItem
                                    icon={<FaEdit className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />}
                                    title={t('pageGuide.actions.edit.configure', 'Configure component properties')}
                                    description={t('pageGuide.actions.edit.configureDesc', 'Click components to edit their settings')}
                                />
                                <ListItem
                                    icon={<FaTrash className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />}
                                    title={t('pageGuide.actions.edit.remove', 'Remove components')}
                                    description={t('pageGuide.actions.edit.removeDesc', 'Delete components you don\'t need')}
                                />
                            </ul>
                        </InfoCard>
                        <InfoCard
                            title={t('pageGuide.actions.manage.title', 'Management')}
                            icon={<FaClone className="text-primary" />}
                        >
                            <ul className="space-y-3">
                                <ListItem
                                    icon={<FaClone className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />}
                                    title={t('pageGuide.actions.manage.clone', 'Clone pages')}
                                    description={t('pageGuide.actions.manage.cloneDesc', 'Create copies of existing pages')}
                                />
                                <ListItem
                                    icon={<FaTrash className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />}
                                    title={t('pageGuide.actions.manage.delete', 'Delete pages')}
                                    description={t('pageGuide.actions.manage.deleteDesc', 'Remove pages you no longer need')}
                                />
                                <ListItem
                                    icon={<FaSave className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />}
                                    title={t('pageGuide.actions.manage.save', 'Save changes')}
                                    description={t('pageGuide.actions.manage.saveDesc', 'Regularly save your work to avoid losing changes')}
                                />
                            </ul>
                        </InfoCard>
                    </div>
                </PageGuideSection>

                {/* Tips */}
                <PageGuideSection
                    title={t('pageGuide.tips.title', 'Pro Tips')}
                    icon={<FaLightbulb className="text-primary" />}
                    isActive={activeSection === 'tips'}
                    onToggle={() => handleSectionClick('tips')}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                            title={t('pageGuide.tips.plan', 'Plan your page structure')}
                            icon={<FaCheckCircle className="text-success mt-1 group-hover:scale-110 transition-transform duration-200" />}
                        >
                            <p className="text-base-content/70">{t('pageGuide.tips.planDesc', 'Sketch your layout before adding components')}</p>
                        </InfoCard>
                        <InfoCard
                            title={t('pageGuide.tips.preview', 'Preview regularly')}
                            icon={<FaEye className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />}
                        >
                            <p className="text-base-content/70">{t('pageGuide.tips.previewDesc', 'Check how your page looks as you build it')}</p>
                        </InfoCard>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                            title={t('pageGuide.tips.save', 'Save frequently')}
                            icon={<FaSave className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />}
                        >
                            <p className="text-base-content/70">{t('pageGuide.tips.saveDesc', 'Don\'t risk losing your work')}</p>
                        </InfoCard>
                        <InfoCard
                            title={t('pageGuide.tips.test', 'Test on different devices')}
                            icon={<FaMobileAlt className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />}
                        >
                            <p className="text-base-content/70">{t('pageGuide.tips.testDesc', 'Ensure your page works well everywhere')}</p>
                        </InfoCard>
                    </div>
                </PageGuideSection>
            </div>
        </div>
    );
}