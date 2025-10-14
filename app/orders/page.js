'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '../contexts/OrderContext';
import { 
  MapPin, Navigation, History,
  Search, Star, Package, HelpCircle
} from 'lucide-react';
import BottomNav from '../../components/BottomNav';
import HelpSupportModal from '../../components/HelpSupportModal';
import { isSubscriptionActive, getStoredSubscriptionForUser } from '../../lib/subscription';

export default function OrdersPage() {
  const router = useRouter();
  const { currentOrder, ORDER_STATUSES, partnerBalance, totalEarningsToday, completedOrdersToday, orderHistory } = useOrder();
  
  // Order receiving states
  const [isOnline, setIsOnline] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasReceivedOrder, setHasReceivedOrder] = useState(false);
  
  // Access restriction due to unpaid dues > 7 days
  const [duesBlocked, setDuesBlocked] = useState(false);
  const [unpaidDays, setUnpaidDays] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  
  // UI states
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'history'
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  
  // No notification simulation in production build

  // Compute unpaid days based on orderHistory and settlement marker in localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const getDateKey = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10);
    const settledUntil = window.localStorage.getItem('weekly_settled_until');
    const since = settledUntil ? new Date(settledUntil) : new Date(0);
    const daysSet = new Set();
    orderHistory.forEach(o => {
      const completedAt = o.completedAt ? new Date(o.completedAt) : null;
      if (completedAt && completedAt > since) {
        daysSet.add(getDateKey(completedAt));
      }
    });
    const unpaid = daysSet.size;
    setUnpaidDays(unpaid);
    const chargePerDay = 30;
    const weeklyCap = 7; // cap dues per week, but restriction is triggered if unpaidDays > 7
    const due = Math.min(unpaid, weeklyCap) * chargePerDay;
    setTotalDue(due);
    setDuesBlocked(unpaid > 7);
  }, [orderHistory]);

  // Resolve subscription status from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawUser = window.localStorage.getItem('user_data');
      const u = rawUser ? JSON.parse(rawUser) : null;
      const uid = u?._id || u?.id || null;
      const sub = getStoredSubscriptionForUser(uid);
      setIsSubscribed(isSubscriptionActive(sub?.expiryDate));
    } catch {
      setIsSubscribed(false);
    }
  }, []);
  // Redirect if there's already an active in-progress order
  useEffect(() => {
    if (currentOrder) {
      switch (currentOrder.status) {
        case ORDER_STATUSES.ACCEPTED:
          router.push('/orders/pickup');
          break;
        case ORDER_STATUSES.PICKUP_REACHED:
          router.push('/orders/pickup-complete');
          break;
        case ORDER_STATUSES.PICKUP_COMPLETE:
          router.push('/orders/customer-location');
          break;
        case ORDER_STATUSES.CUSTOMER_REACHED:
          router.push('/orders/complete');
          break;
        default:
          // For statuses like PAID/COMPLETED or unknown, stay on Orders page
          break;
      }
    }
  }, [currentOrder, router, ORDER_STATUSES]);

  // No popup in production simulation

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min ago`;
  };

  const formatDistance = (distance) => {
    return distance || 'N/A';
  };

  // No remaining-time timer either

  const handleUserInteraction = () => {};

  // Consolidated order history (context orderHistory + transformed demoOrders)
  const consolidatedHistory = useMemo(() => {
    const historyPart = (orderHistory || []).map(o => ({
      id: o.id,
      customerName: o.customerName,
      status: (o.status === ORDER_STATUSES.COMPLETED || o.status === 'completed') ? 'completed' : (o.status || 'completed'),
      date: o.completedAt || o.acceptedAt || o.orderTime || new Date().toISOString(),
      earnings: o.partnerEarnings ?? 0,
      distance: o.distance || 'N/A',
      pickupLocation: o.pickupLocation || { address: 'Unknown' },
      customerLocation: o.customerLocation || { address: 'Unknown' },
      parcelDetails: o.parcelDetails || { description: 'Package' },
      paymentMethod: o.paymentMethod || 'Online',
      rating: o.rating || null,
    }));
    // Sort by date desc
    const combined = [...historyPart].sort((a, b) => new Date(b.date) - new Date(a.date));
    return combined;
  }, [orderHistory, ORDER_STATUSES]);

  // Filter orders based on search and status
  const filteredOrders = consolidatedHistory.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate totals for history
  const completedOrdersCount = consolidatedHistory.filter(order => order.status === 'completed').length;
  const totalEarningsFromHistory = consolidatedHistory
    .filter(order => order.status === 'completed')
    .reduce((total, order) => total + (order.earnings || 0), 0);

  const handleOrderClick = (order) => {
    router.push(`/orders/details/${order.id}`);
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

  // Only block render if current order is in-progress; otherwise show page
  const isInProgress = currentOrder && [
    ORDER_STATUSES.ACCEPTED,
    ORDER_STATUSES.PICKUP_REACHED,
    ORDER_STATUSES.PICKUP_COMPLETE,
    ORDER_STATUSES.CUSTOMER_REACHED,
  ].includes(currentOrder.status)
  if (isInProgress) {
    return null; // Will redirect from effect
  }

  return (
    <div className="min-h-screen bg-gray-50" onClick={handleUserInteraction}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600 text-sm mt-1">
              {activeTab === 'live' ? 'Waiting for new delivery requests' : 'Order history and details'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {activeTab === 'live' && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Online</span>
              </div>
            )}
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 flex items-center gap-2"
              aria-label="Help & Support"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Help</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mt-4 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'live' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Live Orders
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Order History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-24">
        {activeTab === 'live' ? (
          // Live Orders Tab
          <>
            {!isSubscribed ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">₹</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Subscription Required</h3>
                <p className="text-gray-600 mb-4">Activate a plan to go online and receive orders.</p>
                <button
                  onClick={() => router.push('/dashboard/subscription')}
                  className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700"
                >
                  View Plans
                </button>
              </div>
            ) : duesBlocked ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Access Restricted</h3>
                <p className="text-gray-600 mb-4">You have unpaid platform charges for {unpaidDays} days. Please clear dues to receive new orders.</p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-sm mx-auto mb-4">
                  <h4 className="font-medium text-orange-900 mb-2">Payment Required</h4>
                  <p className="text-sm text-orange-800">Total due (capped weekly): ₹{totalDue}</p>
                </div>
                <button
                  onClick={() => window.location.href = '/dashboard/subscription'}
                  className="px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600"
                >
                  Go to Subscription
                </button>
              </div>
            ) : (!hasReceivedOrder ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">You're Online!</h3>
                <p className="text-gray-600 mb-4">Listening for new orders in your area</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm mx-auto">
                  <h4 className="font-medium text-blue-900 mb-2">📍 Ready to Receive</h4>
                  <p className="text-sm text-blue-800">Orders will appear here with sound and vibration alerts</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Order Accepted</h3>
                <p className="text-gray-600">Redirecting to pickup location...</p>
              </div>
            ))}

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                <p className="text-2xl font-bold text-blue-600">{completedOrdersToday}</p>
                <p className="text-sm text-gray-600 mt-1">Today's Orders</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                <p className="text-2xl font-bold text-green-600">₹{totalEarningsToday}</p>
                <p className="text-sm text-gray-600 mt-1">Today's Earnings</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                <p className="text-2xl font-bold text-orange-600">₹{partnerBalance.toFixed(0)}</p>
                <p className="text-sm text-gray-600 mt-1">Balance</p>
              </div>
            </div>
          </>
        ) : (
          // Order History Tab
          <>
            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Orders</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                <p className="text-2xl font-bold text-blue-600">{completedOrdersCount}</p>
                <p className="text-sm text-gray-600 mt-1">Completed Orders</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                <p className="text-2xl font-bold text-green-600">₹{totalEarningsFromHistory}</p>
                <p className="text-sm text-gray-600 mt-1">Total Earnings</p>
              </div>
            </div>

            {/* Order History List */}
            <div className="space-y-4">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <div key={order.id} onClick={() => handleOrderClick(order)} className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{order.customerName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{order.id}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(order.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">₹{order.earnings}</p>
                        {order.rating && (
                          <div className="mt-1">
                            {renderStars(order.rating)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-700">Pickup</p>
                          <p className="text-gray-600">{order.pickupLocation.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Navigation className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-700">Delivery</p>
                          <p className="text-gray-600">{order.customerLocation.address}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Items:</span>
                        <span className="ml-1 text-gray-700">{order.parcelDetails.description}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500">{order.distance}</span>
                        <span className={order.paymentMethod === 'Cash on Delivery' ? 'text-orange-600' : 'text-blue-600'}>
                          {order.paymentMethod === 'Cash on Delivery' ? 'COD' : 'Online'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <HelpSupportModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        currentOrderId={currentOrder?.id}
      />

      {/* Bottom Navigation (same as Dashboard) */}
      <BottomNav />

      {/* No popup in production */}

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
}
