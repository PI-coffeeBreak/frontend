import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * DashboardCard component for displaying feature cards in the dashboard
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.description - Card description
 * @param {Function} props.icon - Icon component to be rendered
 * @param {string} props.path - Navigation path for the card
 * @param {('primary'|'secondary'|'accent')} props.color - Color theme for the card
 * @param {string} props.buttonText - Text to display on the card's button
 */
export default function DashboardCard({ title, description, icon: Icon, path, color, buttonText }) {
    return (
        <Link to={path} className="group">
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-[400px] relative overflow-hidden w-full">
                <div className={`absolute top-0 left-0 w-full h-2 bg-${color} transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100`}></div>
                <div className="card-body p-8 flex flex-col h-full">
                    <div className="flex flex-col items-center text-center flex-grow">
                        <div className={`w-20 h-20 rounded-full bg-${color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={`text-4xl text-${color}`} />
                        </div>
                        <h2 className="card-title text-2xl mb-4">{title}</h2>
                        <p className="text-base-content/70 text-lg">{description}</p>
                    </div>
                    <div className="absolute inset-x-4 bottom-4">
                        <button className={`btn btn-${color} btn-outline w-full`}>{buttonText}</button>
                    </div>
                </div>
            </div>
        </Link>
    );
}

DashboardCard.propTypes = {
    /** The title of the card */
    title: PropTypes.string.isRequired,
    /** Detailed description of the feature */
    description: PropTypes.string.isRequired,
    /** Icon component to be rendered */
    icon: PropTypes.elementType.isRequired,
    /** Navigation path when card is clicked */
    path: PropTypes.string.isRequired,
    /** Color theme for the card styling */
    color: PropTypes.oneOf(['primary', 'secondary', 'accent']).isRequired,
    /** Text to display on the card's button */
    buttonText: PropTypes.string.isRequired
}; 