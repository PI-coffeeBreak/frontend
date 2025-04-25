import { NavLink } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState, useCallback } from "react";
import { useEvent } from "../contexts/EventContext";

export default function Home() {
    const { keycloak, initialized } = useKeycloak();
    const { getEventInfo } = useEvent();
    const [hasEvent, setHasEvent] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Use a ref to track if we've already checked for an event
    const [hasCheckedEvent, setHasCheckedEvent] = useState(false);
    
    // Check if user is authenticated and has an event
    useEffect(() => {
        // Only run this once when auth is initialized and not already checked
        if (initialized && !hasCheckedEvent) {
            const checkEvent = async () => {
                if (keycloak.authenticated) {
                    try {
                        // Try to get event info
                        const eventData = await getEventInfo();
                        setHasEvent(!!eventData?.id);
                    } catch (error) {
                        console.log("No event exists or error fetching event:", error);
                        setHasEvent(false);
                    } finally {
                        setIsLoading(false);
                        setHasCheckedEvent(true);
                    }
                } else {
                    setIsLoading(false);
                    setHasCheckedEvent(true);
                }
            };

            checkEvent();
        }
    }, [initialized, keycloak.authenticated, hasCheckedEvent]);

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
                        Plan, Manage, and Elevate Your
                        Events with Ease.
                    </h1>
                    <p className="mt-8 text-lg text-pretty text-light text-base-content sm:text-xl/8">
                        coffeeBreak. makes event management easy. Plan, organize, and run events smoothly, all in one
                        place. Simple tools, smart features, and a seamless experience for great events.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        {isLoading ? (
                            <button className="btn btn-primary rounded-xl" disabled>
                                <span className="loading loading-spinner loading-xs mr-2"></span>
                                    Loading...
                            </button>
                        ) : (
                            <NavLink 
                                to={getStartedPath()}
                                className="btn btn-primary rounded-xl"
                                onClick={handleGetStartedClick}
                            >
                                Get Started
                            </NavLink>
                        )}
                        <NavLink to="https://pi-coffeebreak.github.io/" className="text-sm/6 font-semibold text-gray-900">
                            Learn more <span aria-hidden="true">→</span>
                        </NavLink>
                    </div>
                </div>
            </div>

            <div className="mx-auto w-2/3 py-6 sm:py-12 lg:py-20">
                <div className="text-center">
                    <p className="text-secondary text-lg font-bold ">Manage Events Effortlessly</p>
                    <h2 className="text-black text-4xl font-bold text-balance">Everything you need to plan and run your
                        event seamlessly.</h2>
                    <div className="grid grid-cols-3 gap-12 mt-12">
                        <div className="flex flex-col">
                            <h1 className="text-lg text-left text-primary font-bold">Website Dashboard</h1>
                            <p className="text-lg text-pretty text-left text-base-content">A complete platform to set
                                up, monitor, and collect data from your events.</p>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg text-left text-primary font-bold">Customizable Features</h1>
                            <p className="text-lg text-pretty text-left text-base-content">A variety of additional
                                modules to tailor your event experience the way you want.</p>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg text-left text-primary font-bold">Mobile App</h1>
                            <p className="text-lg text-pretty text-left text-base-content">A seamless extension of your
                                event, reflecting everything configured on the website.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}