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
        const settings = Object.fromEntries(formData.entries());

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
        return pluginConfig.inputs.map((input) => {
            const { type, name } = input;

            switch (type) {
                case "selector":
                    return <Selector key={name} {...input} />;
                case "text":
                    return <TextInput key={name} {...input} />;
                case "shortText":
                    return <ShortTextInput key={name} {...input} />;
                case "composedText":
                    return <ComposedText key={name} {...input} />;
                case "number":
                    return <NumberInput key={name} {...input} />;
                case "checkbox":
                    return <Checkbox key={name} {...input} />;
                case "toggle":
                    return <Toggle key={name} {...input} />;
                case "radio":
                    return <Radio key={name} {...input} />;
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
            
            <form method="dialog" className="modal-backdrop">
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