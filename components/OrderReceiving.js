'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotification } from '../app/services/notificationService';
import { useOrder } from '../app/contexts/OrderContext';
import { useProfile } from '../app/contexts/ProfileContext';
import { connectSocket, joinDriverRoom, leaveDriverRoom, onOrderAssigned } from '../lib/socket';
import { ordersService } from '../lib/api/apiClient';

const OrderReceiving = ({ isOnline, onOrderUpdate }) => {
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [currentOrderPopup, setCurrentOrderPopup] = useState(null);
  const [acceptedOrder, setAcceptedOrder] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);

  const { profileData } = useProfile();
  const driverId = useMemo(() => (
    profileData?.account?.partnerId && profileData.account.partnerId !== '—'
      ? profileData.account.partnerId
      : null
  ), [profileData]);
  const { triggerOrderAlert, resetAudioContext } = useNotification();
  const { acceptOrder } = useOrder();

  // Define decline handler first to avoid TDZ in dependencies
  const handleOrderDecline = useCallback(() => {
    if (!currentOrderPopup) return;

    // Clear timeout
    if (currentOrderPopup.timeoutId) {
      clearTimeout(currentOrderPopup.timeoutId);
    }

    setCurrentOrderPopup(null);
  }, [currentOrderPopup]);

  const showNewOrderPopup = useCallback(async (order) => {
    if (!isOnline) return;

    // Trigger notification alerts
    await triggerOrderAlert(order);
    
    // Show popup
    setCurrentOrderPopup({
      ...order,
      showTime: Date.now(),
      timeoutId: setTimeout(() => {
        // Auto-dismiss after 30 seconds
        handleOrderDecline();
      }, 30000)
    });
  }, [isOnline, triggerOrderAlert, handleOrderDecline]);

  // Real-time socket hookup and fallback polling (after showNewOrderPopup is defined)
  useEffect(() => {
    if (!driverId) return;
    
    let isMounted = true;
    let timer;
    let socketConnected = false;
    let socketRetryCount = 0;
    const MAX_RETRIES = 3;
    const POLL_INTERVAL = 30000; // 30 seconds
    
    // Connect to socket
    const setupSocket = () => {
      try {
        const sock = connectSocket();
        if (sock && sock.connected) {
          socketConnected = true;
          socketRetryCount = 0;
          console.log('WebSocket connected, using real-time updates');
          
          // Clear any existing polling
          if (timer) {
            clearInterval(timer);
            timer = null;
          }
          
          // Join driver room to receive assignments
          joinDriverRoom(driverId);
          
          // Handle socket disconnection
          sock.on('disconnect', () => {
            socketConnected = false;
            console.log('WebSocket disconnected, falling back to polling');
            startPolling();
          });
          
          // Handle reconnection attempts
          sock.on('reconnect_attempt', () => {
            console.log('Attempting to reconnect WebSocket...');
          });
          
          // Handle reconnection failure
          sock.on('reconnect_failed', () => {
            console.error('WebSocket reconnection failed');
            socketConnected = false;
            startPolling();
          });
        } else {
          throw new Error('Socket not connected');
        }
        return sock;
      } catch (error) {
        console.error('WebSocket connection error:', error);
        socketConnected = false;
        if (socketRetryCount < MAX_RETRIES) {
          socketRetryCount++;
          console.log(`Retrying WebSocket connection (${socketRetryCount}/${MAX_RETRIES})...`);
          setTimeout(setupSocket, 2000 * socketRetryCount); // Exponential backoff
        } else {
          console.log('Max WebSocket retries reached, falling back to polling');
          startPolling();
        }
        return null;
      }
    };
    
    // Start polling for orders
    const startPolling = () => {
      if (timer) return; // Already polling
      console.log('Starting order polling...');
      
      // Initial fetch
      pollAssigned();
      
      // Set up interval for polling
      timer = setInterval(pollAssigned, POLL_INTERVAL);
    };
    
    // Poll for assigned orders
    const pollAssigned = async () => {
      if (!isMounted) return;
      
      try {
        const res = await ordersService.getAssignedForMe();
        if (res?.success && isMounted) {
          const arr = Array.isArray(res.data) ? res.data : [];
          // Show the newest assigned order if no popup active
          if (arr.length > 0 && !currentOrderPopup) {
            const latest = arr[0];
            const order = {
              id: latest._id,
              customerName: 'New Booking',
              partnerEarnings: latest.price ?? 0,
              distance: (latest.distanceKm ?? 0) + ' km',
              pickupLocation: { address: latest?.from?.address || '—' },
              customerLocation: { address: latest?.to?.address || '—' },
              parcelDetails: { description: `${latest.vehicleType || ''}`.trim() || 'Delivery' },
              orderTime: latest.createdAt,
              paymentMethod: 'Cash on Delivery',
            };
            await showNewOrderPopup(order);
          }
        }
      } catch {}
      timer = setTimeout(pollAssigned, 10000);
    }
    pollAssigned();

    // Set up socket connection
    const sock = setupSocket();
    
    // If socket connection failed, start polling
    if (!socketConnected) {
      startPolling();
    }
    
    // Handle assignment push
    const off = onOrderAssigned(async (payload) => {
      if (!isMounted) return;
      
      // If we were polling, stop the polling since we have a working socket connection
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      
      // Normalize payload for UI
      const order = {
        id: payload.orderId,
        customerName: 'New Booking',
        partnerEarnings: payload.price ?? 0,
        distance: (payload.distanceKm ?? 0) + ' km',
        pickupLocation: { address: payload?.from?.address || '—' },
        customerLocation: { address: payload?.to?.address || '—' },
        parcelDetails: { description: `${payload.vehicleType || ''}`.trim() || 'Delivery' },
        orderTime: new Date(payload.at || Date.now()).toISOString(),
        paymentMethod: 'Cash on Delivery',
      };
      
      await showNewOrderPopup(order);
      if (isMounted) {
        setIncomingOrders(prev => [payload, ...prev]);
      }
    });

    // Clean up
    return () => {
      isMounted = false;
      off?.();
      if (timer) clearInterval(timer);
      if (sock?.connected) sock.disconnect();
      console.log('OrderReceiving cleanup complete');
    };
  }, [driverId, showNewOrderPopup, currentOrderPopup]);

  const handleOrderAccept = useCallback(async () => {
    if (!currentOrderPopup) return;

    // Clear timeout
    if (currentOrderPopup.timeoutId) {
      clearTimeout(currentOrderPopup.timeoutId);
    }

    // Backend accept
    try {
      await ordersService.updateOrderStatus(currentOrderPopup.id, 'accepted');
    } catch {}

    // Fetch full order to get customer phone and precise locations
    let full = null;
    try {
      // use underlying client to get raw order with attached customer
      full = await ordersService.client.get(`/orders/${currentOrderPopup.id}`);
    } catch {}

    const accepted = { ...currentOrderPopup };
    if (full) {
      const coordsFrom = Array.isArray(full?.from?.location?.coordinates) ? full.from.location.coordinates : [];
      const [fromLng, fromLat] = coordsFrom;
      accepted.customerName = full?.customer?.name || accepted.customerName || 'Customer';
      accepted.customerPhone = full?.customer?.phone || '—';
      accepted.pickupLocation = {
        address: full?.from?.address || accepted?.pickupLocation?.address || '—',
        coordinates: (Number.isFinite(fromLat) && Number.isFinite(fromLng)) ? { lat: fromLat, lng: fromLng } : undefined,
      };
      accepted.customerLocation = {
        address: full?.to?.address || accepted?.customerLocation?.address || '—',
      };
      accepted.partnerEarnings = Number(full?.price ?? accepted.partnerEarnings ?? 0);
      accepted.distance = `${Number(full?.distanceKm ?? 0)} km`;
    }
    delete accepted.timeoutId;
    delete accepted.showTime;

    setAcceptedOrder(accepted);
    acceptOrder(accepted);
    setCurrentOrderPopup(null);
  }, [currentOrderPopup, acceptOrder]);

  // moved earlier


  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min ago`;
  };

  const formatDistance = (distance) => {
    return distance || 'N/A';
  };

  const calculateRemainingTime = useCallback(() => {
    if (!currentOrderPopup?.showTime) return 30;
    const elapsed = (Date.now() - currentOrderPopup.showTime) / 1000;
    return Math.max(0, 30 - Math.floor(elapsed));
  }, [currentOrderPopup]);

  const [remainingTime, setRemainingTime] = useState(30);

  useEffect(() => {
    if (!currentOrderPopup) {
      setRemainingTime(30);
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime(calculateRemainingTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [currentOrderPopup, calculateRemainingTime]);

  // Reset audio context on first interaction
  const handleUserInteraction = () => {
    resetAudioContext();
  };

  if (!isOnline) return null;

  return (
    <div onClick={handleUserInteraction}>
      {/* Order Popup */}
      {currentOrderPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 transform animate-pulse-scale">
            {/* Header with Timer */}
            <div className="p-4 rounded-t-2xl flex justify-between items-center bg-green-500">
              <div className="text-white">
                <h2 className="font-bold text-lg">📦 New Order</h2>
                <p className="text-sm opacity-90">{formatTimeAgo(currentOrderPopup.orderTime)}</p>
              </div>
              <div className="text-white text-right">
                <div className={`text-2xl font-bold ${remainingTime <= 10 ? 'animate-pulse text-red-200' : ''}`}>
                  {remainingTime}s
                </div>
                <p className="text-xs opacity-75">to respond</p>
              </div>
            </div>


            {/* Order Details */}
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">{currentOrderPopup.customerName}</h3>
                  <p className="text-gray-600 text-sm">{currentOrderPopup.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">₹{currentOrderPopup.partnerEarnings}</p>
                  <p className="text-sm text-gray-500">earnings</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">📍</span>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">Pickup</p>
                    <p className="text-gray-600">{currentOrderPopup.pickupLocation.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">🎯</span>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">Delivery</p>
                    <p className="text-gray-600">{currentOrderPopup.customerLocation.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm bg-gray-50 p-3 rounded-lg">
                <div className="text-center">
                  <p className="text-gray-500">Distance</p>
                  <p className="font-semibold">{formatDistance(currentOrderPopup.distance)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Time</p>
                  <p className="font-semibold">{currentOrderPopup.estimatedTime}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Payment</p>
                  <p className="font-semibold">{currentOrderPopup.paymentMethod === 'Cash on Delivery' ? 'COD' : 'Online'}</p>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Items:</span> {currentOrderPopup.parcelDetails.description}
                </p>
                {currentOrderPopup.deliveryInstructions && (
                  <p className="text-sm text-yellow-700 mt-1">
                    <span className="font-medium">Note:</span> {currentOrderPopup.deliveryInstructions}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 flex gap-3">
              <button
                onClick={handleOrderDecline}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleOrderAccept}
                className="flex-1 py-3 px-4 text-white rounded-xl font-semibold transition-colors bg-green-500 hover:bg-green-600"
              >
                Accept Order
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Listening for Orders indicator */}
      {!currentOrderPopup && simulationActive && (
        <div className="fixed top-4 left-4 right-4 bg-green-100 border border-green-300 rounded-lg p-3 z-30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-green-800 font-medium">Listening for orders...</p>
            <div className="ml-auto text-sm text-green-600">
              {acceptedOrder ? '1 order received' : 'Waiting for orders...'}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-pulse-scale {
          animation: pulse-scale 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default OrderReceiving;
