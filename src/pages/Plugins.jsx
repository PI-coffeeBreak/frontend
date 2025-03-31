import { useState } from "react";
import { FaCog } from "react-icons/fa";
import Pagination from "../components/Pagination";
import PluginSettingsModal from "../components/PluginSettingsModal";

export default function Plugins() {
    const [plugins, setPlugins] = useState([
        {
            name: "Registration System",
            description: "This plugin allows you to manage the registration of participants in the event.",
            enable: true,
            settings: {
                title: "Registration System",
                description: "Plugin to manage registrations.",
                inputs: [
                    {
                        type: "text",
                        title: "Registration URL",
                        description: "The URL for registration",
                        optional: "false",
                    },
                ],
            },
        },
        {
            name: "Alert System",
            description: "This plugin allows you to send alerts to participants.",
            enable: true,
            settings: {
                title: "Alert System",
                description: "This plugin allows you to send alerts to participants.",
                inputs: [
                    {
                        type: "selector",
                        title: "Who can send alerts?",
                        description: "Choose who can send alerts.",
                        options: ["Everyone", "Only Admins"],
                        optional: "false",
                    },
                    {
                        type: "checkbox",
                        title: "Do you want template messages for alerts?",
                        kind: "multiple",
                        options: ["Yes", "No", "bla", "bla2"],
                        optional: "true",
                    },
                    {
                        type: "shortText",
                        title: "Alerts API Key",
                        description: "The API key to send alerts.",
                        optional: "false",
                    },
                    {
                        type: "text",
                        title: "Alerts API URL",
                        description: "The URL to send alerts.",
                        optional: "false",
                    },
                    {
                        type: "composedText",
                        title: "Alerts Message",
                        description: "The message to send.",
                        optional: "false",
                    }
                ],
            },
        },
    ]);

    const [selectedPlugin, setSelectedPlugin] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pluginsPerPage = 4;

    const filteredPlugins = plugins.filter(plugin => 
        plugin.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPlugins.length / pluginsPerPage);
    const indexOfLastPlugin = currentPage * pluginsPerPage;
    const indexOfFirstPlugin = indexOfLastPlugin - pluginsPerPage;
    const currentPlugins = filteredPlugins.slice(indexOfFirstPlugin, indexOfLastPlugin);

    const togglePlugin = (index) => {
        setPlugins(prevPlugins => 
            prevPlugins.map((plugin, i) => 
                i === index ? { ...plugin, enable: !plugin.enable } : plugin
            )
        );
    };

    const openModal = (plugin) => {
        setSelectedPlugin(plugin);
    };

    const closeModal = () => {
        setSelectedPlugin(null);
    };

    return (
        <div className="w-full min-h-svh p-8">
            <h1 className="text-3xl font-bold mb-6">Plugins</h1>
            <div className="mb-6 flex flex-wrap gap-4 items-center">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="p-2 border rounded-lg shadow-sm w-full md:w-1/3"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Enable</th>
                            <th>Settings</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredPlugins.map((plugin, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="p-3">{plugin.name}</td>
                                    <td className="p-3">{plugin.description}</td>
                                    <td className="p-3 text-center">
                                        <label className="flex items-center justify-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={plugin.enable}
                                                onChange={() => togglePlugin(index)}
                                            />
                                            <div className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 transition duration-300 ${plugin.enable ? "bg-primary" : "bg-gray-400"}`}>
                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${plugin.enable ? "translate-x-4" : "translate-x-0"}`}></div>
                                            </div>
                                        </label>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => openModal(plugin.settings)}
                                            className="text-gray-700 hover:text-black"
                                        >
                                            <FaCog className="text-lg" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            {selectedPlugin && (
                <PluginSettingsModal
                    plugin={selectedPlugin}
                    onClose={closeModal}
                />
            )}

            {filteredPlugins.length > pluginsPerPage && (
                <Pagination
                    className="align-start"
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
}