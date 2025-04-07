import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import Selector from './forms/Selector';
import Checkbox from './forms/Checkbox';
import ComposedText from './forms/ComposedText';
import ShortTextInput from './forms/ShortTextInput';
import TextInput from './forms/TextInput';
import { baseUrl } from '../consts';
import axios from 'axios';

const submitSettingsBaseUrl = `${baseUrl}/plugins/submit-settings`;

function PluginSettingsModal({ pluginConfig, onClose }) {
    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const settings = Object.fromEntries(formData.entries());

        try {
            const response = await axios.post(submitSettingsBaseUrl + `/${pluginConfig.title}`, {
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
            const { type, name } = input; // Destructure to get the unique `name` property
    
            switch (type) {
                case "selector":
                    return <Selector key={name} {...input} />;
                case "checkbox":
                    return <Checkbox key={name} {...input} />;
                case "composedText":
                    return <ComposedText key={name} {...input} />;
                case "shortText":
                    return <ShortTextInput key={name} {...input} />;
                case "text":
                    return <TextInput key={name} {...input} />;
                default:
                    return null;
            }
        });
    };

    return (
        <div className="modal modal-open fixed inset-0 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-1/3 relative">
                {/* Close Button */}
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold mb-4">Settings for {pluginConfig.title}</h2>
                <p className="mb-4">{pluginConfig.description}</p>

                <form id="plugin-settings-form" onSubmit={handleSubmit}>
                    {renderFormFields()}

                    <div className="flex justify-center mt-4">
                        <button
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
                            type="submit"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Add PropTypes validation for all props
PluginSettingsModal.propTypes = {
    pluginConfig: PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        inputs: PropTypes.arrayOf(
            PropTypes.shape({
                type: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
                label: PropTypes.string,
                options: PropTypes.arrayOf(
                    PropTypes.shape({
                        value: PropTypes.string.isRequired,
                        label: PropTypes.string.isRequired,
                    })
                ),
            })
        ).isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
};

export default PluginSettingsModal;