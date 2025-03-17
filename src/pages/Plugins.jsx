import { useState } from "react";
import { FaCog } from "react-icons/fa";
import Pagination from "../components/pagination";

export default function Plugins() {
    const [plugins, setPlugins] = useState([
        {name: "Registration System", description: "This plugin allows you to manage the registration of participants in the event.", enable: true},
        {name: "Alert System", description: "This plugin allows you to send alerts to participants.", enable: true},
        {name: "Speaker Presentation", description: "This plugin allows you to manage the presentations of the speakers.", enable: false},
        {name: "Floor Plan", description: "This plugin allows you to manage the floor plan of the event.", enable: false},
        {name: "Sponsors Promotion", description: "This plugin allows you to manage the promotion of sponsors.", enable: false},
        {name: "Activities Scheduler", description: "This plugin allows you to manage the schedule of activities.", enable: false},
    ])

    const [currentPage, setCurrentPage] = useState(1);
    const pluginsPerPage = 4;

    const totalPages = Math.ceil(plugins.length / pluginsPerPage);
    const indexOfLastPlugin = currentPage * pluginsPerPage;
    const indexOfFirstPlugin = indexOfLastPlugin - pluginsPerPage;
    const currentPlugins = plugins.slice(indexOfFirstPlugin, indexOfLastPlugin);

    const togglePlugin = (index) => {
        setPlugins(prevPlugins => 
            prevPlugins.map((plugin, i) => 
                i === index ? { ...plugin, enable: !plugin.enable } : plugin
            )
        );
    };

    return (
        <div className="w-full min-h-svh p-8">
            <h1 className="text-3xl font-bold mb-6">Plugins</h1>
            <div className="mb-6 flex flex-wrap gap-4 items-center">
                <input
                    type="text"
                    placeholder="Search..."
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
                        {currentPlugins.map((plugin, index) => (
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
                                    <button className="text-gray-700 hover:text-black">
                                        <FaCog className="text-lg" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination
                className="align-end"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}