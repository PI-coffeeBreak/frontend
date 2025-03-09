import React from 'react';
import { NavLink } from "react-router-dom";

export default function Navbar() {
    return (
        <div className="navbar bg-neutral shadow-sm rounded-xl">
            <div className="flex-1">
                <NavLink to="/" className="btn btn-ghost text-xl">
                    <img src="/logo.svg" alt="Logo coffeeBreak" width="100" height="50" />
                </NavLink>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal px-1">
                    <li ><NavLink className="btn btn-ghost text-white" to="/develop">Develop</NavLink></li>
                    <li ><NavLink className="btn btn-ghost text-white mr-6"to="/about">About Us</NavLink></li>
                    <li ><NavLink className="btn btn-primary rounded-xl" to="/login">Login</NavLink></li>
                </ul>
            </div>
        </div>
    );
}
