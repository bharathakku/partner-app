"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, Star, Clock, IndianRupee, Package, X, Crown, MapPin } from "lucide-react"
import OnlineToggle from "../../components/OnlineToggle"
import BottomNav from "../../components/BottomNav"
import { getGreeting, formatCurrency } from "../../lib/utils"
import { isSubscriptionActive, getStoredSubscriptionForUser } from "../../lib/subscription"
import { useOrder } from "../contexts/OrderContext"
import { useRouter } from "next/navigation"
import { apiClient, API_BASE_URL } from "../../lib/api/apiClient"

export default function Dashboard() {
  const router = useRouter()
  const { currentOrder, ORDER_STATUSES } = useOrder()
  
  const [partnerData, setPartnerData] = useState({
    id: "",
    name: "—",
    rating: 0,
    totalDeliveries: 0,
    todayEarnings: 0,
    weeklyEarnings: 0,
    pendingDues: 0,
    isOnline: false,
    activeHours: "0h 0m"
  })

  const [todayStats, setTodayStats] = useState({
    deliveries: 0,
    earnings: 0,
    rating: 0,
    hours: "0h 0m"
  })

  // Order receiving states
  const [remainingTime, setRemainingTime] = useState(30)
  
  // Subscription popup state
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [geoPerm, setGeoPerm] = useState('prompt')

  // Redirect if there's already an active order
  useEffect(() => {
    if (currentOrder) {
      switch (currentOrder.status) {
        case ORDER_STATUSES.ACCEPTED:
          router.push('/orders/pickup')
          break
        case ORDER_STATUSES.PICKUP_REACHED:
          router.push('/orders/pickup-complete')
          break
        case ORDER_STATUSES.PICKUP_COMPLETE:
          router.push('/orders/customer-location')
          break
        case ORDER_STATUSES.CUSTOMER_REACHED:
          router.push('/orders/complete')
          break
        default:
          break
      }
    }
  }, [currentOrder, router, ORDER_STATUSES])

  useEffect(() => {
    ;(async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        if (!token) { router.replace('/auth/login'); return }
        const res = await fetch(`${API_BASE_URL}/drivers/me`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (!res.ok) { router.replace('/auth/activation-pending'); return }
        const me = await res.json()
        const docs = Array.isArray(me?.documents) ? me.documents : []
        const hasDocs = docs.length > 0
        const isActive = !!me?.isActive
        if (!hasDocs) { router.replace('/auth/kyc'); return }
        if (!isActive) { router.replace('/auth/activation-pending'); return }
      } catch {
        router.replace('/auth/activation-pending')
      }
    })()
  }, [router])

  // Simulate incoming orders when online
  // No frontend simulation of orders in production

  // Reset simulation when returning to dashboard (after completing an order)
  useEffect(() => {
    // Fetch partner data when component mounts
    const fetchPartnerData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/drivers/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPartnerData(prev => ({
            ...prev,
            id: data._id || data.id || '',
            name: data.name || prev.name,
            isOnline: data.isOnline || false
          }));
        }
      } catch (error) {
        console.error('Error fetching partner data:', error);
      }
    };

    fetchPartnerData();
  }, [currentOrder, partnerData.isOnline]);

  // No popup/simulation handlers

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    return `${minutes} min ago`
  }

  const formatDistance = (distance) => {
    return distance || 'N/A'
  }

  const handleUserInteraction = () => {}

  const getCurrentUserId = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null
      if (!raw) return null
      const u = JSON.parse(raw)
      return u?._id || u?.id || null
    } catch { return null }
  }

  const handleStatusChange = async (isOnline) => {
    console.log('=== handleStatusChange called with isOnline:', isOnline);
    
    if (isOnline) {
      try {
        // First check localStorage for subscription status
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        console.log('User data from localStorage:', userData);
        
        const subscription = userData?.account?.subscription;
        console.log('Subscription data from localStorage:', subscription);
        
        // Check if subscription exists and is active
        const currentDate = new Date();
        const endDate = subscription?.endDate ? new Date(subscription.endDate) : null;
        const isSubscriptionActive = subscription && 
                                   subscription.status === 'active' && 
                                   endDate && 
                                   endDate > currentDate;
        
        console.log('Subscription check:', {
          hasSubscription: !!subscription,
          status: subscription?.status,
          endDate: endDate?.toISOString(),
          currentDate: currentDate.toISOString(),
          isSubscriptionActive
        });
        
        if (isSubscriptionActive) {
          console.log('✅ Active subscription found in localStorage, allowing online status');
        } else {
          console.log('⚠️ No valid subscription in localStorage, checking with backend...');
          const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
          console.log('Auth token exists:', !!token);
          
          const res = await fetch(`${API_BASE_URL}/drivers/me`, { 
            headers: token ? { Authorization: `Bearer ${token}` } : {} 
          });
          
          if (res.ok) {
            const driverData = await res.json();
            console.log('📡 Backend response:', driverData);
            
            // Check for subscription data in the response
            const expiryDate = driverData?.subscriptionExpiry;
            const plan = driverData?.subscriptionPlan;
            const isSubActive = expiryDate && new Date(expiryDate) > currentDate;
            
            // Create a subscription object for local storage
            const subData = {
              status: isSubActive ? 'active' : 'inactive',
              planId: plan || 'unknown',
              startDate: new Date().toISOString(),
              endDate: expiryDate,
              planName: plan ? `${plan} plan` : 'Unknown Plan'
            };
            
            console.log('🔍 Subscription check:', {
              expiryDate,
              plan,
              currentDate: currentDate.toISOString(),
              isSubActive,
              timeRemaining: expiryDate ? (new Date(expiryDate) - currentDate) / (1000 * 60 * 60 * 24) + ' days' : 'N/A'
            });
            
            console.log('🔍 Backend subscription check:', {
              subDataFound: !!subData,
              status,
              expiryDate,
              currentDate: currentDate.toISOString(),
              isSubActive
            });
            
            if (isSubActive) {
              console.log('✅ Active subscription found in backend, updating local storage');
              // Update localStorage with the subscription data from backend
              const updatedUserData = {
                ...userData,
                account: {
                  ...(userData.account || {}),
                  subscription: {
                    ...(userData.account?.subscription || {}),
                    ...subData,
                    status: 'active',
                    endDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                  }
                }
              };
              localStorage.setItem('user_data', JSON.stringify(updatedUserData));
              console.log('💾 Updated localStorage with subscription data');
            } else {
              console.log('❌ No active subscription found or subscription expired');
              console.log('Subscription expiry:', expiryDate);
              console.log('Current time:', currentDate.toISOString());
              console.log('Plan:', plan);
              setShowSubscriptionPopup(true);
              return;
            }
          } else {
            console.error('❌ Failed to fetch driver data:', res.status, await res.text());
          }
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        // If there's an error, still allow going online
      }
    }
    
    // If we get here, either:
    // 1. User is going offline
    // 2. User has a valid subscription and is going online
    // 3. There was an error checking subscription status
    
    // Update online status
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      await fetch(`${API_BASE_URL}/drivers/me/online`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isOnline })
      });
      
      // Update local state and storage
      localStorage.setItem('driver_is_online', JSON.stringify(!!isOnline));
      setPartnerData(prev => ({ ...prev, isOnline }));
    } catch (error) {
      console.error('Error updating online status:', error);
      // Still update the UI even if the API call fails
      setPartnerData(prev => ({ ...prev, isOnline }));
    }
  }

  // Track geolocation permission state to show a soft prompt banner
  useEffect(() => {
    let mounted = true
    async function checkPerm() {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const p = await navigator.permissions.query({ name: 'geolocation' })
          if (!mounted) return
          setGeoPerm(p.state)
          p.onchange = () => setGeoPerm(p.state)
        }
      } catch {}
    }
    checkPerm()
    return () => { mounted = false }
  }, [])
  
  // Subscription plans data
  const subscriptionPlans = [
    {
      id: 'daily',
      name: 'Daily Plan',
      price: 49,
      duration: 'day',
      description: 'Perfect for trying out',
      features: ['Unlimited orders', 'Premium support', 'Partner benefits', 'Instant payments']
    },
    {
      id: 'weekly',
      name: 'Weekly Plan',
      price: 299,
      duration: 'week',
      description: 'Most popular choice',
      features: ['Unlimited orders', 'Premium support', 'Partner benefits', 'Instant payments']
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: 1399,
      duration: 'month',
      description: 'Best value for money',
      features: ['Unlimited orders', 'Premium support', 'Partner benefits', 'Instant payments']
    }
  ]
  
  const handlePlanSelection = (planId) => {
    setSelectedPlan(planId);
    setShowSubscriptionPopup(false);
    router.push('/dashboard/subscription');
  };
  
  const closeSubscriptionPopup = () => {
    setShowSubscriptionPopup(false)
    setSelectedPlan('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20" onClick={handleUserInteraction}>
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Status Bar */}
        <div className="bg-white p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{getGreeting()}, {partnerData.name.split(' ')[0] || 'Partner'}</h1>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Star className="w-4 h-4 text-yellow-500 mr-1" fill="#fbbf24" />
                {partnerData.rating.toFixed(1)} • {partnerData.totalDeliveries} deliveries
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/map" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <MapPin className="w-5 h-5 text-slate-700" />
              </Link>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full border-2 border-white"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Location permission banner (only when online and not granted) */}
          {partnerData.isOnline && geoPerm !== 'granted' && (
            <div className="partner-card p-4 border border-blue-200 bg-blue-50">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-700 font-medium">Enable Location</p>
                  <p className="text-xs text-slate-600">Turn on location access so we can show your live position and assign nearby orders.</p>
                </div>
                <Link href="/dashboard/map" className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">Enable</Link>
              </div>
            </div>
          )}

          {/* Online Status */}
          <div className="partner-card p-6">
            <OnlineToggle 
              isOnline={partnerData.isOnline} 
              onToggle={handleStatusChange}
            />
          </div>
          
          {/* Today's Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="partner-card p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Today's Earnings</p>
                  <p className="text-lg font-bold text-slate-800">{formatCurrency(todayStats.earnings)}</p>
                </div>
              </div>
            </div>

            <div className="partner-card p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Deliveries</p>
                  <p className="text-lg font-bold text-slate-800">{todayStats.deliveries}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Summary removed (dummy). Show only basic KPIs above. */}

          {/* Payment Due Alert */}
          {partnerData.pendingDues > 0 && (
            <div className="payment-due partner-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-warning-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warning-800">Payment Due</p>
                    <p className="text-lg font-bold text-warning-900">{formatCurrency(partnerData.pendingDues)}</p>
                  </div>
                </div>
                <button className="bg-warning-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-warning-700 transition-colors">
                  Pay Now
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="partner-card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/earnings" className="flex flex-col items-center space-y-2 p-4 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 transition-colors">
                <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-brand-700">View Earnings</span>
              </Link>
              
              <Link href="/dashboard/orders" className="flex flex-col items-center space-y-2 p-4 bg-success-50 hover:bg-success-100 rounded-xl border border-success-200 transition-colors">
                <div className="w-10 h-10 bg-success-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-success-700">Order History</span>
              </Link>
              
              <Link href="/dashboard/subscription" className="flex flex-col items-center space-y-2 p-4 bg-warning-50 hover:bg-warning-100 rounded-xl border border-warning-200 transition-colors">
                <div className="w-10 h-10 bg-warning-500 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-warning-700">Subscription</span>
              </Link>
              
              <Link href="/dashboard/settings" className="flex flex-col items-center space-y-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors">
                <div className="w-10 h-10 bg-slate-500 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Support</span>
              </Link>
            </div>
          </div>
        </div>

        <BottomNav />

        {/* Subscription Popup */}
        {showSubscriptionPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full mx-4 transform animate-pulse-scale">
              {/* Header */}
              <div className="p-4 rounded-t-2xl flex justify-between items-center bg-gradient-to-r from-brand-500 to-brand-600">
                <div className="text-white">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Choose Your Plan
                  </h2>
                  <p className="text-sm opacity-90">Select a subscription to start earning</p>
                </div>
                <button
                  onClick={closeSubscriptionPopup}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Plan selection content should go here */}
              <div className="p-6">
                <div className="grid gap-4">
                  {subscriptionPlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => handlePlanSelection(plan.id)}
                      className="p-4 border rounded-lg text-left hover:border-brand-500 transition-colors"
                    >
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      <p className="text-brand-600 font-semibold text-2xl mt-2">
                        ₹{plan.price} <span className="text-sm text-gray-500">/ {plan.duration}</span>
                      </p>
                      <p className="text-gray-600 mt-2">{plan.description}</p>
                      <ul className="mt-3 space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      
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
  )
}
