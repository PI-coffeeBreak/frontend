import { useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";

export default function DropdownMenu({ icon: Icon, title, links, isVisible }) {
    const [open, setOpen] = useState(false);

    return (
        <li>
            <button
                onClick={() => setOpen(!open)}
                className={`flex ${isVisible ? "items-center gap-3 p-3 justify-between" : "justify-center items-center p-4"} hover:bg-secondary rounded-md transition-all w-full`}
            >
                <Icon className="text-xl" />
                <span className={`overflow-hidden transition-all duration-300 ${isVisible ? "w-auto opacity-100" : "w-0 opacity-0"}`}>{title}</span>
                {isVisible && <IoIosArrowDown className="text-lg transition-transform duration-300 ml-auto" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />}
            </button>
            {open && isVisible && (
                <ul className="ml-6 mt-2 space-y-2">
                    {links.map((link, index) => (
                        <li key={index}>
                            <Link to={`${link.path}`} className="block px-4 py-2 text-sm hover:bg-primary rounded-md">{link.label}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
}