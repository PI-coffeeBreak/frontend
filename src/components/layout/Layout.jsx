import { Outlet } from "react-router-dom";
import Navbar from "../home/Navbar.jsx";

export default function Layout() {
  return (
    <div className="w-full min-h-svh p-8">
      <Navbar />
      <Outlet />
    </div>
  );
}