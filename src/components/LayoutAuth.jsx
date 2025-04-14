import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useEffect } from "react";

export default function Layout() {
    useEffect(() => {
        if (window.particlesJS) {
            window.particlesJS("particles-js", {
                particles: {
                    number: { value: 70, density: { enable: true, value_area: 700 } },
                    color: { value: "#4F2B1D" },
                    shape: {
                        type: "image",
                        image: {
                            src: "/bean_no_background.png",
                            width: 500,
                            height: 500,
                        }
                    },
                    line_linked: {
                        enable: true,
                        color: "#4F2B1D",
                        opacity: 0.8,
                        width: 3
                    },
                    opacity: { value: 0.5, random: false },
                    size: { value: 25, random: true },
                    move: { enable: true, speed: 2, direction: "none", out_mode: "out" }
                },
                interactivity: {
                    events: {
                        onhover: { enable: true, mode: "repulse" },
                        onclick: { enable: true, mode: "push" }
                    },
                    modes: {
                        repulse: { distance: 100 },
                        push: { particles_nb: 4 }
                    }
                },
                retina_detect: true
            });
        }
    }, []);

    return (
        <div className="relative w-full h-screen">
            <div id="particles-js" className="absolute inset-0 z-0"></div>
            <Outlet />
        </div>
    );
}