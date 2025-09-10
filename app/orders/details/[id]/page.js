'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, MapPin, Navigation, Clock, IndianRupee,
  Phone, User, Package, CreditCard, Star, Calendar,
  CheckCircle2, XCircle, Route
} from 'lucide-react';
import BottomNav from '../../../../components/BottomNav';

// Dummy order data (would normally come from API or context)
const orderData = {
  'ORD-001': {
    id: 'ORD-001',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98765 43210',
    status: 'completed',
    date: '2024-01-10T14:30:00Z',
    completedAt: '2024-01-10T15:45:00Z',
    earnings: 85,
    distance: '3.2 km',
    estimatedTime: '25 mins',
    actualTime: '32 mins',
    pickupLocation: {
      address: 'MG Road, Bangalore',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      contactPerson: 'Store Manager',
      contactPhone: '+91 80-1234-5678'
    },
    customerLocation: {
      address: 'Koramangala 5th Block, Bangalore',
      coordinates: { lat: 12.9279, lng: 77.6271 },
      landmark: 'Near Forum Mall'
    },
    parcelDetails: {
      type: 'Electronics',
      description: 'Mobile Phone (Samsung Galaxy)',
      weight: '0.5 kg',
      dimensions: '15cm x 8cm x 1cm',
      value: '₹25,000'
    },
    paymentMethod: 'Online',
    rating: 5,
    feedback: 'Very fast delivery! The driver was professional and courteous.',
    timeline: [
      { step: 'Order Received', time: '2024-01-10T14:30:00Z', status: 'completed' },
      { step: 'Pickup Started', time: '2024-01-10T14:35:00Z', status: 'completed' },
      { step: 'Package Collected', time: '2024-01-10T14:50:00Z', status: 'completed' },
      { step: 'Delivery Started', time: '2024-01-10T14:52:00Z', status: 'completed' },
      { step: 'Package Delivered', time: '2024-01-10T15:45:00Z', status: 'completed' }
    ]
  },
  'ORD-002': {
    id: 'ORD-002',
    customerName: 'Priya Patel',
    customerPhone: '+91 98765 43211',
    status: 'completed',
    date: '2024-01-10T12:15:00Z',
    completedAt: '2024-01-10T13:30:00Z',
    earnings: 65,
    distance: '2.8 km',
    estimatedTime: '20 mins',
    actualTime: '28 mins',
    pickupLocation: {
      address: 'Brigade Road, Bangalore',
      coordinates: { lat: 12.9716, lng: 77.6033 },
      contactPerson: 'Restaurant Manager',
      contactPhone: '+91 80-9876-5432'
    },
    customerLocation: {
      address: 'Indiranagar, Bangalore',
      coordinates: { lat: 12.9784, lng: 77.6408 },
      landmark: 'Opposite Metro Station'
    },
    parcelDetails: {
      type: 'Food & Groceries',
      description: 'Restaurant Order (Biryani, Raita, Sweet)',
      weight: '1.2 kg',
      dimensions: '25cm x 20cm x 10cm',
      value: '₹450'
    },
    paymentMethod: 'Cash on Delivery',
    rating: 4,
    feedback: 'Good service, food was warm when delivered.',
    timeline: [
      { step: 'Order Received', time: '2024-01-10T12:15:00Z', status: 'completed' },
      { step: 'Pickup Started', time: '2024-01-10T12:20:00Z', status: 'completed' },
      { step: 'Package Collected', time: '2024-01-10T12:35:00Z', status: 'completed' },
      { step: 'Delivery Started', time: '2024-01-10T12:37:00Z', status: 'completed' },
      { step: 'Package Delivered', time: '2024-01-10T13:30:00Z', status: 'completed' }
    ]
  }
  // Add more order details as needed...
};

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;
  
  const order = orderData[orderId] || {
    id: orderId,
    customerName: 'Unknown Customer',
    status: 'completed',
    date: new Date().toISOString(),
    earnings: 0,
    distance: 'N/A'
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${formatDate(timestamp)} at ${formatTime(timestamp)}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 text-sm">{order.id}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-24 space-y-6">
        {/* Order Status Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(order.status)}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Order {order.status}</h2>
                <p className="text-sm text-gray-600">{formatDateTime(order.date)}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">₹{order.earnings}</p>
              <p className="text-sm text-gray-600">Earnings</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{order.distance}</p>
              <p className="text-sm text-gray-600">Distance</p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">{order.customerName}</span>
            </div>
            {order.customerPhone && (
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">{order.customerPhone}</span>
              </div>
            )}
            {order.rating && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rating:</span>
                <div className="flex items-center gap-2">
                  {renderStars(order.rating)}
                  <span className="text-sm text-gray-600">({order.rating}/5)</span>
                </div>
              </div>
            )}
          </div>
          {order.feedback && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Feedback:</span> "{order.feedback}"
              </p>
            </div>
          )}
        </div>

        {/* Package Details */}
        {order.parcelDetails && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Package Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-900">{order.parcelDetails.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Description:</span>
                <span className="font-medium text-gray-900 text-right">{order.parcelDetails.description}</span>
              </div>
              {order.parcelDetails.weight && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium text-gray-900">{order.parcelDetails.weight}</span>
                </div>
              )}
              {order.parcelDetails.value && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-medium text-gray-900">{order.parcelDetails.value}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <span className={`font-medium ${order.paymentMethod === 'Cash on Delivery' ? 'text-orange-600' : 'text-blue-600'}`}>
                  {order.paymentMethod}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Location Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Route className="w-5 h-5" />
            Location Details
          </h3>
          
          {/* Pickup Location */}
          <div className="mb-4">
            <div className="flex items-start gap-3 mb-2">
              <MapPin className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Pickup Location</h4>
                <p className="text-gray-600">{order.pickupLocation?.address || 'N/A'}</p>
                {order.pickupLocation?.contactPerson && (
                  <p className="text-sm text-gray-500 mt-1">
                    Contact: {order.pickupLocation.contactPerson}
                    {order.pickupLocation.contactPhone && ` (${order.pickupLocation.contactPhone})`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Location */}
          <div>
            <div className="flex items-start gap-3">
              <Navigation className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Delivery Location</h4>
                <p className="text-gray-600">{order.customerLocation?.address || 'N/A'}</p>
                {order.customerLocation?.landmark && (
                  <p className="text-sm text-gray-500 mt-1">
                    Landmark: {order.customerLocation.landmark}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Time Information */}
          {(order.estimatedTime || order.actualTime) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-center">
                {order.estimatedTime && (
                  <div>
                    <p className="text-sm text-gray-600">Estimated Time</p>
                    <p className="font-semibold text-gray-900">{order.estimatedTime}</p>
                  </div>
                )}
                {order.actualTime && (
                  <div>
                    <p className="text-sm text-gray-600">Actual Time</p>
                    <p className="font-semibold text-gray-900">{order.actualTime}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        {order.timeline && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Order Timeline
            </h3>
            <div className="space-y-4">
              {order.timeline.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    item.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.step}</h4>
                        <p className="text-sm text-gray-600">{formatDateTime(item.time)}</p>
                      </div>
                      {item.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
