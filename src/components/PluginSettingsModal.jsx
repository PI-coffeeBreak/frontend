import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Selector from './forms/Selector';
import Checkbox from './forms/Checkbox';
import TextInput from './forms/TextInput';
import NumberInput from './forms/NumberInput';
import Toggle from './forms/Toggle';
import Radio from './forms/Radio';
import { baseUrl } from '../consts';
import { useKeycloak } from '@react-keycloak/web';
import { axiosWithAuth } from '../utils/axiosWithAuth';

const submitSettingsBaseUrl = `${baseUrl}/plugins/submit-settings`;
const getSettingsBaseUrl = `${baseUrl}/plugins/settings`;

function PluginSettingsModal({ pluginConfig, onClose }) {
    console.log("PluginConfig:", pluginConfig);
    const { keycloak } = useKeycloak();
    const modalRef = useRef(null);
    const dialogRef = useRef(null);
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    
    // Fetch current settings when modal opens
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setIsLoading(true);
                const response = await axiosWithAuth(keycloak).get(`${getSettingsBaseUrl}/${pluginConfig.title}`);
                console.log("Retrieved settings:", response.data);
                if (response.data) {
                    setSettings(response.data);
                }
            } catch (error) {
                console.error("Error fetching plugin settings:", error);
                // Continue with default values if settings can't be fetched
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchSettings();
    }, [pluginConfig.title, keycloak]);
    
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
        
        // Process form data to handle special cases
        const formEntries = Array.from(formData.entries());
        const newSettings = {};
        
        // Track checkbox groups to combine their values
        const checkboxGroups = {};
        
        formEntries.forEach(([key, value]) => {
            // Handle checkbox arrays (with [0], [1], etc. in the name)
            const checkboxMatch = key.match(/^(.+)\[(\d+)\]$/);
            if (checkboxMatch) {
                const baseKey = checkboxMatch[1];
                if (!checkboxGroups[baseKey]) {
                    checkboxGroups[baseKey] = [];
                }
                checkboxGroups[baseKey].push(value);
                return;
            }
            

            
            // Handle toggle values (convert string "true"/"false" to boolean)
            if (value === "true" || value === "false") {
                newSettings[key] = value === "true";
                return;
            }
            
            // Regular inputs
            newSettings[key] = value;
        });
        
        // Merge processed checkbox groups into settings
        Object.entries(checkboxGroups).forEach(([key, values]) => {
            newSettings[key] = values;
        });
        
        console.log("Form data processed:", newSettings);
        
        try {
            const response = await axiosWithAuth(keycloak).post(submitSettingsBaseUrl + `/${pluginConfig.title}`, {
                settings: newSettings,
            });
            console.log("Settings submitted successfully:", response.data);
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
            const savedValue = settings[inputName] !== undefined ? settings[inputName] : undefined;
            
            const commonProps = {
                ...input,
                name: inputName,
                value: savedValue
            };

            switch (type) {
                case "selector":
                    return <Selector key={itemKey} {...commonProps} />;
                case "text":
                    console.log("TextInput - commonProps:", commonProps);
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
                name: PropTypes.string,  // Changed from isRequired to optional, since we have a fallback
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