import React, { useMemo } from 'react';
import { FaPalette, FaCogs, FaPuzzlePiece } from 'react-icons/fa';
import DashboardCard from '../components/DashboardCard';

export default function EventMaker() {
    const cards = useMemo(() => [
        {
            id: 'colors',
            title: "Colors",
            description: "Create a unique visual identity for your event by customizing the color scheme. Choose colors that reflect your brand and create the perfect atmosphere.",
            icon: FaPalette,
            path: "colors",
            color: "primary",
            buttonText: "Customize Colors"
        },
        {
            id: 'base-config',
            title: "Base Configurations",
            description: "Set up the fundamental aspects of your event, including basic information, scheduling preferences, and core functionality.",
            icon: FaCogs,
            path: "base-configurations",
            color: "secondary",
            buttonText: "Configure Event"
        },
        {
            id: 'plugins',
            title: "Choose Plugins",
            description: "Enhance your event with powerful plugins. Add features like schedules, alerts, and more to create the perfect experience.",
            icon: FaPuzzlePiece,
            path: "plugins",
            color: "accent",
            buttonText: "Manage Plugins"
        }
    ], []);

    return (
        <div className="w-full min-h-svh p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-primary">Event Maker</h1>
                <p className="text-lg text-base-content/70 mb-12">Customize and configure your event with these powerful tools</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card) => (
                        <DashboardCard
                            key={card.id}
                            {...card}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
} 