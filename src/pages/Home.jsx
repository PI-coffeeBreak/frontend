import { NavLink } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";
import { useEvent } from "../contexts/EventContext";
import { useTranslation } from "react-i18next";

export default function Home() {
    const { keycloak, initialized } = useKeycloak();
    const { getEventInfo } = useEvent();
    const [hasEvent, setHasEvent] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

    // Check if user is authenticated and has an event
    useEffect(() => {
        const checkEvent = async () => {
            if (initialized && keycloak.authenticated) {
                try {
                    // Try to get event info
                    const eventData = await getEventInfo();
                    setHasEvent(!!eventData?.id);
                } catch (error) {
                    console.log("No event exists or error fetching event:", error);
                    setHasEvent(false);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        checkEvent();
    }, [initialized, keycloak.authenticated, getEventInfo]);

    // Determine where to redirect based on auth status and event existence
    const getStartedPath = () => {
        if (!keycloak.authenticated) {
            return "/"; // Will trigger login redirect
        } else if (!hasEvent) {
            return "/setup"; // No event exists, go to setup
        } else {
            return "/instantiate"; // User is logged in and has an event
        }
    };

    // Handle the click for login if needed
    const handleGetStartedClick = (e) => {
        if (!keycloak.authenticated) {
            e.preventDefault();
            
            // We can't know if they have an event before login,
            // so we'll redirect to a special route that checks and redirects
            keycloak.login({ 
                redirectUri: window.location.origin + '/auth-redirect'
            });
        }
    };

    return (
        <>
            <div className="mx-auto w-2/3 py-6 sm:py-12 lg:py-20">
                <div className="text-center">
                    <h1 className="text-5xl font-semibold text-balance text-primary sm:text-7xl">
                        {t('home.title')}
                    </h1>
                    <p className="mt-8 text-lg text-pretty text-light text-base-content sm:text-xl/8">
                        {t('home.subtitle')}
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        {isLoading ? (
                            <button className="btn btn-primary rounded-xl" disabled>
                                <span className="loading loading-spinner loading-xs mr-2"></span>
                                {t('home.loading')}
                            </button>
                        ) : (
                            <NavLink 
                                to={getStartedPath()}
                                className="btn btn-primary rounded-xl"
                                onClick={handleGetStartedClick}
                            >
                                {t('home.getStarted')}
                            </NavLink>
                        )}
                        <NavLink to="https://pi-coffeebreak.github.io/" className="text-sm/6 font-semibold text-gray-900">
                            {t('home.learnMore')} <span aria-hidden="true">→</span>
                        </NavLink>
                    </div>
                </div>
            </div>

            <div className="mx-auto w-2/3 py-6 sm:py-12 lg:py-20">
                <div className="text-center">
                    <p className="text-secondary text-lg font-bold">{t('home.features.title')}</p>
                    <h2 className="text-black text-4xl font-bold text-balance">{t('home.features.subtitle')}</h2>
                    <div className="grid grid-cols-3 gap-12 mt-12">
                        <div className="flex flex-col">
                            <h1 className="text-lg text-left text-primary font-bold">{t('home.features.dashboard.title')}</h1>
                            <p className="text-lg text-pretty text-left text-base-content">{t('home.features.dashboard.description')}</p>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg text-left text-primary font-bold">{t('home.features.customizable.title')}</h1>
                            <p className="text-lg text-pretty text-left text-base-content">{t('home.features.customizable.description')}</p>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg text-left text-primary font-bold">{t('home.features.mobile.title')}</h1>
                            <p className="text-lg text-pretty text-left text-base-content">{t('home.features.mobile.description')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto w-2/3 py-16 sm:py-28 lg:py-36 flex">
                <h1 className="text-black text-4xl font-bold text-balance w-1/2">{t('home.newsletter.title')}</h1>
                <div className="flex-col w-1/2">
                    <div className="flex gap-2 w-full">
                        <input className="text-white w-full bg-secondary pl-4 rounded-xl" placeholder={t('home.newsletter.placeholder')}/>
                        <button className="btn btn-primary rounded-xl p-4">{t('home.newsletter.button')}</button>
                    </div>
                    <p>
                        {t('home.newsletter.privacy.text')}
                        <span className="text-primary font-bold hover:underline">
                            <a href=""> {t('home.newsletter.privacy.link')}</a>
                        </span>
                    </p>
                </div>
            </div>

            <footer className="footer sm:footer-horizontal bg-secondary rounded-xl text-base-content p-10">
                <aside>
                    <img src="/white_bean.svg" alt="giant white bean" width="90" height="90"/>
                    <p>
                        coffeeBreak.
                        <br/>
                        {t('home.footer.tagline')}
                    </p>
                </aside>
                <nav>
                    <h6 className="footer-title">{t('home.footer.services.title')}</h6>
                    <a className="link link-hover">{t('home.footer.services.branding')}</a>
                    <a className="link link-hover">{t('home.footer.services.design')}</a>
                    <a className="link link-hover">{t('home.footer.services.marketing')}</a>
                    <a className="link link-hover">{t('home.footer.services.advertisement')}</a>
                </nav>
                <nav>
                    <h6 className="footer-title">{t('home.footer.company.title')}</h6>
                    <a className="link link-hover">{t('home.footer.company.about')}</a>
                    <a className="link link-hover">{t('home.footer.company.contact')}</a>
                    <a className="link link-hover">{t('home.footer.company.jobs')}</a>
                    <a className="link link-hover">{t('home.footer.company.press')}</a>
                </nav>
                <nav>
                    <h6 className="footer-title">{t('home.footer.legal.title')}</h6>
                    <a className="link link-hover">{t('home.footer.legal.terms')}</a>
                    <a className="link link-hover">{t('home.footer.legal.privacy')}</a>
                    <a className="link link-hover">{t('home.footer.legal.cookies')}</a>
                </nav>
            </footer>
        </>
    );
}