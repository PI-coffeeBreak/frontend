import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import axiosWithAuth from '../utils/axiosWithAuth';

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

    const api = axiosWithAuth();

    useEffect(() => {
        const fetchColorTheme = async () => {
            try {
                const response = await api.get(`/ui/color-theme/color-theme`);
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

    const value = useMemo(() => ({
        colorTheme,
        loading,
        error,
        refetch: () => {
            setLoading(true);
            fetchColorTheme();
        }
    }), [colorTheme, loading, error]);

    return (
        <ColorThemeContext.Provider value={value}>
            {children}
        </ColorThemeContext.Provider>
    );
}

ColorThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
}; 