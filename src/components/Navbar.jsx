import React from 'react';
import { NavLink } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";

export default function Navbar() {
    const { keycloak } = useKeycloak();

    const handleLogout = () => {
        keycloak.logout({ redirectUri: window.location.origin });
    };

    const handleLogin = () => {
        keycloak.login({ redirectUri: window.location.origin + '/instantiate' });
    };

    return (
        <div className="navbar bg-secondary shadow-sm rounded-xl">
            <div className="flex-1">
                <NavLink to="/instantiate" className="btn btn-ghost rounded-xl hover:btn-secondary text-xl">
                    <img src="/logo.svg" alt="Logo coffeeBreak" width="140" height="90" />
                </NavLink>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal px-1">
                    <li ><NavLink className="btn btn-ghost rounded-xl text-white hover:btn-secondary" to="/develop">Develop</NavLink></li>
                    <li ><NavLink className="btn btn-ghost rounded-xl text-white mr-6 hover:btn-secondary" to="/about">About Us</NavLink></li>
                    {keycloak.authenticated ? (
                      <li>
                        <button onClick={handleLogout} className="btn btn-primary rounded-xl">Logout</button>
                      </li>
                    ) : (
                        <button onClick={handleLogin} className="btn btn-primary rounded-xl">Login</button>
                    )}
                </ul>
            </div>
        </div>
    );
}
