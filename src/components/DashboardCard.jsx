import React from 'react';
import { Link } from 'react-router-dom';

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