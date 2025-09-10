'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '../../contexts/OrderContext';
import { 
  MapPin, Navigation, Phone, Clock, Package,
  ArrowRight, AlertTriangle, CheckCircle2,
  Store, Timer, IndianRupee, HelpCircle
} from 'lucide-react';
import HelpSupportModal from '../../../components/HelpSupportModal';

export default function PickupLocationPage() {
  const router = useRouter();
  const { currentOrder, updateOrderStatus, ORDER_STATUSES } = useOrder();
  const [reachingLocation, setReachingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Redirect if no current order or wrong status
  useEffect(() => {
    console.log('Pickup Page - Current Order:', currentOrder);
    console.log('Expected Status:', ORDER_STATUSES.ACCEPTED);
    
    if (!currentOrder) {
      console.log('Redirecting to /orders - No current order');
      router.push('/orders');
      return;
    }
    
    // If order is already picked up or completed, redirect to appropriate page
    if (currentOrder.status === ORDER_STATUSES.PICKUP_REACHED) {
      console.log('Redirecting to pickup-complete - Order already reached pickup');
      router.push('/orders/pickup-complete');
      return;
    }
    
    if (currentOrder.status === ORDER_STATUSES.PICKUP_COMPLETE) {
      console.log('Redirecting to customer-location - Pickup already complete');
      router.push('/orders/customer-location');
      return;
    }
    
    if (currentOrder.status === ORDER_STATUSES.COMPLETED) {
      console.log('Redirecting to complete - Order already completed');
      router.push('/orders/complete');
      return;
    }
    
    // Only show pickup page for ACCEPTED status
    if (currentOrder.status !== ORDER_STATUSES.ACCEPTED) {
      console.log('Redirecting to /orders - Invalid status for pickup page');
      router.push('/orders');
      return;
    }
    
    console.log('Pickup page loaded successfully');
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

  const handleReachedLocation = async () => {
    setReachingLocation(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    updateOrderStatus(ORDER_STATUSES.PICKUP_REACHED);
    router.push('/orders/pickup-complete');
  };

  const handleCallSender = () => {
    // In real app, this would make a phone call
    alert(`Calling ${currentOrder.senderName}...`);
  };

  const handleNavigation = () => {
    // In real app, this would open maps app
    const { lat, lng } = currentOrder.pickupLocation.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (!currentOrder) {
    return null; // Will redirect
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20 relative">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-orange-100/30 to-brand-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-brand-100/30 to-orange-100/30 rounded-full blur-3xl"></div>
      {/* Premium Header */}
      <div className="premium-header relative z-10">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Pickup Navigation</h1>
              <p className="text-slate-600 font-medium">Navigate to sender for parcel pickup</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowHelp(true)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                aria-label="Help & Support"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Help</span>
              </button>
              <div className="premium-badge bg-orange-50 border-orange-200 text-orange-700">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2"></div>
                En Route to Pickup
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span>Order Progress</span>
              <span>Step 1 of 3</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full" style={{width: '33%'}}></div>
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
                  <span>Accepted at {formatTime(currentOrder.acceptedAt)}</span>
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

          {/* Customer Info */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
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
              <div className="flex items-center text-slate-700">
                <Navigation className="w-4 h-4 mr-1" />
                <span className="font-medium">{currentOrder.distance}</span>
              </div>
              <p className="text-xs text-slate-500">{currentOrder.estimatedTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Placeholder and Location Info */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Map Placeholder */}
          <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 relative flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-brand-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Interactive map would be here</p>
              <p className="text-xs text-slate-500">Showing route to pickup location</p>
            </div>
            
            {/* Mock Navigation Overlay */}
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-white/90 backdrop-blur rounded-lg px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-brand-500" />
                    <span className="text-sm font-medium text-slate-700">1.2 km away</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-slate-700">6 mins</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                <Store className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">Pickup Location</h3>
                <p className="text-slate-600 mb-2">{currentOrder.pickupLocation.address}</p>
                
                {/* Sender Contact */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCallSender}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Sender</span>
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

      {/* Parcel Details */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
            <Package className="w-5 h-5 mr-2 text-slate-600" />
            Parcel to Pickup
          </h4>
          
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  currentOrder.parcelDetails.fragile ? 'bg-amber-500' : 'bg-green-500'
                }`}></div>
                <span className="font-semibold text-slate-800">
                  {currentOrder.parcelDetails.type}
                </span>
                {currentOrder.parcelDetails.fragile && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                    Fragile
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-slate-600">{currentOrder.parcelDetails.weight}</span>
            </div>
            <p className="text-slate-700 mb-2">{currentOrder.parcelDetails.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <span className="text-xs text-slate-500">Dimensions:</span>
                <p className="font-medium">{currentOrder.parcelDetails.dimensions}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Declared Value:</span>
                <p className="font-medium">₹{currentOrder.parcelDetails.value.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Sender Info */}
          <div className="bg-blue-50 rounded-lg p-3 mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <Store className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">Sender Details</span>
            </div>
            <p className="text-sm font-medium text-slate-800">{currentOrder.senderName}</p>
            <p className="text-xs text-slate-600">{currentOrder.senderPhone}</p>
          </div>

          {/* Delivery Instructions */}
          {currentOrder.deliveryInstructions && (
            <div className="bg-amber-50 rounded-lg p-3 mb-3">
              <h5 className="text-xs font-semibold text-amber-800 mb-1">Special Instructions</h5>
              <p className="text-xs text-amber-700">{currentOrder.deliveryInstructions}</p>
            </div>
          )}
          
          <div className="border-t border-slate-200 pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800">
                {currentOrder.paymentMethod === 'Cash on Delivery' ? 'COD Amount' : 'Parcel Value'}
              </span>
              <div className="flex items-center font-semibold text-slate-800">
                <IndianRupee className="w-4 h-4" />
                <span>{currentOrder.paymentMethod === 'Cash on Delivery' ? currentOrder.codAmount : currentOrder.orderValue}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1 text-sm text-slate-500">
              <span>Payment Method</span>
              <span className="font-medium">{currentOrder.paymentMethod}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-4 pb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">Pickup Instructions</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Verify parcel details with sender before pickup</li>
                <li>• Check parcel condition and confirm order ID</li>
                <li>• Handle fragile items with extra care</li>
                <li>• Keep parcel secure during transport</li>
                <li>• Contact customer if there are any delays</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <HelpSupportModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        currentOrderId={currentOrder?.id}
      />

      {/* Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4">
        <button
          onClick={handleReachedLocation}
          disabled={reachingLocation}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 text-white font-semibold py-4 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
        >
          {reachingLocation ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Confirming Location...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>I've Reached the Pickup Location</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
