import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../contexts/ThemeContext.jsx';

export function ColorThemeLayout({ children }) {
  const { colorTheme, loading, error } = useTheme();


  if (loading) {
    return <div>Loading theme...</div>;
  }

  if (error) {
    console.error('Error loading theme:', error);
    // Continue with default theme if there's an error
  }

  // Convert theme colors to CSS variables
  const themeStyles = colorTheme ? {
    '--color-base-100': colorTheme.base_100,
    '--color-base-200': colorTheme.base_200,
    '--color-base-300': colorTheme.base_300,
    '--color-base-content': colorTheme.base_content,
    '--color-primary': colorTheme.primary,
    '--color-primary-content': colorTheme.primary_content,
    '--color-secondary': colorTheme.secondary,
    '--color-secondary-content': colorTheme.secondary_content,
    '--color-accent': colorTheme.accent,
    '--color-accent-content': colorTheme.accent_content,
    '--color-neutral': colorTheme.neutral,
    '--color-neutral-content': colorTheme.neutral_content,
    '--color-info': colorTheme.info,
    '--color-info-content': colorTheme.info_content,
    '--color-success': colorTheme.success,
    '--color-success-content': colorTheme.success_content,
    '--color-warning': colorTheme.warning,
    '--color-warning-content': colorTheme.warning_content,
    '--color-error': colorTheme.error,
    '--color-error-content': colorTheme.error_content,
  } : {};

  return (
    <div style={themeStyles}>
      {children}
    </div>
  );
}

ColorThemeLayout.propTypes = {
  children: PropTypes.node.isRequired,
};