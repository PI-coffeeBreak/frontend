import React, { useState } from "react";
import {FaCog, FaSearch} from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Pagination from "../components/common/Pagination.jsx";
import PluginSettingsModal from "../components/plugins/PluginSettingsModal.jsx";
import { usePlugins } from "../contexts/PluginsContext";

export default function Plugins() {
    const { plugins, pluginsConfig, togglePlugin } = usePlugins();

    const [selectedPlugin, setSelectedPlugin] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pluginsPerPage = 12;
    const [loadingPlugin, setLoadingPlugin] = useState(null);

    const filteredPlugins = plugins.filter((plugin) =>
        plugin.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPlugins.length / pluginsPerPage);
    const indexOfLastPlugin = currentPage * pluginsPerPage;
    const currentPlugins = filteredPlugins.slice(indexOfLastPlugin - pluginsPerPage, indexOfLastPlugin);

    const openModal = (plugin) => {
        const pluginConfig = pluginsConfig.find((config) => config.title === plugin.title);
        console.log("Plugin config:", pluginConfig);
        if (pluginConfig) {
            setSelectedPlugin({
                ...plugin,
                config: {
                    ...pluginConfig,
                }
            });
        }
    };

    const closeModal = () => {
        setSelectedPlugin(null);
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleTogglePlugin = async (plugin) => {
        setLoadingPlugin(plugin.name);
        try {
            await togglePlugin(plugin);
        } finally {
            setLoadingPlugin(null);
        }
    };

    return (
        <div className="w-full min-h-svh p-2 lg:p-8">
            <h1 className="text-3xl font-bold my-8">Plugins</h1>
            <div className="mb-6 flex flex-wrap gap-4 items-center">
                <label className="input input-bordered rounded-xl flex items-center gap-2">
                    <FaSearch className="text-gray-400"/>
                    <input
                        type="text"
                        className="grow "
                        placeholder="Search plugins"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </label>
            </div>

            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Enable</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentPlugins.map((plugin, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="p-3">{plugin.name}</td>
                                <td className="p-3">{plugin.description}</td>
                                <td className="p-3 text-center">
                                    <label className="flex items-center justify-center cursor-pointer">
                                        {loadingPlugin === plugin.name ? (
                                            <AiOutlineLoading3Quarters className="animate-spin text-primary text-xl" />
                                        ) : (
                                            <>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={plugin.is_loaded}
                                                    onChange={() => handleTogglePlugin(plugin)}
                                                />
                                                <div
                                                    className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 transition duration-300 ${plugin.is_loaded ? "bg-primary" : "bg-gray-400"}`}
                                                >
                                                    <div
                                                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${plugin.is_loaded ? "translate-x-4" : "translate-x-0"}`}
                                                    ></div>
                                                </div>
                                            </>
                                        )}
                                    </label>
                                </td>
                                <td className="p-3 text-center">
                                    {pluginsConfig.some((config) => config.title === plugin.title) && (
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

            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <div className="join">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={`page-${i + 1}`}
                                className={`join-item btn btn-xs sm:btn-sm ${currentPage === i + 1 ? "btn-active" : ""}`}
                                onClick={() => handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}