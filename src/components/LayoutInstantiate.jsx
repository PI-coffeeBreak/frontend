import Sidebar from "./Sidebar.jsx";
import {Outlet} from "react-router-dom";

export default function LayoutInstantiate(){
    return (
        <div className="w-full min-h-screen p-8">
            <Sidebar/>
            <Outlet />
        </div>
    );
}