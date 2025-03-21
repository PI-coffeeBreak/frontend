import React from 'react';
import Selector from './forms/Selector';
import Checkbox from './forms/Checkbox';
import ComposedText from './forms/ComposedText';
import ShortTextInput from './forms/ShortTextInput';
import TextInput from './forms/TextInput';

function PluginSettingsModal({ plugin, onClose }) {

    const renderFormFields = () => {
        return plugin.inputs.map((input, index) => {
            switch (input.type) {
                case 'selector':
                    return <Selector key={index} {...input} />;
                case 'checkbox':
                    return <Checkbox key={index} {...input} />;
                case 'composedText':
                    return <ComposedText key={index} {...input} />;
                case 'shortText':
                    return <ShortTextInput key={index} {...input} />;
                case 'text':
                    return <TextInput key={index} {...input} />;
                default:
                    return null;
            }
        });
    };

    return (

        <div className={`modal ${plugin ? 'modal-open' : ''} fixed inset-0 flex justify-center items-center`}>
            <div className="bg-white p-6 rounded-lg w-1/3">
                <h2 className="text-xl font-bold mb-4">Settings for {plugin.title}</h2>
                <p className="mb-4">{plugin.description}</p>

                {renderFormFields()}

                <div className="flex justify-center mt-4">
                    <button
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
                        onClick={onClose}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PluginSettingsModal;