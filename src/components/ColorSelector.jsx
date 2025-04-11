import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../contexts/ThemeContext";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export function ColorSelector({ name, value, onChange, options }) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef(null);
  
  // Get the selected option label
  const selectedOption = options.find(opt => opt.value === value) || options[0];
  
  // Function to get color value from theme
  const getColor = (colorKey) => {
    return theme[colorKey] || colorKey;
  };

  // Handle click outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="my-2">      
      <div className="relative" ref={selectorRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white"
        >
          <div className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2 border border-gray-300" 
              style={{ backgroundColor: getColor(value) }}
            />
            <span>{selectedOption.label}</span>
          </div>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="grid grid-cols-1 divide-y divide-gray-100">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`flex items-center p-2 w-full text-left hover:bg-gray-50 ${
                    value === option.value ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => {
                    onChange({ target: { name, value: option.value, type: 'select' } });
                    setIsOpen(false);
                  }}
                >
                  <div 
                    className="w-4 h-4 rounded-full mr-2 border border-gray-300" 
                    style={{ backgroundColor: getColor(option.value) }}
                  />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ColorSelector.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};