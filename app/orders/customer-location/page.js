'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '../../contexts/OrderContext';
import { 
  MapPin, Navigation, Phone, Clock, Package,
  ArrowRight, AlertTriangle, CheckCircle2,
  User, Timer, IndianRupee, MessageSquare,
  Home
} from 'lucide-react';

export default function CustomerLocationPage() {
  const router = useRouter();
  const { currentOrder, updateOrderStatus, ORDER_STATUSES } = useOrder();
  const [reachingCustomer, setReachingCustomer] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState('12 mins');

  // Redirect if no current order or wrong status
  useEffect(() => {
    console.log('Customer Location Page - Current Order:', currentOrder);
    console.log('Expected Status:', ORDER_STATUSES.PICKUP_COMPLETE);
    if (!currentOrder || currentOrder.status !== ORDER_STATUSES.PICKUP_COMPLETE) {
      console.log('Redirecting to /orders - Order status mismatch or no order');
      router.push('/orders');
    } else {
      console.log('Customer Location Page loaded successfully');
    }
  }, [currentOrder, router, ORDER_STATUSES]);

  // Simulate getting current location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          // Fallback to demo location
          setCurrentLocation({
            lat: 12.9715,
            lng: 77.6364
          });
        }
      );
    }
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEstimatedArrival(prev => {
        const currentMins = parseInt(prev);
        if (currentMins > 1) {
          return `${currentMins - 1} mins`;
        }
        return '1 min';
      });
    }, 10000); // Update every 10 seconds for demo

    return () => clearInterval(interval);
  }, []);

  const handleReachedCustomer = async () => {
    setReachingCustomer(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update status to customer reached, not completed yet
    updateOrderStatus(ORDER_STATUSES.CUSTOMER_REACHED);
    router.push('/orders/complete');
  };

  const handleCallCustomer = () => {
    // In real app, this would make a phone call
    alert(`Calling ${currentOrder.customerName}...`);
  };

  const handleSendMessage = () => {
    // In real app, this would send a message
    alert('Message sent: "I am on my way with your order!"');
  };

  const handleNavigation = () => {
    // In real app, this would open maps app
    const { lat, lng } = currentOrder.customerLocation.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (!currentOrder || currentOrder.status !== ORDER_STATUSES.PICKUP_COMPLETE) {
    return null; // Will redirect
  }

  // Ensure items is always an array
  const orderItems = currentOrder.items || [];

  const formatTime = (date) => {
    // Handle both Date objects and ISO strings
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 relative">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-100/30 to-green-100/30 rounded-full blur-3xl"></div>
      
      {/* Premium Header */}
      <div className="premium-header relative z-10">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Navigation & Delivery</h1>
              <p className="text-slate-600 font-medium">Navigate to customer for delivery</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="premium-badge bg-blue-50 border-blue-200 text-blue-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                En Route to Customer
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span>Order Progress</span>
              <span>Step 3 of 3</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{width: '90%'}}></div>
            </div>
          </div>
          
          {/* Navigation Stats */}
          <div className="mt-4 flex items-center space-x-6 text-sm text-slate-600">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span className="font-medium">Distance: 2.1 km</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="font-medium">ETA: {estimatedArrival}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span className="font-medium">Order: {currentOrder.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{currentOrder.id}</h3>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>Picked up at {formatTime(currentOrder.pickup_completeAt || new Date())}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-lg font-bold text-success-600">
                <IndianRupee className="w-4 h-4" />
                <span>{currentOrder.partnerEarnings}</span>
              </div>
              <p className="text-xs text-slate-500">Your earnings</p>
            </div>
          </div>

          {/* Delivery Progress */}
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Order picked up successfully</p>
                <p className="text-xs text-green-600">En route to customer location</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Map and Navigation Section */}
      <div className="px-4 pb-4">
        <div className="premium-card overflow-hidden">
          {/* Map Placeholder with Enhanced Design */}
          <div className="h-64 bg-gradient-to-br from-blue-100 via-green-50 to-blue-50 relative flex items-center justify-center">
            {/* Map Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                {Array.from({length: 64}).map((_, i) => (
                  <div key={i} className="border border-slate-300/30"></div>
                ))}
              </div>
            </div>
            
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <p className="text-base font-semibold text-slate-800 mb-1">Navigate to Customer</p>
              <p className="text-sm text-slate-600">Real-time navigation available</p>
            </div>
            
            {/* Enhanced Navigation Stats Overlay */}
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-white/95 backdrop-blur-lg rounded-xl px-4 py-3 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Navigation className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">2.1 km away</p>
                      <p className="text-xs text-slate-500">Current distance</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Timer className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">ETA: {estimatedArrival}</p>
                      <p className="text-xs text-slate-500">Estimated arrival</p>
                    </div>
                  </div>
                </div>
                
                {/* Live Tracking Indicator */}
                <div className="flex items-center justify-center space-x-2 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Live tracking active</span>
                </div>
              </div>
            </div>
            
            {/* Route Simulation */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-gradient-to-r from-blue-500/80 to-green-500/80 rounded-full h-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-3/4 bg-white/50 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-slate-600 text-center mt-1">Route progress: 75% complete</p>
            </div>
          </div>

          {/* Customer Location Details */}
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">Delivery Address</h3>
                <p className="text-slate-600 mb-3">{currentOrder.customerLocation.address}</p>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCallCustomer}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Customer</span>
                  </button>
                  
                  <button
                    onClick={handleSendMessage}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                  
                  <button
                    onClick={handleNavigation}
                    className="flex items-center space-x-2 px-3 py-2 bg-brand-100 text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-200 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Navigate</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
            <User className="w-5 h-5 mr-2 text-slate-600" />
            Customer Details
          </h4>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">
                  {currentOrder.customerName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-slate-800">{currentOrder.customerName}</p>
                <div className="flex items-center space-x-1 text-sm text-slate-600">
                  <Phone className="w-3 h-3" />
                  <span>{currentOrder.customerPhone}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">Payment: {currentOrder.paymentMethod}</p>
              <div className="flex items-center text-sm text-slate-600">
                <IndianRupee className="w-3 h-3" />
                <span>Order value: ₹{currentOrder.orderValue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items Summary */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
            <Package className="w-5 h-5 mr-2 text-slate-600" />
            Order Items ({orderItems.length})
          </h4>
          
          <div className="space-y-2">
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-600">{item.quantity}</span>
                  </div>
                  <span className="text-sm text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <IndianRupee className="w-3 h-3" />
                  <span>{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Instructions */}
      <div className="px-4 pb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">Delivery Instructions</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Call customer when you arrive</li>
                <li>• Verify order details before handover</li>
                <li>• Collect payment if cash on delivery</li>
                <li>• Mark order as completed after delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Updates */}
      <div className="px-4 pb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Navigation className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Live Tracking Active</p>
              <p className="text-sm text-green-700">Customer can track your location in real-time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Action Button */}
      <div className="premium-footer fixed bottom-0 left-0 right-0 relative z-10">
        <div className="px-6 py-4">
          <button
            onClick={handleReachedCustomer}
            disabled={reachingCustomer}
            className="partner-button-primary w-full py-4 text-base font-bold shadow-lg hover:shadow-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-full group-hover:animate-shimmer"></div>
            
            {reachingCustomer ? (
              <div className="relative flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Completing Delivery...</span>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            ) : (
              <div className="relative flex items-center justify-center space-x-3">
                <CheckCircle2 className="w-6 h-6" />
                <span>Reached Customer - Complete Delivery</span>
                <div className="flex items-center space-x-1">
                  <IndianRupee className="w-4 h-4" />
                  <span className="text-sm font-bold">{currentOrder.partnerEarnings}</span>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
