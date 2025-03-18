import { useState } from "react";
import {Link, useLocation} from "react-router-dom";
import { VscLayoutSidebarLeft, VscLayoutSidebarLeftOff } from "react-icons/vsc";
import { FaHome, FaCalendarAlt, FaPen, FaUserPlus } from "react-icons/fa";
import DropdownMenu from "./DropdownMenu.jsx";

export default function Sidebar() {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);
    const toggleSidebar = () => {
        setIsVisible(!isVisible);
    };

    return (
        <>
            <div className={`bg-secondary text-white rounded-r-xl min-h-screen fixed top-0 left-0 transition-all duration-300 flex flex-col justify-between ${isVisible ? "w-64" : "w-20"}`}>
                <div>
                    <div className={`flex items-center p-4 ${isVisible ? "gap-4" : "gap-0"}`}>
                        <img src="/stu@deti.png" width="50" height="50" alt="Logo"/>
                        <span className={`overflow-hidden transition-all duration-300 ${isVisible ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
                            <h1 className="font-bold text-lg">students@DETI</h1>
                            <p className="text-md text-base-content">Event</p>
                        </span>
                    </div>

                    <nav className={`mt-6 ${isVisible ? "px-4" : "px-0"}`}>
                        <ul className="flex flex-col gap-4">
                            <DropdownMenu
                                icon={FaHome}
                                title="Home"
                                isVisible={isVisible}
                                links={[
                                    { label: "Users", path: "home/users" },
                                    { label: "Activities", path: "home/sessions" },
                                    { label: "Alerts", path: "home/alerts" }
                                ]}
                            />
                            <DropdownMenu
                                icon={FaPen}
                                title="Event Maker"
                                isVisible={isVisible}
                                links={[
                                    { label: "Colors", path: "eventmaker/colors" },
                                    { label: "Base Configurations", path: "eventmaker/base-configurations" },
                                    { label: "Plugins", path: "eventmaker/plugins" }
                                ]}
                            />
                            <li>
                                <Link to="schedule" className={`flex ${isVisible ? "items-center gap-3 p-3" : "justify-center items-center p-4"} hover:bg-secondary rounded-md transition-all`}>
                                    <FaCalendarAlt className="text-xl" />
                                    <span className={`overflow-hidden transition-all duration-300 ${isVisible ? "w-auto opacity-100" : "w-0 opacity-0"}`}>Schedule</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="register" className={`flex ${isVisible ? "items-center gap-3 p-3" : "justify-center items-center p-4"} hover:bg-secondary rounded-md transition-all`}>
                                    <FaUserPlus className="text-xl" />
                                    <span className={`overflow-hidden transition-all duration-300 ${isVisible ? "w-auto opacity-100" : "w-0 opacity-0"}`}>Register</span>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className="flex mx-auto my-8 items-center gap-4 mb-4">
                    <img src="/joao.jpg" alt="User Avatar" className={`rounded-full w-12 h-12 border-2 border-white ${isVisible ? "mx-2": "mx-auto"}`} />
                    <span className={`transition-all duration-300 text-left ${isVisible ? "opacity-100 w-auto mt-2" : "opacity-0 w-0"}`}>
                        <p className="font-semibold">João Almeida</p>
                        <p className="text-sm text-gray-300">joao@ua.pt</p>
                    </span>
                </div>
            </div>
            <div className="flex items-center fixed top-0 left-0 w-full text-white px-4 py-2 z-50 transition-all duration-300"
                 style={{ marginLeft: isVisible ? "16rem" : "5rem" }}>
                <button
                    onClick={toggleSidebar}
                    className="btn btn-secondary rounded-xl transition-all duration-300"
                >
                    {isVisible ? <VscLayoutSidebarLeftOff /> : <VscLayoutSidebarLeft />}
                </button>
                <div className="text-sm flex items-center ml-4">
                    <ul className="flex gap-2">
                        {pathnames.map((name, index) => {
                            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                            return (
                                <li key={routeTo} className="flex items-center">
                                    {name !== "instantiate" && (
                                        <span className="text-base-content" > &gt; </span>
                                    )}
                                    <Link to={routeTo} className=" text-base-content hover:underline ml-1">{name.charAt(0).toUpperCase() + name.slice(1)}</Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </>
    );
}