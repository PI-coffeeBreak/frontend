import { useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";

export default function DropdownMenu({ 
    icon: Icon, 
    title, 
    links, 
    isVisible, 
    basePath,
    hasHomepage = true 
}) {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    
    const isActive = (path) => location.pathname.includes(path);
    const sectionActive = basePath ? isActive(basePath) : false;

    const toggleDropdown = () => {
        setOpen(prev => !prev);
    };

    return (
        <li>
            <div className="join w-full">
                {hasHomepage ? (
                    <Link 
                        to={basePath || links[0]?.path || "#"} 
                        className={`join-item flex-1 btn btn-sm ${sectionActive ? 'btn-primary' : 'btn-ghost'} ${
                            isVisible 
                                ? "flex items-center gap-2 justify-start px-3" 
                                : "flex items-center justify-center px-1"
                        }`}
                    >
                        <Icon className="text-xl" />
                        {isVisible && <span className="overflow-hidden whitespace-nowrap">{title}</span>}
                    </Link>
                ) : (
                    <button
                        onClick={toggleDropdown}
                        className={`join-item flex-1 btn btn-sm ${sectionActive ? 'btn-primary' : 'btn-ghost'} ${
                            isVisible 
                                ? "flex items-center gap-2 justify-between px-3"
                                : "flex items-center justify-center px-1"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Icon className="text-xl" />
                            {isVisible && (
                                <span className="overflow-hidden whitespace-nowrap">
                                    {title}
                                </span>
                            )}
                        </div>
                        {isVisible && (
                            <IoIosArrowDown 
                                className={`text-lg transition-transform duration-300 ${open ? 'rotate-180' : ''}`} 
                            />
                        )}
                    </button>
                )}
                
                {/* Only show dropdown toggle if section has homepage and is visible */}
                {hasHomepage && isVisible && (
                    <button
                        onClick={toggleDropdown}
                        className={`join-item btn btn-sm ${sectionActive ? 'btn-primary' : 'btn-ghost'} px-2`}
                        aria-label={`Toggle ${title} dropdown`}
                        aria-expanded={open}
                    >
                        <IoIosArrowDown className={`text-lg transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>
            
            {/* Dropdown content */}
            {isVisible && (
                <div className={`overflow-hidden transition-all duration-300 ${
                    open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}>
                    <ul className="ml-6 mt-2 space-y-2 py-1">
                        {links.map((link) => {
                            const isLinkActive = isActive(link.path);
                            return (
                                <li key={`${title}-${link.path}`}>
                                    <Link 
                                        to={link.path} 
                                        className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                                            isLinkActive 
                                                ? "bg-primary/20 font-medium" 
                                                : "hover:bg-primary/10"
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </li>
    );
}

DropdownMenu.propTypes = {
    icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    links: PropTypes.arrayOf(
        PropTypes.shape({
            path: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    ).isRequired,
    isVisible: PropTypes.bool,
    basePath: PropTypes.string,
    hasHomepage: PropTypes.bool
};

DropdownMenu.defaultProps = {
    isVisible: true,
    basePath: null,
    hasHomepage: true
};