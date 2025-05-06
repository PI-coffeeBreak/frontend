import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Selector from './forms/Selector';
import Checkbox from './forms/Checkbox';
import TextInput from './forms/TextInput';
import NumberInput from './forms/NumberInput';
import Toggle from './forms/Toggle';
import Radio from './forms/Radio';
import { usePlugins } from '../contexts/PluginsContext';

function PluginSettingsModal({ pluginConfig, onClose }) {
    const { 
        fetchPluginSettings, 
        submitPluginSettings, 
        processPluginFormData 
    } = usePlugins();
    
    const dialogRef = useRef(null);
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    
    // Fetch current settings when modal opens
    useEffect(() => {
        let isMounted = true;
        
        const loadSettings = async () => {
            if (!pluginConfig.title) return;
            
            try {
                setIsLoading(true);
                const settingsData = await fetchPluginSettings(pluginConfig.title);
                console.log("Retrieved settings:", settingsData);
                
                if (isMounted && settingsData) {
                    setSettings(settingsData);
                }
            } catch (error) {
                console.error("Error fetching plugin settings:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        
        loadSettings();
        
        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted = false;
        };
    }, [pluginConfig.title]); // Remove fetchPluginSettings from dependencies
    
    useEffect(() => {
        if (dialogRef.current) {
            dialogRef.current.showModal();
        }
        document.body.classList.add('overflow-hidden');
        
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, []);
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        // Use the context function to process form data
        const processedSettings = processPluginFormData(formData);
        console.log("Form data processed:", processedSettings);
        
        try {
            await submitPluginSettings(pluginConfig.title, processedSettings);
            console.log("Settings submitted successfully");
            onClose();
        } catch (error) {
            console.error("Error submitting settings:", error);
        }
    };

    const renderFormFields = () => {
        if (!pluginConfig.inputs || !Array.isArray(pluginConfig.inputs)) {
            return null;
        }
        
        return pluginConfig.inputs.map((input, index) => {
            const { type, name, title } = input;
            const inputName = name || title?.toLowerCase().replace(/\s+/g, '_') || `input_${index}`;
            const itemKey = inputName || `input-${index}`;
            
            // First check settings, then fall back to default value from config
            const savedValue = settings[inputName] !== undefined ? settings[inputName] : input.default;
            
            const commonProps = {
                ...input,
                name: inputName,
                value: savedValue
            };

            switch (type) {
                case "selector":
                    return <Selector key={itemKey} {...commonProps} />;
                case "text":
                    return <TextInput key={itemKey} {...commonProps} />;
                case "number":
                    return <NumberInput key={itemKey} {...commonProps} />;
                case "checkbox":
                    return <Checkbox key={itemKey} {...commonProps} />;
                case "toggle":
                    return <Toggle key={itemKey} {...commonProps} />;
                case "radio":
                    return <Radio key={itemKey} {...commonProps} />;
                default:
                    return null;
            }
        });
    };

    return (
        <dialog 
            ref={dialogRef} 
            className="modal" 
            onClose={onClose}
            id="plugin-settings-modal"
        >
            <div className="modal-box max-w-3xl w-full">
                {/* Modal Header */}
                <div className="font-bold text-lg mb-4 flex justify-between items-center">
                    <h2 id="plugin-settings-title">
                        Settings for {pluginConfig.formatted_name}
                    </h2>
                    <button
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                {/* Description */}
                <p className="mb-4 text-base-content/70">{pluginConfig.description}</p>
                
                {/* Form */}
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <div className="loading loading-spinner loading-lg"></div>
                    </div>
                ) : (
                    <form id="plugin-settings-form" onSubmit={handleSubmit}>
                        <div className="space-y-4 overflow-y-auto max-h-[60vh]">
                            {renderFormFields()}
                        </div>

                        {/* Modal Footer */}
                        <div className="modal-action mt-6">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                Save Settings
                            </button>
                        </div>
                    </form>
                )}
            </div>
            
            <form method="dialog" className="modal-backdrop" key="modal-backdrop-form">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}

PluginSettingsModal.propTypes = {
    pluginConfig: PropTypes.shape({
        title: PropTypes.string.isRequired,
        formatted_name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        inputs: PropTypes.arrayOf(
            PropTypes.shape({
                type: PropTypes.string.isRequired,
                name: PropTypes.string,
                title: PropTypes.string,
                description: PropTypes.string,
                options: PropTypes.oneOfType([
                    PropTypes.arrayOf(PropTypes.string),
                    PropTypes.arrayOf(
                        PropTypes.shape({
                            value: PropTypes.string,
                            label: PropTypes.string,
                        })
                    ),
                ]),
                min: PropTypes.number,
                max: PropTypes.number,
                step: PropTypes.number,
                default: PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.number,
                    PropTypes.bool,
                    PropTypes.array
                ]),
                required: PropTypes.bool,
            })
        ).isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
};

export default PluginSettingsModal;