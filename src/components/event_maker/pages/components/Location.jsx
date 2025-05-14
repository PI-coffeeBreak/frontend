import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, Copy, Check, Lock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create a separate component to update the map center when props change
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    // Update the map center when props change
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
}

MapUpdater.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
  zoom: PropTypes.number.isRequired
};

/**
 * Location component for displaying a location on a map
 * This is a simplified version that just displays the location information
 */
export function Location({ 
  address = "Aveiro, Portugal",
  latitude = 40.62338,
  longitude = -8.65784,
  venueTitle = "Event Venue",
  zoom = 13,
  require_auth = false,
  className = "" 
}) {
  const [copied, setCopied] = useState(false);
  
  // Set up Leaflet icon
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);
  
  // Function to handle copying the address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy address:', err));
  };

  // Function to open directions in Google Maps
  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };
  
  // Function to view location in Google Maps
  const viewLocation = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  // The center of the map as [lat, lng]
  const mapCenter = [latitude, longitude];

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Map container */}
      <div className="h-48 relative overflow-hidden">
        {require_auth ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm bg-base-200/70 z-10">
            <Lock size={32} className="text-primary mb-2" />
            <p className="text-center px-4">
              Location details are restricted to registered attendees
            </p>
          </div>
        ) : (
          <>
            <MapContainer 
              center={mapCenter} 
              zoom={zoom} 
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
              attributionControl={false}
            >
              {/* Add the MapUpdater component to handle center updates */}
              <MapUpdater center={mapCenter} zoom={zoom} />
              
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <div className="attribution text-xs text-gray-500 absolute bottom-0 right-0 z-400 bg-white/70 px-1">
                © OpenStreetMap
              </div>
              
              <Marker position={mapCenter}>
                <Popup>{venueTitle}</Popup>
              </Marker>
            </MapContainer>
            
            <div className="absolute bottom-4 right-4 z-500">
              <button 
                onClick={viewLocation}
                className="btn btn-sm btn-primary"
                aria-label="View on map"
              >
                <ExternalLink size={16} className="mr-1" />
                View Map
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Location details */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{venueTitle}</h3>
        
        <div className="flex items-start mb-4">
          <MapPin size={18} className="text-primary mt-1 mr-2 flex-shrink-0" />
          <p className="text-base-content/80">{address}</p>
        </div>
        
        {!require_auth && (
          <div className="flex justify-between mt-4">
            <button 
              onClick={getDirections}
              className="btn btn-outline btn-primary btn-sm"
            >
              <Navigation size={16} className="mr-1" />
              Get Directions
            </button>
            
            <button 
              onClick={copyAddress}
              className="btn btn-ghost btn-sm"
              disabled={copied}
            >
              {copied ? (
                <>
                  <Check size={16} className="mr-1 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-1" />
                  Copy Address
                </>
              )}
            </button>
          </div>
        )}
        
        {require_auth && (
          <div className="mt-4 flex justify-center">
            <button className="btn btn-primary btn-sm">
              Sign in to view location details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

Location.propTypes = {
  address: PropTypes.string,
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  venueTitle: PropTypes.string,
  zoom: PropTypes.number,
  require_auth: PropTypes.bool,
  className: PropTypes.string
};

export default Location;