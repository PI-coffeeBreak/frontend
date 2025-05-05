import React from 'react';
import { NavLink } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { useTranslation } from "react-i18next";

export default function Navbar() {
    const { keycloak } = useKeycloak();
    const { t } = useTranslation();

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
                    <img src="/logo.svg" alt={t('navbar.logoAlt')} width="140" height="90" />
                </NavLink>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal px-1">
                    <li><NavLink className="btn btn-ghost rounded-xl mr-4 text-white hover:btn-secondary" to="/develop">{t('navbar.develop')}</NavLink></li>
                    {keycloak.authenticated ? (
                        <li>
                            <button onClick={handleLogout} className="btn btn-primary rounded-xl">{t('navbar.logout')}</button>
                        </li>
                    ) : (
                        <button onClick={handleLogin} className="btn btn-primary rounded-xl">{t('navbar.login')}</button>
                    )}
                </ul>
            </div>
        </div>
    );
}
