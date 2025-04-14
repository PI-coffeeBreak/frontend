import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { ColorThemeLayout } from "./ColorThemeLayout";

function ColorCircle({ color }) {
  return (
    <ColorThemeLayout>
      <span
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          border: '1px solid black',
          backgroundColor: color,
          display: 'inline-block',
          marginRight: '8px'
        }}
      />
    </ColorThemeLayout>
  );
}

ColorCircle.propTypes = {
  color: PropTypes.string.isRequired,
};

export function ColorSelector({ name, value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef(null);

  // Get the selected option
  const selectedOption = options.find(opt => opt.value === value) || options[0];

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
            <ColorCircle color={selectedOption.color} />
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
                  className={`flex items-center p-2 w-full text-left hover:bg-gray-50 ${value === option.value ? 'bg-gray-100' : ''
                    }`}
                  onClick={() => {
                    onChange({ target: { name, value: option.value, type: 'select' } });
                    setIsOpen(false);
                  }}
                >
                  <ColorCircle color={option.color} />
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
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
};