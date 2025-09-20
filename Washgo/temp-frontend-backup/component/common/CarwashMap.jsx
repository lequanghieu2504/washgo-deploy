// src/component/CarwashMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css'; // Ensure Leaflet CSS is imported
import L from 'leaflet'; // Import Leaflet library

// Fix default icon issue (keep this if needed)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- Component Start ---
function CarwashMap() {
  const [carwashes, setCarwashes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const defaultPosition = [10.762622, 106.660172]; // Default to Ho Chi Minh City

  useEffect(() => {
    const fetchCarwashes = async () => {
      setIsLoading(true);
      setError(null);
      const accessToken = localStorage.getItem('accessToken');
      try {
        const response = await fetch('http://localhost:8080/api/carwashes', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
           const errorText = await response.text();
           throw new Error(`Failed to fetch carwashes: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        setCarwashes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching carwashes:", error);
        setError(error.message || 'Could not fetch carwash data.');
        setCarwashes([]);
      } finally {
          setIsLoading(false);
      }
    };
    fetchCarwashes();
  }, []);

  // Navigate within the app when clicking the marker itself
  const handleMarkerClick = (id) => {
    navigate(`/carwash/${id}`);
  };

  // --- Render Loading State ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border border-gray-200 text-gray-500">
        <i className="fas fa-spinner fa-spin mr-2 text-xl text-[#cc0000]"></i>
        Loading Map...
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
     return (
       <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200 text-red-700 p-4">
         <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
         <p className="font-semibold">Error loading map data.</p>
         <p className="text-sm">{error}</p>
       </div>
     );
  }

  // --- Render Map ---
  return (
    <div className="shadow-lg rounded-lg border border-gray-200 overflow-hidden">
      <MapContainer
         center={defaultPosition}
         zoom={12}
         style={{ height: '400px', width: '100%' }}
         scrollWheelZoom={false}
       >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {carwashes.map((carwash) => {
          const lat = parseFloat(carwash.latitude);
          const lon = parseFloat(carwash.longitude);

          if (!isNaN(lat) && !isNaN(lon)) {
             // Construct Google Maps URL
             const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
             // Alternative URL for searching nearby if preferred:
             // const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

            return (
              <Marker
                key={carwash.id}
                position={[lat, lon]}
                eventHandlers={{
                  // Keep marker click navigating within the app
                  click: () => handleMarkerClick(carwash.id),
                }}
              >
                <Popup>
                  {/* Styled Popup Content */}
                  <div className="text-sm space-y-1"> {/* Added space-y */}
                    <p className="font-semibold text-base">{carwash.carwashName || "Car Wash"}</p>
                    {carwash.location && <p className="text-gray-600">{carwash.location}</p>}

                    {/* Link to Google Maps for directions */}
                    <a
                        href={googleMapsUrl}
                        target="_blank" // Open in new tab
                        rel="noopener noreferrer" // Security best practice
                        onClick={(e) => e.stopPropagation()} // Prevent marker click from firing when clicking link
                        className="inline-flex items-center text-[#cc0000] text-xs font-medium hover:underline pt-1" // Added padding-top
                    >
                       <i className="fas fa-directions mr-1"></i> Get Directions
                    </a>
                    {/* Link to view details within the app */}
                     <span className="block text-gray-400 text-xs pt-1">
                         (Click marker for details)
                     </span>
                  </div>
                </Popup>
              </Marker>
            );
          } else {
            console.warn(`Invalid coordinates for carwash ID ${carwash.id}: lat=${carwash.latitude}, lon=${carwash.longitude}`);
            return null;
          }
        })}
      </MapContainer>
    </div>
  );
}

export default CarwashMap;