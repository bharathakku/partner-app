'use client';

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function LocationTracker({ driverId, isOnline: propIsOnline = true }) {
  // Use a ref to track the current online status to avoid stale closures
  const isOnlineRef = useRef(propIsOnline);
  const [isOnline, setIsOnline] = useState(propIsOnline);
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const [error, setError] = useState(null);

  // Start tracking location
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    // Request location updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      // Success callback
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const timestamp = new Date().toISOString();
        
        // Get address from coordinates (reverse geocoding)
        let address = 'Location not available';
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          if (data.display_name) {
            address = data.display_name;
          }
        } catch (err) {
          console.error('Error getting address:', err);
        }

        // Update state
        const location = { lat, lng, address, timestamp };
        setLastLocation(location);

        // Send location update through Socket.IO
        if (socketRef.current?.connected) {
          socketRef.current.emit('location:update', {
            driverId,
            lat,
            lng,
            address,
            timestamp
          });
        }
      },
      // Error callback
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to retrieve your location');
      },
      // Options
      {
        enableHighAccuracy: true,
        maximumAge: 10000, // Accept a position whose age is no more than 10 seconds
        timeout: 5000 // Time to wait for a position (5 seconds)
      }
    );
  };

  // Stop tracking location
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Update the ref and state when the prop changes
  useEffect(() => {
    console.log('Online status changed to:', propIsOnline);
    isOnlineRef.current = propIsOnline;
    setIsOnline(propIsOnline);
    
    // If we're going offline, stop tracking location
    if (!propIsOnline && socketRef.current?.connected) {
      console.log('Going offline, stopping location tracking');
      stopTracking();
    }
    
    // If we're coming online, start tracking if we have a connection
    if (propIsOnline && socketRef.current?.connected) {
      console.log('Coming online, starting location tracking');
      startTracking();
    }
  }, [propIsOnline]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!driverId) {
      console.log('Skipping socket connection - missing driverId');
      return;
    }

    console.log('Initializing socket connection...');
    let socket;
    
    try {
      // Ensure we have a clean URL without trailing slashes
      let socketUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001').replace(/\/+$/, '');
      
      // Log the connection attempt with full details
      console.log('Connecting to socket server at:', socketUrl, 'with driverId:', driverId);
      
      // Create socket connection with explicit configuration
      socket = io(socketUrl, {
        // Use the default namespace (empty string)
        path: '/socket.io',
        
        // Transport settings
        transports: ['websocket', 'polling'],
        
        // Reconnection settings
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        
        // Timeout settings
        timeout: 20000,
        
        // Connection settings
        forceNew: true,
        withCredentials: true,
        autoConnect: true,
        rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false,
        
        // Query parameters
        query: {
          driverId: driverId,
          type: 'driver',
          clientType: 'driver-app',
          clientVersion: '1.0.0',
          // Add a timestamp to prevent caching
          _t: Date.now()
        },
        
        // Additional debug information
        extraHeaders: {
          'X-Client-Type': 'driver-app',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      // Debug logging for the socket instance
      console.log('Socket instance created with options:', {
        url: socketUrl,
        path: '/socket.io',
        query: { 
          driverId: driverId, 
          type: 'driver',
          clientType: 'driver-app',
          clientVersion: '1.0.0'
        },
        transports: ['websocket']
      });
      
      // Debug logging
      console.log('Socket instance created with options:', {
        url: socketUrl,
        path: '/socket.io',
        transports: ['websocket'],
        query: { driverId, type: 'driver' }
      });

      // Store the socket reference
      socketRef.current = socket;

      // Connection established
      const handleConnect = () => {
        console.log('Socket.IO connected:', socket.id);
        setIsConnected(true);
        
        // Register this connection as a driver
        socket.emit('driver:register', driverId, (response) => {
          console.log('Driver registration response:', response);
          
          // Send initial status update
          if (isOnlineRef.current) {
            console.log('Sending initial online status');
            socket.emit('status:update', {
              isOnline: true,
              timestamp: new Date().toISOString()
            });
            
            // Start tracking location if we're online
            startTracking();
          } else {
            console.log('Not starting location tracking - not online');
          }
        });
      };

      // Error handling
      const handleError = (error) => {
        console.error('Socket error:', error);
        setError(`Connection error: ${error?.message || 'Unknown error'}`);
      };

      // Handle disconnection
      const handleDisconnect = (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        stopTracking();
        
        // Try to reconnect if not manually disconnected
        if (reason !== 'io client disconnect') {
          console.log('Attempting to reconnect...');
          setTimeout(() => socket.connect(), 5000);
        }
      };

      // Event listeners
      socket.on('connect', handleConnect);
      socket.on('connect_error', handleError);
      socket.on('connect_timeout', () => handleError({ message: 'Connection timeout' }));
      socket.on('error', handleError);
      socket.on('disconnect', handleDisconnect);

      // Connect the socket
      socket.connect();

      // Cleanup function
      return () => {
        console.log('Cleaning up socket connection');
        
        // Send offline status before disconnecting
        if (socketRef.current?.connected) {
          console.log('Sending final offline status');
          socketRef.current.emit('status:update', {
            isOnline: false,
            timestamp: new Date().toISOString()
          });
        }
        
        // Remove all event listeners
        if (socket) {
          socket.off('connect', handleConnect);
          socket.off('connect_error', handleError);
          socket.off('connect_timeout');
          socket.off('error', handleError);
          socket.off('disconnect', handleDisconnect);
          
          // Disconnect if connected
          if (socket.connected) {
            socket.disconnect();
          }
        }
        
        // Clear references
        socketRef.current = null;
        
        // Stop location tracking
        stopTracking();
      };
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
      setError(`Failed to connect: ${error.message}`);
    }
  }, [driverId, isOnline]);

  // Update online status when isOnline prop changes
  useEffect(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('statusUpdate', { 
        driverId, 
        isOnline,
        timestamp: new Date().toISOString()
      });
    }
  }, [isOnline, driverId]);

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Location Tracking</h3>
      
      {error ? (
        <div className="text-red-600 text-sm mb-2">{error}</div>
      ) : (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          
          {lastLocation ? (
            <div className="space-y-1">
              <div>Latitude: {lastLocation.lat.toFixed(6)}</div>
              <div>Longitude: {lastLocation.lng.toFixed(6)}</div>
              <div className="text-gray-600 truncate">
                {lastLocation.address}
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {new Date(lastLocation.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm py-2">
              {isOnline ? 'Waiting for location update...' : 'Location tracking paused (offline)'}
            </div>
          )}
          
          <div className="pt-2 text-xs text-gray-500">
            <p>Connection ID: {isConnected ? socketRef.current?.id : 'Disconnected'}</p>
            <p>Driver ID: {driverId}</p>
          </div>
        </div>
      )}
    </div>
  );
}
