import React, { useMemo } from 'react';
import { FaPalette, FaPuzzlePiece, FaEdit, FaBars, FaFileAlt } from 'react-icons/fa';
import DashboardCard from '../components/DashboardCard';

export default function EventMaker() {
    const cards = useMemo(() => [
        {
            id: 'event-info',
            title: "Event Info",
            description: "Manage your event's basic information.",
            icon: FaEdit,
            path: "edit",
            color: "indigo",
            buttonText: "Edit Event"
        },
        {
            id: 'colors',
            title: "Colors",
            description: "Create a unique visual identity for your event by customizing the color scheme. Choose colors that reflect your brand and create the perfect atmosphere.",
            icon: FaPalette,
            path: "colors",
            color: "fuchsia",
            buttonText: "Customize Colors"
        },
        {
            id: 'menus',
            title: "Menus",
            description: "Design your event's navigation structure. Create, organize, and customize menu items for optimal user experience.",
            icon: FaBars,
            path: "menus",
            color: "cyan",
            buttonText: "Edit Menus"
        },
        {
            id: 'pages',
            title: "Pages",
            description: "Build and manage content pages for your event. Create custom layouts to present information effectively.",
            icon: FaFileAlt,
            path: "pages",
            color: "emerald",
            buttonText: "Manage Pages"
        },
        {
            id: 'choose-plugins',
            title: "Choose Plugins",
            description: "Enhance your event with powerful plugins. Add features you need to create the perfect experience.",
            icon: FaPuzzlePiece,
            path: "choose-plugins",
            color: "amber",
            buttonText: "Manage Plugins"
        }
    ], []);

    return (
        <div className="w-full min-h-svh p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-primary">Event Maker</h1>
                <p className="text-lg text-base-content/70 mb-8">Customize and configure your event with these powerful tools</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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