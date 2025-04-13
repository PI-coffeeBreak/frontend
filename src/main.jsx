import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).then(
            registration => {
                console.log('Service worker registed successfuly:', registration);
            },
            error => {
                console.log('Fail ao registrar o Service Worker:', error);
            }
        );
    });
}

createRoot(document.getElementById('root')).render(
        <App />
)
