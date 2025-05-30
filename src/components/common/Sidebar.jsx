import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { VscLayoutSidebarLeft, VscLayoutSidebarLeftOff } from "react-icons/vsc";
import { 
  FaHome,
  FaUser, 
  FaSignOutAlt, 
  FaUsers, 
  FaCalendarAlt,
  FaPalette,
  FaPuzzlePiece,
  FaEdit,
  FaFileAlt,
  FaBars,
  FaRocket,
  FaCog,
  FaIcons
} from "react-icons/fa";
import { RiApps2AddLine } from "react-icons/ri";
import DropdownMenu from "./DropdownMenu.jsx";
import { useKeycloak } from "@react-keycloak/web";
import { usePlugins } from "../../contexts/PluginsContext.jsx";
import { useEvent } from "../../contexts/EventContext.jsx";
import { useMedia } from "../../contexts/MediaContext.jsx";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext.jsx";

const Breadcrumbs = ({ pathnames }) => (
  <ul className="flex gap-2">
    {pathnames.map((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
      return (
        <li key={routeTo} className="flex items-center">
          {name !== "instantiate" && (
            <span className="text-base-content"> &gt; </span>
          )}
          <Link to={routeTo} className="text-base-content hover:underline ml-1">
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Link>
        </li>
      );
    })}
  </ul>
);

Breadcrumbs.propTypes = {
    pathnames: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default function Sidebar() {
  const { t } = useTranslation();
  const { keycloak, initialized } = useKeycloak();
  const [isVisible, setIsVisible] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const { plugins } = usePlugins();
  const { eventInfo, isLoading: eventLoading } = useEvent();
  const { getMediaUrl } = useMedia();
  const [imageError, setImageError] = useState(false);
  const navigationRef = useRef(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Fetch user profile from Keycloak when initialized
  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      keycloak
        .loadUserProfile()
        .then((profile) => {
          setUserProfile(profile);
        })
        .catch((error) => {
          console.error("Failed to load user profile:", error);
        });
    }
  }, [keycloak, initialized]);

  useEffect(() => {
    setImageError(false);
  }, [eventInfo]);

  // Extract plugin-related logic
  const enabledPlugins = plugins
    .filter((plugin) => plugin.is_loaded)
    .filter((plugin) => plugin.config_page)
    .map((plugin) => ({
      label: plugin.name,
      path: `plugins/${plugin.title.toLowerCase()}`,
      icon: FaPuzzlePiece
    }));
  const hasEnabledPlugins = enabledPlugins.length > 0;

  const toggleSidebar = () => {
    setIsVisible(!isVisible);
  };

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin + "/" });
  };

  // Extract user display information
  const getUserDisplayInfo = () => {
    const displayName =
      userProfile?.firstName && userProfile?.lastName
        ? `${userProfile.firstName} ${userProfile.lastName}`
        : userProfile?.username || eventInfo?.organizer_name || "User";

    const email =
      userProfile?.email ||
      eventInfo?.organizer_email ||
      keycloak?.tokenParsed?.email ||
      "";

    return { displayName, email };
  };

  // Render event logo
  const renderEventLogo = () => {
    const eventImageUrl = eventInfo?.image_id
      ? getMediaUrl(eventInfo.image_id)
      : null;
    const sizeClass = isVisible ? "w-16 h-16" : "w-10 h-10";

    if (eventImageUrl && !imageError) {
      return (
        <div
          className={`overflow-hidden flex-shrink-0 rounded-xl border-2 border-white shadow-md hover:scale-110 hover:shadow-lg transition-all duration-300 ${sizeClass}`}
          style={{ backgroundColor: theme.accent }}
        >
          <img
            src={`${eventImageUrl}?v=${Date.now()}`}
            alt={eventInfo?.name || "Event"}
            className="w-full h-full object-contain p-1 sidebar-event-image"
            data-event-image
            onError={() => {
              console.error("Failed to load event image");
              setImageError(true);
            }}
          />
        </div>
      );
    }

    return (
      <div
        className={`overflow-hidden flex-shrink-0 rounded-lg bg-base-200 shadow-md border border-base-300 transition-all duration-300 ${sizeClass}`}
      >
        <img
          src="/brown_bean.svg"
          alt="Default Event Logo"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback in case even default image fails to load
            e.target.style.display = "none";
            e.target.parentElement.innerHTML = `<span class="font-bold text-white text-xl flex items-center justify-center h-full bg-gradient-to-br from-primary to-secondary">
                ${
                  eventInfo?.name ? eventInfo.name.charAt(0).toUpperCase() : "E"
                }
            </span>`;
          }}
        />
      </div>
    );
  };

  const renderUserAvatar = () => (
    <div
      className={`flex items-center justify-center bg-primary rounded-full border-2 border-white mx-auto mb-2 
      ${isVisible ? "w-16 h-16" : "w-10 h-10"}`}
    >
      <FaUser className="text-white text-xl" />
    </div>
  );

  const { displayName, email } = getUserDisplayInfo();

  return (
    <>
      <div
        className={`bg-secondary text-white rounded-r-xl p-2 fixed top-0 left-0 transition-all duration-300 flex flex-col h-screen z-50 ${
          isVisible ? "w-64" : "w-20"
        }`}
      >
        {/* Event header */}
        <div className="flex-shrink-0">
          <div
            className={`flex items-center p-4 ${
              isVisible ? "gap-4" : "gap-0"
            }`}
          >
            {renderEventLogo()}
            <span
              className={`overflow-hidden transition-all duration-300 ${
                isVisible ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}
            >
              <h1 className="font-bold text-lg truncate max-w-[180px]">
                {eventLoading ? t('common.actions.loading') : eventInfo?.name || t('event.defaultTitle')}
              </h1>
              <p className="text-md text-base-content">
                {eventInfo?.subtitle || t('event.defaultTitle')}
              </p>
            </span>
          </div>
        </div>

        <div 
          className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
          ref={navigationRef}
        >
          <div className={`mt-6 ${isVisible ? "px-4" : "px-0"}`}>
            {isVisible && (
              <div className="text-xs uppercase text-white/70 font-semibold tracking-wider mb-3 pl-2">
                Main Navigation
              </div>
            )}
            <ul className="flex flex-col gap-4">
              {/* Dashboard button */}
              <li>
                <Link
                  to="/instantiate"
                  className={`btn btn-sm rounded-xl w-full ${
                    location.pathname === "/instantiate" ? "btn-primary" : "btn-ghost"
                  } ${
                    isVisible
                      ? "flex items-center gap-2 justify-start px-3"
                      : "flex items-center justify-center px-1"
                  }`}
                >
                  <FaHome className="text-xl" />
                  {isVisible && <span className="overflow-hidden whitespace-nowrap">Dashboard</span>}
                </Link>
              </li>
              
              {/* Event section */}
              <DropdownMenu
                icon={FaRocket}
                title={t('menu.sections.event.title')}
                isVisible={isVisible}
                basePath="event"
                hasHomepage={true}
                links={[
                  { label: t('menu.sections.event.links.users'), path: "/instantiate/event/users", icon: FaUsers },
                  { label: t('menu.sections.event.links.activities'), path: "/instantiate/event/activities", icon: FaCalendarAlt },
                  { label: t('menu.sections.event.links.eventInfo'), path: "/instantiate/event/info", icon: FaEdit },
                  { label: t('menu.sections.event.links.plugins'), path: "/instantiate/event/plugins", icon: FaPuzzlePiece }
                ]}
              />
              
              {/* Application section */}
              <DropdownMenu
                icon={FaCog}
                title={t('menu.sections.application.title')}
                isVisible={isVisible}
                basePath="application"
                hasHomepage={true}
                links={[
                  { label: t('menu.sections.application.links.pages'), path: "/instantiate/application/pages", icon: FaFileAlt },
                  { label: t('menu.sections.application.links.menus'), path: "/instantiate/application/menus", icon: FaBars },
                  { label: t('menu.sections.application.links.colors'), path: "/instantiate/application/colors", icon: FaPalette },
                  { label: t('menu.sections.application.links.icons'), path: "/instantiate/application/icons", icon: FaIcons },
                ]}
              />
            </ul>
          </div>

          {hasEnabledPlugins && (
            <div className={`mt-6 ${isVisible ? "px-4" : "px-0"}`}>
              {isVisible && (
                <div className="text-xs uppercase text-white/70 font-semibold tracking-wider mb-3 pl-2 flex items-center">
                  <div className="w-6 h-px bg-white/20 mr-2"></div>
                  Extensions
                  <div className="w-6 h-px bg-white/20 ml-2"></div>
                </div>
              )}
              <ul className="flex flex-col gap-4">
                <DropdownMenu
                  icon={RiApps2AddLine}
                  title={t('menu.sections.plugins.title')}
                  isVisible={isVisible}
                  basePath="plugins"
                  hasHomepage={false}
                  links={enabledPlugins}
                  className="rounded-xl"
                />
              </ul>
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="flex-shrink-0 flex flex-col items-center mb-6 px-2 mt-2">
          {renderUserAvatar()}

          {isVisible && (
            <div className="text-center w-full mb-3">
              <p className="font-semibold">{displayName}</p>
              <p className="text-sm text-gray-100">{email}</p>
            </div>
          )}

          {/* Home and Logout buttons */}
          <div className={`flex items-center gap-2 w-full ${!isVisible && 'flex-col'}`}>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary rounded-xl flex items-center justify-center"
            >
              <FaHome className="text-white" />
            </button>

            <button
              onClick={handleLogout}
              className={`btn btn-primary rounded-xl flex items-center justify-center ${isVisible && 'flex-1'}`}
            >
              <FaSignOutAlt className="text-white" />
              {isVisible && <span>{t('menu.actions.logout')}</span>}
            </button>
          </div>
        </div>
      </div>

      <div
        className="flex items-center fixed top-0 left-0 w-full text-white px-4 py-2 z-50 transition-all duration-300 bg-base-100"
        style={{ marginLeft: isVisible ? "16rem" : "5rem" }}
      >
        <button
          onClick={toggleSidebar}
          className="btn btn-secondary rounded-xl transition-all duration-300"
        >
          {isVisible ? <VscLayoutSidebarLeftOff /> : <VscLayoutSidebarLeft />}
        </button>

        <div className="text-sm flex items-center">
          <Breadcrumbs pathnames={pathnames} />
        </div>
      </div>
    </>
  );
}