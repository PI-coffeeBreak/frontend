import React from 'react';
import { Link } from 'react-router-dom';
import { FaPalette, FaCogs, FaPuzzlePiece } from 'react-icons/fa';

export default function EventMaker() {
    const cards = [
        {
            title: "Colors",
            description: "Create a unique visual identity for your event by customizing the color scheme. Choose colors that reflect your brand and create the perfect atmosphere.",
            icon: FaPalette,
            path: "colors",
            color: "primary",
            buttonText: "Customize Colors"
        },
        {
            title: "Base Configurations",
            description: "Set up the fundamental aspects of your event, including basic information, scheduling preferences, and core functionality.",
            icon: FaCogs,
            path: "base-configurations",
            color: "secondary",
            buttonText: "Configure Event"
        },
        {
            title: "Choose Plugins",
            description: "Enhance your event with powerful plugins. Add features like schedules, alerts, and more to create the perfect experience.",
            icon: FaPuzzlePiece,
            path: "plugins",
            color: "accent",
            buttonText: "Manage Plugins"
        }
    ];

    return (
        <div className="w-full min-h-svh p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-primary">Event Maker</h1>
                <p className="text-lg text-base-content/70 mb-12">Customize and configure your event with these powerful tools</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card, index) => (
                        <Link key={index} to={card.path} className="group">
                            <div className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-[400px] relative overflow-hidden w-full`}>
                                <div className={`absolute top-0 left-0 w-full h-2 bg-${card.color} transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100`}></div>
                                <div className="card-body p-8 flex flex-col h-full">
                                    <div className="flex flex-col items-center text-center flex-grow">
                                        <div className={`w-20 h-20 rounded-full bg-${card.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                            <card.icon className={`text-4xl text-${card.color}`} />
                                        </div>
                                        <h2 className="card-title text-2xl mb-4">{card.title}</h2>
                                        <p className="text-base-content/70 text-lg">{card.description}</p>
                                    </div>
                                    <div className="absolute inset-x-4 bottom-4">
                                        <button className={`btn btn-${card.color} btn-outline w-full`}>{card.buttonText}</button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
} 