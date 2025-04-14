import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { baseUrl } from '../consts';

const ColorThemeContext = createContext();

export function useColorTheme() {
    const context = useContext(ColorThemeContext);
    if (!context) {
        throw new Error('useColorTheme must be used within a ColorThemeProvider');
    }
    return context;
}

export function ColorThemeProvider({ children }) {
    const [colorTheme, setColorTheme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchColorTheme = async () => {
            try {
                const response = await axios.get(`${baseUrl}/ui/color-theme/color-theme`);
                setColorTheme(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching color theme:', err);
                setError('Failed to load color theme');
            } finally {
                setLoading(false);
            }
        };

        fetchColorTheme();
    }, []);

    const value = {
        colorTheme,
        loading,
        error,
        refetch: () => {
            setLoading(true);
            fetchColorTheme();
        }
    };

    return (
        <ColorThemeContext.Provider value={value}>
            {children}
        </ColorThemeContext.Provider>
    );
}

ColorThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
}; 