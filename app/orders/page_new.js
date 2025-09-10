'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '../contexts/OrderContext';
import { useNotification } from '../services/notificationService';
import { routeBasedOrders } from '../data/dummyOrders';
import { 
  Clock, MapPin, Phone, IndianRupee, 
  Package, Timer, AlertCircle, CheckCircle2,
  ArrowRight, Navigation, Power, Menu, History,
  Filter, Search, Calendar, Star, X, ChevronDown,
  Home, User, Settings, HelpCircle, LogOut
} from 'lucide-react';

// Dummy order history data
const dummyOrderHistory = [
  {
    id: 'ORD-001',
    customerName: 'Rahul Sharma',
    status: 'completed',
    date: '2024-01-10T14:30:00Z',
    earnings: 85,
    distance: '3.2 km',
    pickupLocation: { address: 'MG Road, Bangalore' },
    customerLocation: { address: 'Koramangala 5th Block' },
    parcelDetails: { type: 'Electronics', description: 'Mobile Phone' },
    paymentMethod: 'Online',
    rating: 5
  },
  {
    id: 'ORD-002',
    customerName: 'Priya Patel',
    status: 'completed',
    date: '2024-01-10T12:15:00Z',
    earnings: 65,
    distance: '2.8 km',
    pickupLocation: { address: 'Brigade Road' },
    customerLocation: { address: 'Indiranagar' },
    parcelDetails: { type: 'Food & Groceries', description: 'Restaurant Order' },
    paymentMethod: 'Cash on Delivery',
    rating: 4
  },
  {
    id: 'ORD-003',
    customerName: 'Amit Kumar',
    status: 'completed',
    date: '2024-01-10T10:45:00Z',
    earnings: 95,
    distance: '4.1 km',
    pickupLocation: { address: 'Whitefield Main Road' },
    customerLocation: { address: 'Marathahalli' },
    parcelDetails: { type: 'Medicine & Healthcare', description: 'Prescription Medicines' },
    paymentMethod: 'Online',
    rating: 5
  },
  {
    id: 'ORD-004',
    customerName: 'Sneha Reddy',
    status: 'completed',
    date: '2024-01-09T16:20:00Z',
    earnings: 75,
    distance: '2.5 km',
    pickupLocation: { address: 'Commercial Street' },
    customerLocation: { address: 'Jayanagar 4th Block' },
    parcelDetails: { type: 'Clothing', description: 'Fashion Items' },
    paymentMethod: 'Online',
    rating: 4
  },
  {
    id: 'ORD-005',
    customerName: 'Vikram Singh',
    status: 'cancelled',
    date: '2024-01-09T14:10:00Z',
    earnings: 0,
    distance: '1.8 km',
    pickupLocation: { address: 'HSR Layout' },
    customerLocation: { address: 'BTM Layout' },
    parcelDetails: { type: 'Books & Stationery', description: 'Academic Books' },
    paymentMethod: 'Cash on Delivery',
    rating: null
  },
  {
    id: 'ORD-006',
    customerName: 'Meera Nair',
    status: 'completed',
    date: '2024-01-09T11:30:00Z',
    earnings: 120,
    distance: '5.2 km',
    pickupLocation: { address: 'Electronic City' },
    customerLocation: { address: 'JP Nagar' },
    parcelDetails: { type: 'Electronics', description: 'Laptop Accessories' },
    paymentMethod: 'Online',
    rating: 5
  }
];

export default function OrdersPage() {
  const router = useRouter();
  const { currentOrder, acceptOrder, ORDER_STATUSES, partnerBalance, totalEarningsToday, completedOrdersToday } = useOrder();
  
  // Order receiving states
  const [isOnline, setIsOnline] = useState(false);
  const [currentOrderPopup, setCurrentOrderPopup] = useState(null);
  const [acceptingOrder, setAcceptingOrder] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [hasReceivedOrder, setHasReceivedOrder] = useState(false);
  
  // UI states
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'history'
  const [showMenu, setShowMenu] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { triggerOrderAlert, resetAudioContext } = useNotification();

  // Check if user came from dashboard (redirect after going online)
  useEffect(() => {
    // Auto-activate online mode and start simulation
    setIsOnline(true);
  }, []);

  // Simulate incoming orders when online
  useEffect(() => {
    if (!isOnline || simulationActive || hasReceivedOrder || activeTab !== 'live') return;

    const startSimulation = () => {
      setSimulationActive(true);
      
      // Show first order after 3 seconds
      setTimeout(() => {
        showNewOrderPopup(routeBasedOrders[0]);
      }, 3000);
    };

    const initDelay = setTimeout(startSimulation, 1000);

    return () => {
      clearTimeout(initDelay);
      setSimulationActive(false);
    };
  }, [isOnline, hasReceivedOrder, activeTab]);

  // Redirect if there's already an active order
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
          break;
      }
    }
  }, [currentOrder, router, ORDER_STATUSES]);

  // Order popup functions
  const showNewOrderPopup = async (order) => {
    if (!isOnline) return;

    // Trigger notification alerts
    await triggerOrderAlert(order);
    
    // Show popup
    setCurrentOrderPopup({
      ...order,
      showTime: Date.now(),
      timeoutId: setTimeout(() => {
        handleOrderDecline();
      }, 30000)
    });
  };

  const handleOrderAccept = () => {
    if (!currentOrderPopup) return;

    // Clear timeout
    if (currentOrderPopup.timeoutId) {
      clearTimeout(currentOrderPopup.timeoutId);
    }

    const acceptedOrderData = { ...currentOrderPopup };
    delete acceptedOrderData.timeoutId;
    delete acceptedOrderData.showTime;

    // Set states
    setHasReceivedOrder(true);
    acceptOrder(acceptedOrderData);
    setCurrentOrderPopup(null);
  };

  const handleOrderDecline = () => {
    if (!currentOrderPopup) return;

    // Clear timeout
    if (currentOrderPopup.timeoutId) {
      clearTimeout(currentOrderPopup.timeoutId);
    }

    setCurrentOrderPopup(null);
  };

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
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

  const handleUserInteraction = () => {
    resetAudioContext();
  };

  // Filter orders based on search and status
  const filteredOrders = dummyOrderHistory.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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

  if (currentOrder) {
    return null; // Will redirect
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
              onClick={() => setShowMenu(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
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
      <div className="px-4 py-6">
        {activeTab === 'live' ? (
          // Live Orders Tab
          <>
            {!hasReceivedOrder ? (
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
            )}

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

            {/* Order History List */}
            <div className="space-y-4">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-4">
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

      {/* Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMenu(false)}>
          <div 
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => {
                    router.push('/dashboard');
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>
                
                <button
                  onClick={() => {
                    router.push('/profile');
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>
                
                <button
                  onClick={() => {
                    router.push('/earnings');
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IndianRupee className="w-5 h-5" />
                  <span>Earnings</span>
                </button>
                
                <button
                  onClick={() => {
                    router.push('/settings');
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
                
                <button
                  onClick={() => {
                    router.push('/support');
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Help & Support</span>
                </button>
              </nav>

              <div className="mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    // Add logout functionality
                    router.push('/login');
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
