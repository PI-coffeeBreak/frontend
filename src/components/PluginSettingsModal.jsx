import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Selector from './forms/Selector';
import Checkbox from './forms/Checkbox';
import ComposedText from './forms/ComposedText';
import ShortTextInput from './forms/ShortTextInput';
import TextInput from './forms/TextInput';
import NumberInput from './forms/NumberInput';
import Toggle from './forms/Toggle';
import Radio from './forms/Radio';
import { baseUrl } from '../consts';
import { useKeycloak } from '@react-keycloak/web';
import { axiosWithAuth } from '../utils/axiosWithAuth';

const submitSettingsBaseUrl = `${baseUrl}/plugins/submit-settings`;

function PluginSettingsModal({ pluginConfig, onClose }) {
    console.log("PluginConfig:", pluginConfig);
    const { keycloak } = useKeycloak();
    const modalRef = useRef(null);
    const dialogRef = useRef(null);
    
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
        const settings = {};
        
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
            
            // Handle JSON strings (from ComposedText component)
            if (value && typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                try {
                    settings[key] = JSON.parse(value);
                    return;
                } catch (e) {
                    // If it's not valid JSON, just use the string value
                }
            }
            
            // Regular inputs
            settings[key] = value;
        });
        
        // Merge processed checkbox groups into settings
        Object.entries(checkboxGroups).forEach(([key, values]) => {
            settings[key] = values;
        });
        
        console.log("Form data processed:", settings);
        
        try {
            const response = await axiosWithAuth(keycloak).post(submitSettingsBaseUrl + `/${pluginConfig.title}`, {
                settings: settings,
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
            
            const commonProps = {
                ...input,
                name: inputName
            };

            switch (type) {
                case "selector":
                    return <Selector key={itemKey} {...commonProps} />;
                case "text":
                    return <TextInput key={itemKey} {...commonProps} />;
                case "shortText":
                    return <ShortTextInput key={itemKey} {...commonProps} />;
                case "composedText":
                    return <ComposedText key={itemKey} {...commonProps} />;
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
                name: PropTypes.string.isRequired,
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