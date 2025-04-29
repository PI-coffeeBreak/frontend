import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * DashboardCard component for displaying feature cards in the dashboard
 */
export default function DashboardCard({ title, description, icon: Icon, path, color, buttonText }) {
    // Map color names to Tailwind classes
    const getColorClasses = (colorName) => {
        const colorMap = {
            'blue': { bg: 'bg-blue-500', text: 'text-blue-500', hover: 'hover:bg-blue-500', border: 'border-blue-500' },
            'red': { bg: 'bg-red-500', text: 'text-red-500', hover: 'hover:bg-red-500', border: 'border-red-500' },
            'green': { bg: 'bg-green-500', text: 'text-green-500', hover: 'hover:bg-green-500', border: 'border-green-500' },
            'yellow': { bg: 'bg-yellow-500', text: 'text-yellow-500', hover: 'hover:bg-yellow-500', border: 'border-yellow-500' },
            'purple': { bg: 'bg-purple-500', text: 'text-purple-500', hover: 'hover:bg-purple-500', border: 'border-purple-500' },
            'pink': { bg: 'bg-pink-500', text: 'text-pink-500', hover: 'hover:bg-pink-500', border: 'border-pink-500' },
            'indigo': { bg: 'bg-indigo-500', text: 'text-indigo-500', hover: 'hover:bg-indigo-500', border: 'border-indigo-500' },
            'teal': { bg: 'bg-teal-500', text: 'text-teal-500', hover: 'hover:bg-teal-500', border: 'border-teal-500' },
            'orange': { bg: 'bg-orange-500', text: 'text-orange-500', hover: 'hover:bg-orange-500', border: 'border-orange-500' },
            'cyan': { bg: 'bg-cyan-500', text: 'text-cyan-500', hover: 'hover:bg-cyan-500', border: 'border-cyan-500' },
            'lime': { bg: 'bg-lime-500', text: 'text-lime-500', hover: 'hover:bg-lime-500', border: 'border-lime-500' },
            'amber': { bg: 'bg-amber-500', text: 'text-amber-500', hover: 'hover:bg-amber-500', border: 'border-amber-500' },
            'emerald': { bg: 'bg-emerald-500', text: 'text-emerald-500', hover: 'hover:bg-emerald-500', border: 'border-emerald-500' },
            'fuchsia': { bg: 'bg-fuchsia-500', text: 'text-fuchsia-500', hover: 'hover:bg-fuchsia-500', border: 'border-fuchsia-500' },
            'rose': { bg: 'bg-rose-500', text: 'text-rose-500', hover: 'hover:bg-rose-500', border: 'border-rose-500' },
            'sky': { bg: 'bg-sky-500', text: 'text-sky-500', hover: 'hover:bg-sky-500', border: 'border-sky-500' },
            'violet': { bg: 'bg-violet-500', text: 'text-violet-500', hover: 'hover:bg-violet-500', border: 'border-violet-500' },
            'brown': { bg: 'bg-amber-700', text: 'text-amber-700', hover: 'hover:bg-amber-700', border: 'border-amber-700' },
            'slate': { bg: 'bg-slate-500', text: 'text-slate-500', hover: 'hover:bg-slate-500', border: 'border-slate-500' },
            'gray': { bg: 'bg-gray-500', text: 'text-gray-500', hover: 'hover:bg-gray-500', border: 'border-gray-500' },
        };
        
        return colorMap[colorName] || colorMap.blue;
    };
    
    const colorClass = getColorClasses(color);
    
    return (
        <Link to={path} className="group h-full">
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full relative overflow-hidden w-full">
                {/* Top border animation */}
                <div className={`absolute top-0 left-0 w-full h-2 ${colorClass.bg} transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100`}></div>
                
                <div className="card-body p-8 flex flex-col items-center text-center h-full">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300`}>
                        <Icon className={`text-4xl ${colorClass.text}`} />
                    </div>
                    
                    <h2 className="card-title text-2xl mb-4">{title}</h2>
                    <p className="text-base-content/70 text-lg mb-8 max-w-2xl flex-grow">{description}</p>
                    
                    <button className={`w-full max-w-xs py-3 px-6 rounded-lg border-2 font-medium ${colorClass.text} ${colorClass.border} hover:text-white ${colorClass.hover} transition-all duration-300`}>
                        {buttonText}
                    </button>
                </div>
            </div>
        </Link>
    );
}

DashboardCard.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    path: PropTypes.string.isRequired,
    color: PropTypes.string,
    buttonText: PropTypes.string.isRequired
};

DashboardCard.defaultProps = {
    color: 'blue'
};