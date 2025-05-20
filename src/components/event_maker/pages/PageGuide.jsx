import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaClone, 
    FaToggleOn, 
    FaSearch, 
    FaArrowUp, 
    FaArrowDown,
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

export function PageGuide() {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('creating');

    const handleSectionClick = (section) => {
        setActiveSection(activeSection === section ? null : section);
    };

    const renderAccordionHeader = (section, icon, title) => (
        <div 
            className="collapse-title text-xl font-semibold flex items-center gap-2 cursor-pointer hover:bg-base-300 transition-colors duration-200"
            onClick={() => handleSectionClick(section)}
        >
            {icon}
            <span>{title}</span>
            {activeSection === section ? (
                <FaChevronDown className="ml-auto text-primary transition-transform duration-200" />
            ) : (
                <FaChevronRight className="ml-auto text-primary transition-transform duration-200" />
            )}
        </div>
    );

    return (
        <div className="bg-base-100 p-4 rounded-xl max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <FaInfoCircle className="text-primary text-3xl" />
                <h2 className="text-2xl font-bold">{t('pageGuide.title', 'How to Use Pages')}</h2>
            </div>
            
            <div className="space-y-2">
                {/* Creating Pages */}
                <div className={`collapse bg-base-200 transition-all duration-200 ${activeSection === 'creating' ? 'collapse-open' : 'collapse-close'}`}>
                    {renderAccordionHeader(
                        'creating',
                        <FaPlus className="text-primary" />,
                        t('pageGuide.creating.title', 'Creating Pages')
                    )}
                    <div className="collapse-content">
                        <div className="space-y-4">
                            <p className="text-base-content/80">
                                {t('pageGuide.creating.description', 'Start by clicking the "Create Page" button. Give your page a title and start adding components to build your content.')}
                            </p>
                            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <FaCheckCircle className="text-success" />
                                    {t('pageGuide.creating.bestPractices', 'Best Practices')}
                                </h4>
                                <ul className="list-disc list-inside space-y-2 text-base-content/80">
                                    <li>{t('pageGuide.creating.practice1', 'Choose a clear, descriptive title')}</li>
                                    <li>{t('pageGuide.creating.practice2', 'Plan your content structure before adding components')}</li>
                                    <li>{t('pageGuide.creating.practice3', 'Start with basic components and enhance gradually')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Available Components */}
                <div className={`collapse bg-base-200 transition-all duration-200 ${activeSection === 'components' ? 'collapse-open' : 'collapse-close'}`}>
                    {renderAccordionHeader(
                        'components',
                        <FaDesktop className="text-primary" />,
                        t('pageGuide.components.title', 'Available Components')
                    )}
                    <div className="collapse-content">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <FaDesktop className="text-primary" />
                                    {t('pageGuide.components.basic.description', 'Basic Components')}
                                </h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <span className="font-medium text-primary group-hover:scale-110 transition-transform duration-200">•</span>
                                        <div>
                                            <span className="font-medium">{t('pageGuide.components.basic.title', 'Title')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.components.basic.titleDesc', 'Create clear headings and section titles')}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <span className="font-medium text-primary group-hover:scale-110 transition-transform duration-200">•</span>
                                        <div>
                                            <span className="font-medium">{t('pageGuide.components.basic.text', 'Text')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.components.basic.textDesc', 'Add paragraphs and formatted content')}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <span className="font-medium text-primary group-hover:scale-110 transition-transform duration-200">•</span>
                                        <div>
                                            <span className="font-medium">{t('pageGuide.components.basic.image', 'Image')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.components.basic.imageDesc', 'Display images with optional captions')}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <span className="font-medium text-primary group-hover:scale-110 transition-transform duration-200">•</span>
                                        <div>
                                            <span className="font-medium">{t('pageGuide.components.basic.button', 'Button')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.components.basic.buttonDesc', 'Create call-to-action buttons')}</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <FaMobileAlt className="text-primary" />
                                    {t('pageGuide.components.plugins.description', 'Special Components')}
                                </h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <span className="font-medium text-primary group-hover:scale-110 transition-transform duration-200">•</span>
                                        <div>
                                            <span className="font-medium">{t('pageGuide.components.plugins.alert', 'Alert')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.components.plugins.alertDesc', 'Display important notices and warnings')}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <span className="font-medium text-primary group-hover:scale-110 transition-transform duration-200">•</span>
                                        <div>
                                            <span className="font-medium">{t('pageGuide.components.plugins.location', 'Location')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.components.plugins.locationDesc', 'Show maps and venue information')}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <span className="font-medium text-primary group-hover:scale-110 transition-transform duration-200">•</span>
                                        <div>
                                            <span className="font-medium">{t('pageGuide.components.plugins.sponsors', 'Sponsors')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.components.plugins.sponsorsDesc', 'Display sponsor logos and information')}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <span className="font-medium text-primary group-hover:scale-110 transition-transform duration-200">•</span>
                                        <div>
                                            <span className="font-medium">{t('pageGuide.components.plugins.feedback', 'Feedback Form')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.components.plugins.feedbackDesc', 'Collect user feedback and ratings')}</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Managing Pages */}
                <div className={`collapse bg-base-200 transition-all duration-200 ${activeSection === 'managing' ? 'collapse-open' : 'collapse-close'}`}>
                    {renderAccordionHeader(
                        'managing',
                        <FaEdit className="text-primary" />,
                        t('pageGuide.managing.title', 'Managing Pages')
                    )}
                    <div className="collapse-content">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <FaSearch className="text-primary" />
                                    {t('pageGuide.managing.search.title', 'Search & Filter')}
                                </h4>
                                <p className="text-base-content/80 mb-3">
                                    {t('pageGuide.managing.search.description', 'Use the search bar to find pages quickly. Filter pages by their status (enabled/disabled).')}
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-base-content/80">
                                    <li className="hover:text-primary transition-colors duration-200">{t('pageGuide.managing.search.tip1', 'Search by page title')}</li>
                                    <li className="hover:text-primary transition-colors duration-200">{t('pageGuide.managing.search.tip2', 'Filter to show all, enabled, or disabled pages')}</li>
                                    <li className="hover:text-primary transition-colors duration-200">{t('pageGuide.managing.search.tip3', 'Combine search and filters for precise results')}</li>
                                </ul>
                            </div>
                            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <FaToggleOn className="text-primary" />
                                    {t('pageGuide.managing.status.title', 'Page Status')}
                                </h4>
                                <p className="text-base-content/80 mb-3">
                                    {t('pageGuide.managing.status.description', 'Toggle page visibility using the enable/disable switch. Disabled pages won\'t appear in the menu.')}
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-base-content/80">
                                    <li className="hover:text-primary transition-colors duration-200">{t('pageGuide.managing.status.tip1', 'Enable pages when they\'re ready for viewing')}</li>
                                    <li className="hover:text-primary transition-colors duration-200">{t('pageGuide.managing.status.tip2', 'Disable pages during maintenance or updates')}</li>
                                    <li className="hover:text-primary transition-colors duration-200">{t('pageGuide.managing.status.tip3', 'Check page status before making changes')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Actions */}
                <div className={`collapse bg-base-200 transition-all duration-200 ${activeSection === 'actions' ? 'collapse-open' : 'collapse-close'}`}>
                    {renderAccordionHeader(
                        'actions',
                        <FaClone className="text-primary" />,
                        t('pageGuide.actions.title', 'Page Actions')
                    )}
                    <div className="collapse-content">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <FaEdit className="text-primary" />
                                    {t('pageGuide.actions.edit.title', 'Editing')}
                                </h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <FaArrowUp className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />
                                        <div>
                                            <span className="font-medium">{t('pageGuide.actions.edit.reorder', 'Drag and drop to reorder components')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.actions.edit.reorderDesc', 'Change the order of components by dragging them')}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <FaEdit className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />
                                        <div>
                                            <span className="font-medium">{t('pageGuide.actions.edit.configure', 'Configure component properties')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.actions.edit.configureDesc', 'Click components to edit their settings')}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <FaTrash className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />
                                        <div>
                                            <span className="font-medium">{t('pageGuide.actions.edit.remove', 'Remove components')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.actions.edit.removeDesc', 'Delete components you don\'t need')}</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <FaClone className="text-primary" />
                                    {t('pageGuide.actions.manage.title', 'Management')}
                                </h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <FaClone className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />
                                        <div>
                                            <span className="font-medium">{t('pageGuide.actions.manage.clone', 'Clone pages')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.actions.manage.cloneDesc', 'Create copies of existing pages')}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <FaTrash className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />
                                        <div>
                                            <span className="font-medium">{t('pageGuide.actions.manage.delete', 'Delete pages')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.actions.manage.deleteDesc', 'Remove pages you no longer need')}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <FaSave className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />
                                        <div>
                                            <span className="font-medium">{t('pageGuide.actions.manage.save', 'Save changes')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.actions.manage.saveDesc', 'Regularly save your work to avoid losing changes')}</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className={`collapse bg-base-200 transition-all duration-200 ${activeSection === 'tips' ? 'collapse-open' : 'collapse-close'}`}>
                    {renderAccordionHeader(
                        'tips',
                        <FaLightbulb className="text-primary" />,
                        t('pageGuide.tips.title', 'Pro Tips')
                    )}
                    <div className="collapse-content">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <FaCheckCircle className="text-success mt-1 group-hover:scale-110 transition-transform duration-200" />
                                        <div>
                                            <span className="font-medium">{t('pageGuide.tips.plan', 'Plan your page structure')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.tips.planDesc', 'Sketch your layout before adding components')}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <FaEye className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />
                                        <div>
                                            <span className="font-medium">{t('pageGuide.tips.preview', 'Preview regularly')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.tips.previewDesc', 'Check how your page looks as you build it')}</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <FaSave className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />
                                        <div>
                                            <span className="font-medium">{t('pageGuide.tips.save', 'Save frequently')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.tips.saveDesc', 'Don\'t risk losing your work')}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2 group hover:bg-base-200 p-2 rounded-lg transition-colors duration-200">
                                        <FaMobileAlt className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200" />
                                        <div>
                                            <span className="font-medium">{t('pageGuide.tips.test', 'Test on different devices')}</span>
                                            <p className="text-sm text-base-content/70">{t('pageGuide.tips.testDesc', 'Ensure your page works well everywhere')}</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}