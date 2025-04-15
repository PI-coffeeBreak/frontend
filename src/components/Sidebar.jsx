import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { VscLayoutSidebarLeft, VscLayoutSidebarLeftOff } from "react-icons/vsc";
import { FaHome, FaPen, FaUser, FaSignOutAlt } from "react-icons/fa";
import { RiApps2AddLine } from "react-icons/ri";
import DropdownMenu from "./DropdownMenu.jsx";
import { useKeycloak } from "@react-keycloak/web";
import { usePlugins } from "../contexts/PluginsContext";
import { useEvent } from "../contexts/EventContext";
import { Image } from "./event_maker/pages/components/Image";

export default function Sidebar() {
    const { keycloak, initialized } = useKeycloak();
    const [isVisible, setIsVisible] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);
    const { plugins } = usePlugins();
    const { eventInfo, isLoading: eventLoading } = useEvent();

    
    // Fetch user profile from Keycloak when initialized
    useEffect(() => {
        if (initialized && keycloak.authenticated) {
            keycloak.loadUserProfile()
                .then(profile => {
                    console.log("User profile loaded:", profile);
                    setUserProfile(profile);
                })
                .catch(error => {
                    console.error("Failed to load user profile:", error);
                });
        }
    }, [keycloak, initialized]);

    const hasEnabledPlugins = plugins.some(plugin => plugin.is_loaded);
    const enabledPlugins = plugins.filter(plugin => plugin.is_loaded).map(plugin => ({
        label: plugin.formatted_name,
        path: `plugins/${plugin.name.toLowerCase()}`
    }));

    const toggleSidebar = () => {
        setIsVisible(!isVisible);
    };

    const handleLogout = () => {
        keycloak.logout({ redirectUri: window.location.origin + '/' });
    };

    // Get event logo or use default
    const eventLogo = eventInfo?.logo_id 
        ? <Image src={eventInfo.logo_id} alt="Event Logo" />
        : <img src="/stu@deti.png" width="50" height="50" alt="Logo" />;

    // Get user information, prioritizing Keycloak profile over event info
    const userDisplayName = userProfile?.firstName && userProfile?.lastName 
        ? `${userProfile.firstName} ${userProfile.lastName}`
        : userProfile?.username || eventInfo?.organizer_name || "User";
    
    const userEmail = userProfile?.email || eventInfo?.organizer_email || keycloak?.tokenParsed?.email || "";

    // Replace image with user icon placeholder
    const userAvatar = (
        <div className="flex items-center justify-center bg-primary rounded-full w-16 h-16 border-2 border-white mx-auto mb-2">
            <FaUser className="text-white text-xl" />
        </div>
    );

    return (
        <>
            <div className={`bg-secondary text-white rounded-r-xl p-2 min-h-screen fixed top-0 left-0 transition-all duration-300 flex flex-col justify-between ${isVisible ? "w-64" : "w-20"}`}>
                <div>
                    <div className={`flex items-center p-4 ${isVisible ? "gap-4" : "gap-0"}`}>
                        {eventLogo}
                        <span className={`overflow-hidden transition-all duration-300 ${isVisible ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
                            <h1 className="font-bold text-lg">
                                {eventLoading ? 'Loading...' : (eventInfo?.name || "students@DETI")}
                            </h1>
                            <p className="text-md text-base-content">
                                {eventInfo?.subtitle || "Event"}
                            </p>
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
                                    { label: "Sessions", path: "home/sessions" },
                                ]}
                            />
                            <DropdownMenu
                                icon={FaPen}
                                title="Event Maker"
                                isVisible={isVisible}
                                links={[
                                    { label: "Colors", path: "eventmaker/colors" },
                                    { label: "Menus", path: "eventmaker/menus" },
                                    { label: "Pages", path: "eventmaker/pages" },
                                    { label: "Choose Plugins", path: "eventmaker/choose-plugins" }
                                ]}
                            />
                            {hasEnabledPlugins && (
                                <DropdownMenu
                                    icon={RiApps2AddLine}
                                    title="Plugins"
                                    isVisible={isVisible}
                                    links={enabledPlugins}
                                />
                            )}
                        </ul>
                    </nav>
                </div>
                
                <div className="flex flex-col items-center mb-6 px-2">
                    {userAvatar}
                    
                    {isVisible && (
                        <div className="text-center w-full mb-3">
                            <p className="font-semibold">{userDisplayName}</p>
                            <p className="text-sm text-gray-300">{userEmail}</p>
                        </div>
                    )}

                    <button 
                        onClick={handleLogout} 
                        className={`btn btn-primary rounded-xl mt-2 flex items-center justify-center gap-2 ${isVisible ? "w-full" : "w-12 mx-auto"}`}>
                        <FaSignOutAlt className="text-white" />
                        {isVisible && <span>Logout</span>}
                    </button>
                </div>
            </div>
            <div className="flex items-center fixed top-0 left-0 w-full text-white px-4 py-2 z-50 transition-all duration-300 bg-base-100"
                style={{ marginLeft: isVisible ? "16rem" : "5rem" }}>
                <button
                    onClick={toggleSidebar}
                    className="btn btn-secondary rounded-xl transition-all duration-300"
                >
                    {isVisible ? <VscLayoutSidebarLeftOff /> : <VscLayoutSidebarLeft />}
                </button>

                <div className="text-sm flex items-center ">
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