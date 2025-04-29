import React from 'react';
import PropTypes from 'prop-types';

/**
 * Renders location suggestions dropdown with loading state and clickable suggestions
 * @param {Array} locationSuggestions - Array of location suggestion objects
 * @param {boolean} isLoadingLocations - Loading state flag
 * @param {Function} handleLocationSelect - Function to handle when a location is selected
 * @returns {JSX.Element|null} The rendered suggestions dropdown or null
 */
export const renderLocationSuggestions = (locationSuggestions, isLoadingLocations, handleLocationSelect) => {
  if (!locationSuggestions.length && !isLoadingLocations) return null;
  
  return (
    <div className="absolute w-full mt-1 bg-base-100 rounded-xl shadow-lg z-50 max-h-60 overflow-auto">
      {isLoadingLocations ? (
        <div className="p-4 text-center">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      ) : (
        locationSuggestions.map((suggestion) => (
          <button
            key={`location-${suggestion.lat}-${suggestion.lon}`}
            type="button"
            className="w-full text-left px-4 py-2 hover:bg-base-200 cursor-pointer"
            onClick={() => handleLocationSelect(suggestion)}
          >
            {suggestion.name}
          </button>
        ))
      )}
    </div>
  );
};

// PropTypes for documentation and validation (even though this is a utility function)
renderLocationSuggestions.propTypes = {
  locationSuggestions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired
    })
  ).isRequired,
  isLoadingLocations: PropTypes.bool.isRequired,
  handleLocationSelect: PropTypes.func.isRequired
};