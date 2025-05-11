import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { FaChevronUp, FaChevronDown, FaQuestion, FaSearch } from "react-icons/fa";
import { useMenus } from "../../contexts/MenuContext.jsx";

export function IconSelector({ value, onChange, maxDisplayIcons = 200, onSelectorToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchIconTerm, setSearchIconTerm] = useState("");
  const [selectedLibrary, setSelectedLibrary] = useState("all");
  const [maxIcons, setMaxIcons] = useState(maxDisplayIcons);
  
  // Notify parent when selector is opened/closed
  useEffect(() => {
    if (typeof onSelectorToggle === 'function') {
      onSelectorToggle(isOpen);
    }
  }, [isOpen, onSelectorToggle]);

  // Get icons and helper functions from context
  const { commonIcons, getAllAvailableIcons, getIconComponent, libraryName } = useMenus();
  
  // All available icon libraries - memoized for performance
  const allIconLibraries = useMemo(() => getAllAvailableIcons(), [getAllAvailableIcons]);
  
  // Calculate total icon count
  const totalIconCount = useMemo(() => 
    Object.values(allIconLibraries).reduce((acc, icons) => acc + icons.length, 0),
    [allIconLibraries]
  );
  
  // Reset max icons when search or library changes
  useEffect(() => {
    setMaxIcons(maxDisplayIcons);
  }, [searchIconTerm, selectedLibrary, maxDisplayIcons]);
  
  // Get the current icon component
  const IconComponent = useMemo(() => {
    const component = getIconComponent(value);
    // For debugging uncommon icon issues
    if (component === FaQuestion && value !== "FaQuestion") {
      console.warn(`Icon selector: Component for ${value} not found, using fallback`);
    }
    return component;
  }, [value, getIconComponent]);
  
  // Get filtered icons based on search term and selected library
  const filteredIcons = useMemo(() => {
    let iconsToFilter = [];
    
    // If a specific library is selected, use those icons
    if (selectedLibrary !== "all" && allIconLibraries[selectedLibrary]) {
      iconsToFilter = allIconLibraries[selectedLibrary].map(iconName => {
        return selectedLibrary + '/' + iconName;
      });
    } 
    // If search is empty, use common icons
    else if (!searchIconTerm.trim()) {
      // When no search, show common icons
      iconsToFilter = commonIcons;
    } 
    // Search across all libraries
    else {
      // Search function to find matches across libraries
      const findMatches = () => {
        const searchResults = [];
        const lowerSearchTerm = searchIconTerm.toLowerCase();
        const maxResults = 500; // Limit search results for performance
        
        // Search through each library
        for (const [library, icons] of Object.entries(allIconLibraries)) {
          // Early exit if we've reached our limit
          if (searchResults.length >= maxResults) break;
          
          // Filter icons that match the search term
          const matchingIcons = icons.filter(iconName => {
            const lowerIconName = iconName.toLowerCase();
            return lowerIconName.startsWith(lowerSearchTerm) || 
                   lowerIconName.includes(lowerSearchTerm);
          }).map(iconName => {
            return library + '/' + iconName;
          });
          
          // Sort matches to prioritize "startsWith" over "includes"
          matchingIcons.sort((a, b) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            const aStartsWith = aLower.startsWith(lowerSearchTerm);
            const bStartsWith = bLower.startsWith(lowerSearchTerm);
            
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            return 0;
          });
          
          // Add matches to results, respecting the limit
          searchResults.push(...matchingIcons.slice(0, maxResults - searchResults.length));
        }
        
        return searchResults;
      };
      
      iconsToFilter = findMatches();
    }
    
    // Apply additional filters here if needed (e.g., sorting)
    return iconsToFilter;
  }, [allIconLibraries, commonIcons, searchIconTerm, selectedLibrary]);
  
  // Generate unique IDs for form controls
  const iconSelectorId = React.useId();
  const searchInputId = React.useId();
  const librarySelectId = React.useId();
  
  // Load more icons
  const handleLoadMore = () => {
    setMaxIcons(prev => prev + 100);
  };

  // Update the toggle handler
  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
  };
  
  return (
    <div className="relative mb-4">
      <label 
        htmlFor={iconSelectorId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Icon
      </label>
      
      <div className="relative">
        {/* Main icon selector with current value */}
        <button
          id={iconSelectorId}
          type="button"
          onClick={handleToggle}
          className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-md"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2">
            <span className={`text-lg ${IconComponent === FaQuestion && value !== "FaQuestion" ? 'text-red-500' : ''}`}>
              <IconComponent />
            </span>
            <span className={IconComponent === FaQuestion && value !== "FaQuestion" ? 'text-red-500' : ''}>
              {value || 'Select an icon'}
              {IconComponent === FaQuestion && value !== "FaQuestion" && " (Not found)"}
            </span>
          </div>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        
        {/* Dropdown panel */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-auto">
            <div className="sticky top-0 p-2 bg-white border-b border-gray-200 space-y-2 z-20">
              {/* Search input */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id={searchInputId}
                  type="text"
                  value={searchIconTerm}
                  onChange={(e) => setSearchIconTerm(e.target.value)}
                  placeholder="Search icons..."
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                />
              </div>
              
              {/* Library selector */}
              <div>
                <select
                  id={librarySelectId}
                  value={selectedLibrary}
                  onChange={(e) => setSelectedLibrary(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Icons ({totalIconCount} icons)</option>
                  {Object.entries(allIconLibraries).map(([library, icons]) => (
                    <option key={library} value={library}>
                      {libraryName(library)} ({icons.length} icons)
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Icons count indicator */}
              <div className="text-xs text-gray-500 flex justify-between">
                <span>
                  {searchIconTerm ? `Search results for "${searchIconTerm}"` : "Popular icons"}
                </span>
                <span>
                  {filteredIcons.length > maxIcons 
                    ? `Showing ${maxIcons} of ${filteredIcons.length}` 
                    : `${filteredIcons.length} icons`}
                </span>
              </div>
            </div>
            
            <fieldset className="p-2">
              <legend className="sr-only">Available icons</legend>
              {filteredIcons.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No icons found matching "{searchIconTerm}"
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-2">
                    {filteredIcons.slice(0, maxIcons).map((iconName) => {
                      const IconComp = getIconComponent(iconName);
                      const isIconMissing = IconComp === FaQuestion && iconName !== "fa/FaQuestion";
                      
                      return (
                        <button
                          key={iconName}
                          type="button"
                          className={`flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded-md ${
                            value === iconName ? 'bg-primary/10 border border-primary/30' : ''
                          } ${isIconMissing ? 'border border-red-300 bg-red-50' : ''}`}
                          onClick={() => {
                            onChange(iconName);
                            setIsOpen(false);
                          }}
                          aria-pressed={value === iconName}
                          title={isIconMissing ? `Icon not found: ${iconName}` : iconName}
                        >
                          <span className="text-xl mb-1 min-h-[1.5rem] flex items-center justify-center">
                            <IconComp />
                            {isIconMissing && (
                              <span className="text-xs text-red-500 ml-1">!</span>
                            )}
                          </span>
                          <span className={`text-xs ${isIconMissing ? 'text-red-600' : 'text-gray-600'} truncate w-full text-center`}>
                            {iconName.split('/')[1]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Load more button */}
                  {filteredIcons.length > maxIcons && (
                    <div className="flex justify-center mt-4 pb-2">
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        className="btn btn-sm btn-outline"
                      >
                        Load 100 More Icons
                      </button>
                    </div>
                  )}
                </>
              )}
            </fieldset>
          </div>
        )}
      </div>
    </div>
  );
}

IconSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  maxDisplayIcons: PropTypes.number,
  onSelectorToggle: PropTypes.func // Add this new prop
};

export default IconSelector;