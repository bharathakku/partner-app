'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../app/services/notificationService';
import { routeBasedOrders } from '../app/data/dummyOrders';
import { useOrder } from '../app/contexts/OrderContext';

const OrderReceiving = ({ isOnline, onOrderUpdate }) => {
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [currentOrderPopup, setCurrentOrderPopup] = useState(null);
  const [acceptedOrder, setAcceptedOrder] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);

  const { triggerOrderAlert, resetAudioContext } = useNotification();
  const { acceptOrder } = useOrder();

  // Simulate incoming orders when online
  useEffect(() => {
    if (!isOnline || simulationActive) return;

    const startSimulation = () => {
      setSimulationActive(true);
      
      // Start with first order after 5 seconds
      const firstOrderDelay = 5000;
      setTimeout(() => {
        showNewOrderPopup(routeBasedOrders[0]);
      }, firstOrderDelay);
    };

    // Start simulation after component mount
    const initDelay = setTimeout(startSimulation, 1000);

    return () => {
      clearTimeout(initDelay);
      setSimulationActive(false);
    };
  }, [isOnline]);

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
  }, [isOnline, triggerOrderAlert]);

  const handleOrderAccept = useCallback(() => {
    if (!currentOrderPopup) return;

    // Clear timeout
    if (currentOrderPopup.timeoutId) {
      clearTimeout(currentOrderPopup.timeoutId);
    }

    const acceptedOrder = { ...currentOrderPopup };
    delete acceptedOrder.timeoutId;
    delete acceptedOrder.showTime;

    // Set accepted order
    setAcceptedOrder(acceptedOrder);
    acceptOrder(acceptedOrder);

    // Clear popup
    setCurrentOrderPopup(null);
  }, [currentOrderPopup, acceptOrder]);

  const handleOrderDecline = useCallback(() => {
    if (!currentOrderPopup) return;

    // Clear timeout
    if (currentOrderPopup.timeoutId) {
      clearTimeout(currentOrderPopup.timeoutId);
    }

    setCurrentOrderPopup(null);
  }, [currentOrderPopup]);


  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min ago`;
  };

  const formatDistance = (distance) => {
    return distance || 'N/A';
  };

  const calculateRemainingTime = () => {
    if (!currentOrderPopup?.showTime) return 30;
    const elapsed = (Date.now() - currentOrderPopup.showTime) / 1000;
    return Math.max(0, 30 - Math.floor(elapsed));
  };

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
  }, [currentOrderPopup]);

  // Reset audio context on first interaction
  const handleUserInteraction = () => {
    resetAudioContext();
  };

  if (!isOnline) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-gray-500 text-2xl">📱</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">You're Offline</h3>
          <p className="text-gray-600 mt-2">Turn online to start receiving orders</p>
        </div>
      </div>
    );
  }

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
                  <p className="text-gray-500">Payment</p>
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
