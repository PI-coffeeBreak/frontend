import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="w-full min-h-screen p-8">
      <Navbar />
      <Outlet /> {/* Isso garante que as páginas dentro do Layout apareçam */}
    </div>
  );
}