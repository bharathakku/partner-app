'use client';
import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

// Custom driver icon
const createDriverIcon = (isSelected = false) => {
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        ${isSelected ? `
          <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
        ` : ''}
      </div>
    `,
    className: 'bg-transparent border-none',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const MapContent = forwardRef(({ drivers = [], selectedDriver, onMarkerClick }, ref) => {
  const map = useMap();
  const markersRef = useRef({});
  const [zones, setZones] = useState([]); // [{coordinates:[{lat,lng}], color}]

  // Format last seen time
  const formatLastSeen = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  // Get status color based on driver status
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'on-delivery': return 'bg-blue-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  // Get vehicle icon based on vehicle type
  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType) {
      case 'bike': return '🏍️';
      case 'car': return '🚗';
      case 'scooter': return '🛵';
      default: return '🚚';
    }
  };

  // Expose map methods to parent
  useImperativeHandle(ref, () => ({
    flyTo: (latlng, zoom) => {
      map.flyTo(latlng, zoom, {
        animate: true,
        duration: 1.5
      });
    }
  }));

  // Fit bounds to show all markers
  useEffect(() => {
    if (drivers.length > 0) {
      const bounds = L.latLngBounds(
        drivers
          .filter(driver => driver.location?.coordinates)
          .map(driver => [
            driver.location.coordinates[1],
            driver.location.coordinates[0]
          ])
      );
      
      if (!bounds.isValid()) return;
      
      // Add some padding
      bounds.pad(0.1);
      
      // Only fit bounds if we have more than one location
      if (drivers.length > 1) {
        map.fitBounds(bounds);
      } else if (drivers.length === 1) {
        // For single marker, center on it with a good zoom level
        const driver = drivers[0];
        map.setView(
          [driver.location.coordinates[1], driver.location.coordinates[0]],
          14
        );
      }
    }
  }, [drivers, map]);

  // Update markers when selectedDriver changes
  useEffect(() => {
    if (selectedDriver?.location?.coordinates) {
      const { coordinates } = selectedDriver.location;
      map.flyTo(
        [coordinates[1], coordinates[0]],
        15,
        {
          animate: true,
          duration: 1.5
        }
      );
    }
  }, [selectedDriver, map]);

  // Load zones
  useEffect(() => {
    let mounted = true;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001').replace(/\/+$/, '');
    fetch(base + '/zones')
      .then(r => r.json())
      .then((data) => { if (mounted) setZones(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])); })
      .catch(() => { /* ignore for partner map */ });
    return () => { mounted = false };
  }, []);

  return (
    <>
      {/* Zones overlay (read-only) */}
      {zones.map((z) => {
        const latlngs = (z.coordinates || []).map(c => [c.lat, c.lng]);
        if (latlngs.length < 3) return null;
        return (
          <Polygon
            key={z._id || z.id || JSON.stringify(latlngs)}
            positions={latlngs}
            pathOptions={{ color: z.color || '#3b82f6', weight: 2, fillColor: z.color || '#3b82f6', fillOpacity: 0.15 }}
          />
        );
      })}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {drivers.map(driver => {
        if (!driver.location?.coordinates) return null;
        
        const isSelected = selectedDriver?.id === driver.id;
        const position = [
          driver.location.coordinates[1],
          driver.location.coordinates[0]
        ];
        
        return (
          <Marker
            key={driver.id}
            position={position}
            icon={createDriverIcon(isSelected)}
            eventHandlers={{
              click: () => onMarkerClick(driver)
            }}
          >
            <Popup className="w-72">
              <div className="space-y-3">
                {/* Driver Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img 
                        src={driver.profilePhoto} 
                        alt={driver.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                      <span className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(driver.status)} rounded-full border-2 border-white`}></span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                      <div className="flex items-center mt-0.5">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {driver.vehicleType || 'Driver'}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {getVehicleIcon(driver.vehicleType)} {driver.vehicleNumber || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      driver.status === 'online' ? 'bg-green-100 text-green-800' : 
                      driver.status === 'on-delivery' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.status || 'offline'}
                    </div>
                    {driver.rating > 0 && (
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-xs text-gray-600 ml-0.5">
                          {driver.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">
                          ({driver.totalDeliveries || 0})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Info */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-start text-sm">
                    <svg className="w-4 h-4 mt-0.5 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-gray-700 font-medium">Current Location</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {driver.location?.address || 'Location not available'}
                      </p>
                    </div>
                  </div>

                  {driver.currentOrder && (
                    <div className="mt-2 flex items-start text-sm">
                      <svg className="w-4 h-4 mt-0.5 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <div>
                        <p className="text-gray-700 font-medium">On Delivery</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Order #{driver.currentOrder.orderNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Updated {formatLastSeen(driver.lastSeen)}</span>
                    </div>
                    <div className="flex space-x-1">
                      {driver.phone && (
                        <a 
                          href={`tel:${driver.phone}`}
                          className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          title="Call Driver"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </a>
                      )}
                      <button
                        onClick={() => onMarkerClick(driver)}
                        className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        title="View Details"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
});

MapContent.displayName = 'MapContent';

const AdminMap = ({ drivers = [], selectedDriver, onMarkerClick }, ref) => {
  const mapRef = useRef();
  
  // Forward the ref to the parent component
  useImperativeHandle(ref, () => ({
    flyTo: (latlng, zoom) => {
      if (mapRef.current) {
        mapRef.current.flyTo(latlng, zoom);
      }
    }
  }));

  return (
    <MapContainer
      center={[20.5937, 78.9629]} // Center of India
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <MapContent 
        ref={mapRef}
        drivers={drivers}
        selectedDriver={selectedDriver}
        onMarkerClick={onMarkerClick}
      />
    </MapContainer>
  );
};

export default forwardRef(AdminMap);
