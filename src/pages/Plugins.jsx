import { useState,useEffect } from "react";
import { FaCog } from "react-icons/fa";
import Pagination from "../components/Pagination";
import PluginSettingsModal from "../components/PluginSettingsModal";
import { baseUrl } from "../consts";
import axios from "axios";

const pluginsBaseUrl = `${baseUrl}/plugins`;
const pluginsConfigBaseUrl = `${baseUrl}/ui/plugin-config`;

export default function Plugins() {
    const [plugins, setPlugins] = useState([]);
    const [pluginsConfig, setPluginsConfig] = useState([]);
    const [selectedPlugin, setSelectedPlugin] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pluginsPerPage = 4;

    const filteredPlugins = plugins.filter(plugin => 
        plugin.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPlugins.length / pluginsPerPage);
    const indexOfLastPlugin = currentPage * pluginsPerPage;
    // const indexOfFirstPlugin = indexOfLastPlugin - pluginsPerPage;
    // const currentPlugins = filteredPlugins.slice(indexOfFirstPlugin, indexOfLastPlugin);

    useEffect(() => {
        fetchPlugins();
        fetchPluginsConfig();
    }, []);

    const fetchPlugins = async () => {
        try {
            const response = await axios.get(pluginsBaseUrl)
            console.log("Plugins fetched successfully:", response.data);
            setPlugins(response.data)
        }
        catch (error) {
            console.error("Error fetching plugins:", error);
            throw error;
        }
    }

    const fetchPluginsConfig = async () => {
        try {
            const response = await axios.get(pluginsConfigBaseUrl)
            console.log("Plugins configs fetched successfully:", response.data);
            setPluginsConfig(response.data)
        }
        catch (error) {
            console.error("Error fetching plugins:", error);
            throw error;
        }
    }

    const togglePlugin = async (index) => {
        const pluginToUpdate = plugins[index];
        const endpoint = pluginToUpdate.is_loaded ? `${pluginsBaseUrl}/unload` : `${pluginsBaseUrl}/load`;

        try {
            // Send POST request to the appropriate endpoint with the correct payload
            await axios.post(endpoint, {
                plugin_name: pluginToUpdate.name,
            });

            // Update the local state only after a successful POST request
            const updatedPlugins = plugins.map((plugin, i) =>
                i === index ? { ...plugin, is_loaded: !plugin.is_loaded } : plugin
            );
            setPlugins(updatedPlugins);

            console.log(`Plugin ${pluginToUpdate.name} ${pluginToUpdate.is_loaded ? "unloaded" : "loaded"} successfully.`);
        } catch (error) {
            console.error(`Error ${pluginToUpdate.is_loaded ? "unloading" : "loading"} plugin ${pluginToUpdate.name}:`, error);
        }
    };

    const openModal = (plugin) => {
        const pluginConfig = pluginsConfig.find((config) => config.title === plugin.name);
        if (pluginConfig) {
            setSelectedPlugin({ ...plugin, config: pluginConfig });
        }
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
                                                checked={plugin.is_loaded}
                                                onChange={() => togglePlugin(index)}
                                            />
                                            <div className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 transition duration-300 ${plugin.is_loaded ? "bg-primary" : "bg-gray-400"}`}>
                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${plugin.is_loaded ? "translate-x-4" : "translate-x-0"}`}></div>
                                            </div>
                                        </label>
                                    </td>
                                    <td className="p-3 text-center">
                                      {pluginsConfig.some((config) => config.title === plugin.name) && (
                                        <button
                                          onClick={() => openModal(plugin)}
                                          className="text-gray-700 hover:text-black"
                                        >
                                          <FaCog className="text-lg" />
                                        </button>
                                      )}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            {selectedPlugin && (
                <PluginSettingsModal
                    pluginConfig={selectedPlugin.config}
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