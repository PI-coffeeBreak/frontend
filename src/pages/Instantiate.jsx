import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaPalette, FaCogs, FaCalendarAlt, FaPuzzlePiece, FaUsers, FaBell } from 'react-icons/fa';
import { useEvent } from '../contexts/EventContext';

export default function Instantiate() {
    const { eventInfo, isLoading } = useEvent();

    const quickLinks = [
        {
            id: 'home',
            title: 'Home',
            description: 'Manage users, sessions, and alerts',
            icon: FaHome,
            links: [
                { label: 'Users', path: 'home/users', icon: FaUsers },
                { label: 'Sessions', path: 'home/sessions', icon: FaCalendarAlt },
                { label: 'Alerts', path: 'home/alerts', icon: FaBell }
            ]
        },
        {
            id: 'event-maker',
            title: 'Event Maker',
            description: 'Customize and configure your event',
            icon: FaPalette,
            links: [
                { label: 'Colors', path: 'eventmaker/colors', icon: FaPalette },
                { label: 'Base Configurations', path: 'eventmaker/base-configurations', icon: FaCogs },
                { label: 'Plugins', path: 'eventmaker/plugins', icon: FaPuzzlePiece }
            ]
        }
    ];

    return (
        <div className="w-full p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-primary">
                    {isLoading ? 'Loading...' : `Welcome to ${eventInfo?.name || 'students@DETI'}`}
                </h1>
                <p className="text-lg text-base-content/70 mb-2">
                    Access all your event management tools from one place
                </p>

                <div className="flex flex-col lg:flex-row gap-12 mt-0">
                    {/* Left side - Mobile preview */}
                    <div className="flex justify-center mt-4">
                        <div className="mockup-phone border-primary scale-70 origin-top">
                            <div className="mockup-phone-camera"></div> 
                            <div className="mockup-phone-display">
                                <iframe 
                                    /*src="http://localhost:5175/app" */
                                    src="instantiate/home"
                                    className="w-full h-full"
                                    title="Mobile Preview"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right side - Quick access links */}
                    <div className="lg:w-1/2">
                        <div className="grid gap-6">
                            {quickLinks.map((section) => (
                                <div key={section.id} className="card bg-base-100 shadow-xl">
                                    <div className="card-body">
                                        <div className="flex items-center gap-3 mb-3">
                                            <section.icon className="text-2xl text-primary" />
                                            <h2 className="card-title">{section.title}</h2>
                                        </div>
                                        <p className="text-base-content/70 mb-4">{section.description}</p>
                                        <div className="grid gap-3">
                                            {section.links.map((link) => (
                                                <Link
                                                    key={link.path}
                                                    to={link.path}
                                                    className="flex items-center gap-3 p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
                                                >
                                                    <link.icon className="text-xl text-primary" />
                                                    <span>{link.label}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 