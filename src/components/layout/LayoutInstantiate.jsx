import Sidebar from "../common/Sidebar.jsx";
import { Outlet } from "react-router-dom";

export default function LayoutInstantiate() {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 min-h-screen p-8 ml-20 md:ml-64 transition-all duration-300">
                <Outlet />
            </div>
        </div>
    );
}