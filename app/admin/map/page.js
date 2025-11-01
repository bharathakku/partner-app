'use client'
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw, MapPin, Users, List } from 'lucide-react';

// Dynamically import the map component to avoid SSR issues
const MapWithNoSSR = dynamic(
  () => import('@/components/AdminMap'),
  { ssr: false }
);

export default function AdminMapPage() {
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Unknown';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };
  
  const getStatusBadge = (status) => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium';
    switch(status) {
      case 'online':
        return <span className={`${base} bg-green-100 text-green-700`}>Online</span>;
      case 'offline':
        return <span className={`${base} border border-gray-300 text-gray-700`}>Offline</span>;
      case 'on-delivery':
        return <span className={`${base} bg-blue-100 text-blue-700`}>On Delivery</span>;
      default:
        return <span className={`${base} border border-gray-300 text-gray-700`}>Unknown</span>;
    }
  };

  const [activeTab, setActiveTab] = useState('map');
  const [isLoading, setIsLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const mapRef = useRef(null);

  // Fetch online drivers
  const fetchOnlineDrivers = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching online drivers...');
      const res = await fetch('/api/admin/drivers/online');
      const data = await res.json();
      
      if (res.ok) {
        console.log(`✅ Fetched ${Array.isArray(data) ? data.length : 0} drivers`);
        if (Array.isArray(data)) {
          // Filter out any test data if we're in production
          const realDrivers = process.env.NODE_ENV === 'production' 
            ? data.filter(driver => !driver.id?.startsWith('test-'))
            : data;
          
          console.log(`📊 Setting ${realDrivers.length} drivers to state`);
          setDrivers(realDrivers);
          
          // If we have drivers but none selected, select the first one
          if (realDrivers.length > 0 && !selectedDriver) {
            setSelectedDriver(realDrivers[0]);
          }
        } else {
          console.error('Invalid data format received:', data);
        }
      } else {
        console.error('❌ Failed to fetch drivers:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching drivers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOnlineDrivers();
  }, []);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    // Only setup WebSocket if we have a URL
    if (!process.env.NEXT_PUBLIC_WS_URL) {
      console.warn('WebSocket URL not configured. Real-time updates will not work.');
      return;
    }
    
    console.log('🔌 Connecting to WebSocket...');
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
    
    ws.onopen = () => {
      console.log('✅ Connected to WebSocket');
      ws.send(JSON.stringify({ 
        type: 'admin-connect',
        userId: 'admin-dashboard',
        timestamp: new Date().toISOString()
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📡 WebSocket message received:', data.type);
        
        if (data.type === 'location-update' && data.driver) {
          setDrivers(prevDrivers => {
            const driverId = data.driver._id || data.driver.id;
            if (!driverId) {
              console.warn('Received location update without driver ID');
              return prevDrivers;
            }
            
            const existingDriverIndex = prevDrivers.findIndex(d => 
              (d._id === driverId) || (d.id === driverId)
            );
            
            const updatedDriver = {
              ...data.driver,
              id: driverId,
              lastSeen: new Date().toISOString(),
              // Ensure location data is in the correct format
              location: data.driver.location || {
                type: 'Point',
                coordinates: data.driver.coordinates || [0, 0]
              }
            };
            
            if (existingDriverIndex >= 0) {
              const updatedDrivers = [...prevDrivers];
              updatedDrivers[existingDriverIndex] = {
                ...updatedDrivers[existingDriverIndex],
                ...updatedDriver
              };
              console.log(`🔄 Updated driver ${driverId} location`);
              return updatedDrivers;
            }
            
            console.log(`➕ Added new driver ${driverId} from WebSocket`);
            return [...prevDrivers, updatedDriver];
          });
        }
      } catch (error) {
        console.error('❌ Error processing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        // This will trigger a re-render and reconnect
        setDrivers(prev => [...prev]);
      }, 5000);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleRefresh = () => {
    fetchOnlineDrivers();
  };

  const handleDriverSelect = (driver) => {
    setSelectedDriver(driver);
    if (mapRef.current && driver.location?.coordinates) {
      mapRef.current.flyTo(
        [driver.location.coordinates[1], driver.location.coordinates[0]],
        15
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Partner Tracking</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {isLoading ? 'Loading...' : `${drivers.length} partners online`}
            </span>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>
      {/* Tabs header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid w-[400px] grid-cols-2">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-t ${activeTab==='map' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
            >
              <MapPin className="h-4 w-4" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-t ${activeTab==='list' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
            >
              <List className="h-4 w-4" />
              <span>List View</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'map' && (
          <div className="h-full m-0">
            <div className="h-full relative">
              <div className="h-full w-full relative">
                <MapWithNoSSR 
                  drivers={drivers} 
                  selectedDriver={selectedDriver}
                  onMarkerClick={handleDriverSelect}
                  ref={mapRef}
                />
                <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md z-[1000]">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Online: {drivers.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar with driver list */}
            <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-medium">Online Partners</h3>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {drivers.map(driver => (
                  <div 
                    key={driver._id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${selectedDriver?._id === driver._id ? 'bg-blue-50' : ''}`}
                    onClick={() => handleDriverSelect(driver)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{driver.name || 'Unknown Driver'}</p>
                        <p className="text-sm text-gray-500">{driver.vehicleNumber || 'No vehicle'}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${driver.isOnline ? 'bg-green-100 text-green-700' : 'border border-gray-300 text-gray-700'}`}>
                        {driver.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                ))}
                {drivers.length === 0 && !isLoading && (
                  <div className="p-4 text-center text-gray-500">
                    No partners online
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="h-full m-0">
            <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 h-full">
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Online Partners</h3>
                    <button onClick={handleRefresh} disabled={isLoading} className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 inline-flex items-center">
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2">Driver</th>
                        <th className="py-2">Contact</th>
                        <th className="py-2">Vehicle</th>
                        <th className="py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map((driver) => (
                        <tr 
                          key={driver._id}
                          className={`cursor-pointer hover:bg-gray-50 ${selectedDriver?._id === driver._id ? 'bg-blue-50' : ''}`}
                          onClick={() => handleDriverSelect(driver)}
                        >
                          <td className="py-3 font-medium">
                            <div className="flex flex-col">
                              <span className="font-semibold">{driver.name || 'Unknown Driver'}</span>
                              <span className="text-xs text-gray-500">
                                {driver.vehicleType || 'Driver'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-col">
                              <a href={`tel:${driver.phone}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                                {driver.phone || 'N/A'}
                              </a>
                              <a href={`mailto:${driver.email}`} className="text-xs text-gray-500 hover:underline" onClick={(e) => e.stopPropagation()}>
                                {driver.email || ''}
                              </a>
                            </div>
                          </td>
                          <td>
                            {driver.vehicleNumber ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-gray-300">{driver.vehicleNumber}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="text-right">
                            <div className="flex flex-col items-end">
                              {getStatusBadge(driver.status || (driver.isOnline ? 'online' : 'offline'))}
                              <span className="text-xs text-gray-500 mt-1">
                                {formatLastSeen(driver.lastSeen)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {drivers.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-gray-500">
                            No partners are currently online
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
