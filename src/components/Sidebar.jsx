import { useState } from "react";
import { Link } from "react-router-dom";
import { VscLayoutSidebarLeft, VscLayoutSidebarLeftOff } from "react-icons/vsc";
import { FaHome, FaUser, FaCalendarAlt } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";


export default function Sidebar() {
    const [isVisible, setIsVisible] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);

    const toggleSidebar = () => {
        setIsVisible(!isVisible);
    };

    return (
        <>
            <div className={`bg-secondary text-white rounded-r-xl min-h-screen fixed top-0 left-0 transition-all duration-300 ${isVisible ? "w-64" : "w-20"}`}>
                <div className={`flex flex-col items-center p-4 ${isVisible ? "gap-4" : "gap-0"}`}>
                    <img src="/stu@deti.png" width="50" height="50" alt="Logo"/>
                    <span className={`overflow-hidden transition-all duration-300 ${isVisible ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
                        <h1 className="font-bold text-lg">students@DETI</h1>
                        <p className="text-md text-base-content">Event</p>
                    </span>
                </div>

                <nav className={`mt-6 ${isVisible ? "px-4" : "px-0"}`}>
                    <ul className="flex flex-col gap-4">
                        <li>
                            <button
                                onClick={() => setOpenMenu(openMenu === 'home' ? null : 'home')}
                                className={`flex ${isVisible ? "items-center gap-3 p-3 justify-between" : "justify-center items-center p-4"} hover:bg-secondary rounded-md transition-all w-full`}
                            >
                                <FaHome className="text-xl" />
                                <span className={`overflow-hidden transition-all duration-300 ${isVisible ? "w-auto opacity-100" : "w-0 opacity-0"}`}>Home</span>
                                {isVisible && <IoIosArrowDown className="text-lg transition-transform duration-300 ml-auto" style={{ transform: openMenu === 'home' ? 'rotate(180deg)' : 'rotate(0deg)' }} />}
                            </button>
                            {openMenu === 'home' && isVisible && (
                                <ul className="ml-6 mt-2 space-y-2">
                                    <li>
                                        <Link to="/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-700 rounded-md">Dashboard</Link>
                                    </li>
                                    <li>
                                        <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-gray-700 rounded-md">Settings</Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                        <li>
                            <Link to="/profile" className={`flex ${isVisible ? "items-center gap-3 p-3" : "justify-center items-center p-4"} hover:bg-secondary rounded-md transition-all`}>
                                <FaUser className="text-xl" />
                                <span className={`overflow-hidden transition-all duration-300 ${isVisible ? "w-auto opacity-100" : "w-0 opacity-0"}`}>Profile</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/events" className={`flex ${isVisible ? "items-center gap-3 p-3" : "justify-center items-center p-4"} hover:bg-secondary rounded-md transition-all`}>
                                <FaCalendarAlt className="text-xl" />
                                <span className={`overflow-hidden transition-all duration-300 ${isVisible ? "w-auto opacity-100" : "w-0 opacity-0"}`}>Events</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>

            <button
                onClick={toggleSidebar}
                className="btn btn-secondary rounded-xl ml-4 fixed top-4 transition-all duration-300"
                style={{
                    left: isVisible ? "16rem" : "5rem",
                }}
            >
                {isVisible ? <VscLayoutSidebarLeftOff /> : <VscLayoutSidebarLeft />}
            </button>
        </>
    );
}