import React from 'react';
import { NavLink } from "react-router-dom";

export default function Navbar() {
    return (
        <div className="navbar bg-secondary shadow-sm rounded-xl">
            <div className="flex-1">
                <NavLink to="/" className="btn btn-ghost hover:btn-neutral text-xl">
                    <img src="/logo.svg" alt="Logo coffeeBreak" width="140" height="90" />
                </NavLink>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal px-1">
                    <li ><NavLink className="btn btn-ghost text-white hover:btn-neutral" to="/develop">Develop</NavLink></li>
                    <li ><NavLink className="btn btn-ghost text-white mr-6 hover:btn-neutral" to="/about">About Us</NavLink></li>
                    <li ><NavLink className="btn btn-primary rounded-xl" to="/login">Login</NavLink></li>
                </ul>
            </div>
        </div>
    );
}
