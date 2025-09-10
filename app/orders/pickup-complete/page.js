'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '../../contexts/OrderContext';
import { 
  CheckCircle2, Package, Clock, ArrowRight,
  MapPin, Phone, Store, AlertCircle,
  Camera, MessageSquare, IndianRupee, Navigation, HelpCircle
} from 'lucide-react';
import HelpSupportModal from '../../../components/HelpSupportModal';
import CameraCapture from '../../../components/CameraCapture';

export default function PickupCompletePage() {
  const router = useRouter();
  const { currentOrder, updateOrderStatus, ORDER_STATUSES } = useOrder();
  const [completingPickup, setCompletingPickup] = useState(false);
  const [verificationSteps, setVerificationSteps] = useState({
    itemsChecked: false,
    orderIdVerified: false,
    photoTaken: false
  });
  const [showHelp, setShowHelp] = useState(false);

  // Redirect if no current order or wrong status
  useEffect(() => {
    if (!currentOrder || currentOrder.status !== ORDER_STATUSES.PICKUP_REACHED) {
      router.push('/orders');
    }
  }, [currentOrder, router, ORDER_STATUSES]);

  const handleVerificationStep = (step) => {
    setVerificationSteps(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  const handleImageCaptured = (file, images) => {
    console.log('Order image captured:', file.name);
    // Auto-mark photo step as complete when image is captured
    setVerificationSteps(prev => ({
      ...prev,
      photoTaken: true
    }));
  };

  const handleImageUploaded = (result, images) => {
    console.log('Order image uploaded:', result);
    // Could store upload result to order data here
  };

  const handleCompletePickup = async () => {
    setCompletingPickup(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Updating order status to PICKUP_COMPLETE and navigating to customer-location');
    updateOrderStatus(ORDER_STATUSES.PICKUP_COMPLETE);
    router.push('/orders/customer-location');
  };

  const handleCallCustomer = () => {
    // In real app, this would make a phone call
    alert(`Calling ${currentOrder.customerName}...`);
  };

  const allStepsCompleted = Object.values(verificationSteps).every(step => step);

  if (!currentOrder || currentOrder.status !== ORDER_STATUSES.PICKUP_REACHED) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20 relative">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-amber-100/30 to-orange-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-100/30 to-amber-100/30 rounded-full blur-3xl"></div>
      {/* Premium Header */}
      <div className="premium-header relative z-10">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Pickup Verification</h1>
              <p className="text-slate-600 font-medium">Verify order details and complete pickup</p>
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
              <div className="premium-badge bg-amber-50 border-amber-200 text-amber-700">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-2"></div>
                At Pickup Location
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span>Order Progress</span>
              <span>Step 2 of 3</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full" style={{width: '66%'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Confirmation */}
      <div className="px-4 py-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800">Arrived at Pickup Location</h3>
              <p className="text-sm text-green-700">{currentOrder.pickupLocation.address}</p>
              <div className="flex items-center space-x-2 text-sm text-green-600 mt-1">
                <Clock className="w-3 h-3" />
                <span>Arrived at {formatTime(currentOrder.pickup_reachedAt || new Date())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details - Mobile Optimized */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          {/* Order Header - Compact Layout */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">{currentOrder.id}</h3>
                <p className="text-xs text-slate-600">{currentOrder.customerName}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-lg font-bold text-success-600">
                <IndianRupee className="w-3 h-3" />
                <span className="text-sm">{currentOrder.partnerEarnings}</span>
              </div>
              <p className="text-xs text-slate-500">Earnings</p>
            </div>
          </div>

          {/* Customer & Delivery Info - More Compact */}
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2 flex-1">
                <MapPin className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-800 mb-1">Deliver to:</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{currentOrder.customerLocation.address}</p>
                </div>
              </div>
            </div>
            
            {/* Contact & Distance Row */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-600">{currentOrder.customerPhone}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Navigation className="w-3 h-3 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">{currentOrder.distance}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-800 mb-4">Pickup Verification</h4>
          
          <div className="space-y-3">
            {/* Check Items */}
            <div 
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                verificationSteps.itemsChecked 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
              onClick={() => handleVerificationStep('itemsChecked')}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                verificationSteps.itemsChecked 
                  ? 'bg-green-500' 
                  : 'bg-slate-300'
              }`}>
                {verificationSteps.itemsChecked && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">Verify all items are packed</p>
                <p className="text-sm text-slate-600">Check against order list</p>
              </div>
            </div>

            {/* Verify Order ID */}
            <div 
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                verificationSteps.orderIdVerified 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
              onClick={() => handleVerificationStep('orderIdVerified')}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                verificationSteps.orderIdVerified 
                  ? 'bg-green-500' 
                  : 'bg-slate-300'
              }`}>
                {verificationSteps.orderIdVerified && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">Confirm Order ID with staff</p>
                <p className="text-sm text-slate-600">Order #{currentOrder.id}</p>
              </div>
            </div>

            {/* Take Photo */}
            <div 
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                verificationSteps.photoTaken 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
              onClick={() => handleVerificationStep('photoTaken')}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                verificationSteps.photoTaken 
                  ? 'bg-green-500' 
                  : 'bg-slate-300'
              }`}>
                {verificationSteps.photoTaken ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Camera className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">Take photo of order</p>
                <p className="text-sm text-slate-600">For delivery confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Capture Section */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <CameraCapture
            label="Order Verification Photo"
            description="Take a photo of the complete order package for delivery confirmation"
            required={true}
            onImageCaptured={handleImageCaptured}
            onImageUploaded={handleImageUploaded}
          />
        </div>
      </div>

      {/* Order Items List */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
            <Package className="w-5 h-5 mr-2 text-slate-600" />
            Order Items ({orderItems.length})
          </h4>
          <div className="space-y-2">
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border">
                    <span className="text-sm font-semibold text-slate-700">{item.quantity}</span>
                  </div>
                  <span className="text-slate-800 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center text-slate-700">
                  <IndianRupee className="w-3 h-3" />
                  <span className="text-sm font-medium">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-slate-200 pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Total Order Value</span>
              <div className="flex items-center font-bold text-slate-800">
                <IndianRupee className="w-4 h-4" />
                <span>{currentOrder.orderValue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Contact */}
      <div className="px-4 pb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Customer Information</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">{currentOrder.customerName}</p>
              <p className="text-sm text-blue-700">{currentOrder.customerPhone}</p>
            </div>
            <button
              onClick={handleCallCustomer}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* Completion Note */}
      {!allStepsCompleted && (
        <div className="px-4 pb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">Complete Verification</h4>
                <p className="text-sm text-amber-700">
                  Please complete all verification steps before starting delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <HelpSupportModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        currentOrderId={currentOrder?.id}
      />

      {/* Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4">
        <button
          onClick={handleCompletePickup}
          disabled={!allStepsCompleted || completingPickup}
          className="w-full bg-success-500 hover:bg-success-600 disabled:bg-slate-400 text-white font-semibold py-4 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
        >
          {completingPickup ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Starting Delivery...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Pickup Complete - Start Delivery</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
