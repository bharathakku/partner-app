'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '../../contexts/OrderContext';
import { 
  CheckCircle2, Package, Clock, ArrowRight,
  MapPin, Phone, User, AlertCircle,
  Camera, CreditCard, IndianRupee, Star,
  Banknote, Smartphone, Home, Trophy
} from 'lucide-react';
import CameraCapture from '../../../components/CameraCapture';

export default function CompleteOrderPage() {
  const router = useRouter();
  const { currentOrder, completeOrder, processPayment, ORDER_STATUSES } = useOrder();
  const [completingOrder, setCompletingOrder] = useState(false);
  const [paymentCollected, setPaymentCollected] = useState(false);
  const [deliveryPhoto, setDeliveryPhoto] = useState(false);
  const [customerRating, setCustomerRating] = useState(0);
  const [orderCompleted, setOrderCompleted] = useState(false);

  // Redirect if no current order or wrong status
  useEffect(() => {
    if (!currentOrder || currentOrder.status !== ORDER_STATUSES.CUSTOMER_REACHED) {
      router.push('/orders');
    }
  }, [currentOrder, router, ORDER_STATUSES]);

  const handlePaymentCollection = async () => {
    setPaymentCollected(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    processPayment();
  };

  const handleDeliveryImageCaptured = (file, images) => {
    console.log('Delivery photo captured:', file.name);
    setDeliveryPhoto(true);
  };

  const handleDeliveryImageUploaded = (result, images) => {
    console.log('Delivery photo uploaded:', result);
    // Could store upload result to order data here
  };

  const handleCompleteOrder = async () => {
    setCompletingOrder(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    completeOrder();
    setOrderCompleted(true);
    
    // Show success for 2 seconds, then redirect to dashboard to receive next order
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  const canCompleteOrder = () => {
    if (currentOrder?.paymentMethod === 'Cash on Delivery') {
      return paymentCollected && deliveryPhoto;
    }
    return deliveryPhoto;
  };

  if (!currentOrder || currentOrder.status !== ORDER_STATUSES.CUSTOMER_REACHED) {
    return null; // Will redirect
  }

  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-success-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-success-800 mb-3">Order Completed Successfully!</h1>
          <p className="text-success-600 mb-6">Payment has been processed and transferred to your account.</p>
          
          <div className="bg-white rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-success-600 mb-2">
              <IndianRupee className="w-6 h-6" />
              <span>{currentOrder.partnerEarnings}</span>
            </div>
            <p className="text-sm text-slate-600">Earnings added to your account</p>
          </div>
          
          <div className="flex items-center justify-center space-x-1 text-sm text-success-600">
            <Trophy className="w-4 h-4" />
            <span>Great job delivering!</span>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-success-50/20 relative">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-success-100/30 to-green-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-green-100/30 to-success-100/30 rounded-full blur-3xl"></div>
      
      {/* Premium Header */}
      <div className="premium-header relative z-10">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Complete Delivery</h1>
              <p className="text-slate-600 font-medium">Finalize order and collect payment</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="premium-badge bg-success-50 border-success-200 text-success-700">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse mr-2"></div>
                At Customer Location
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span>Order Progress</span>
              <span>Final Step - Complete</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-success-500 to-success-600 h-2 rounded-full" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Arrival Confirmation */}
      <div className="px-4 py-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800">Arrived at Customer Location</h3>
              <p className="text-sm text-green-700">{currentOrder.customerLocation.address}</p>
              <div className="flex items-center space-x-2 text-sm text-green-600 mt-1">
                <Clock className="w-3 h-3" />
                <span>Arrived at {formatTime(currentOrder.customer_reachedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{currentOrder.id}</h3>
                <p className="text-sm text-slate-600">Delivery for {currentOrder.customerName}</p>
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

          {/* Customer Details */}
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
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
                <p className="text-sm font-medium text-slate-700">Total: ₹{currentOrder.orderValue}</p>
                <p className="text-xs text-slate-500">{currentOrder.paymentMethod}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Checklist */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-800 mb-4">Delivery Completion</h4>
          
          <div className="space-y-3">
            {/* Delivery Photo Camera Capture */}
            <div className="border border-slate-200 rounded-lg p-3">
              <CameraCapture
                label="Delivery Confirmation Photo"
                description="Take a photo of order handover to customer"
                required={true}
                onImageCaptured={handleDeliveryImageCaptured}
                onImageUploaded={handleDeliveryImageUploaded}
              />
            </div>

            {/* Payment Collection (Only for COD) */}
            {currentOrder.paymentMethod === 'Cash on Delivery' && (
              <div 
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  paymentCollected 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                }`}
                onClick={handlePaymentCollection}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  paymentCollected 
                    ? 'bg-green-500' 
                    : 'bg-amber-500'
                }`}>
                  {paymentCollected ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <Banknote className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">Collect cash payment</p>
                  <p className="text-sm text-slate-600">₹{currentOrder.orderValue} cash from customer</p>
                </div>
                {!paymentCollected && (
                  <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                    Required
                  </div>
                )}
              </div>
            )}

            {/* UPI Payment Status (Only for UPI) */}
            {currentOrder.paymentMethod === 'UPI' && (
              <div className="flex items-center space-x-3 p-3 rounded-lg border bg-green-50 border-green-200">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">Payment already processed</p>
                  <p className="text-sm text-slate-600">₹{currentOrder.orderValue} paid via UPI</p>
                </div>
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items Summary */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
            <Package className="w-5 h-5 mr-2 text-slate-600" />
            Delivered Items ({currentOrder.items.length})
          </h4>
          
          <div className="space-y-2">
            {currentOrder.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-white px-2 py-1 rounded font-medium text-slate-700">{item.quantity}</span>
                    <span className="text-sm text-slate-800 font-medium">{item.name}</span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <IndianRupee className="w-3 h-3" />
                  <span className="font-medium">{item.price}</span>
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

      {/* Completion Instructions */}
      {!canCompleteOrder() && (
        <div className="px-4 pb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">Complete Required Steps</h4>
                <p className="text-sm text-amber-700">
                  {currentOrder.paymentMethod === 'Cash on Delivery' 
                    ? 'Please collect payment and take delivery photo before completing the order.'
                    : 'Please take a delivery confirmation photo before completing the order.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {canCompleteOrder() && !orderCompleted && (
        <div className="px-4 pb-6">
          <div className="bg-success-50 border border-success-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-success-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-success-800 mb-1">Ready to Complete!</h4>
                <p className="text-sm text-success-700">
                  All requirements met. Complete the order to receive your earnings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4">
        <button
          onClick={handleCompleteOrder}
          disabled={!canCompleteOrder() || completingOrder}
          className="w-full bg-success-500 hover:bg-success-600 disabled:bg-slate-400 text-white font-semibold py-4 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
        >
          {completingOrder ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Completing Order...</span>
            </>
          ) : (
            <>
              <Trophy className="w-5 h-5" />
              <span>Complete Order & Collect Earnings</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
