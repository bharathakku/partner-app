"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, Star, Clock, IndianRupee, Package, X, Crown, MapPin } from "lucide-react"
import OnlineToggle from "../../components/OnlineToggle"
import BottomNav from "../../components/BottomNav"
import { getGreeting, formatCurrency } from "../../lib/utils"
import { isSubscriptionActive } from "../../lib/subscription"
import { useOrder } from "../contexts/OrderContext"
import { useRouter } from "next/navigation"
import { apiClient, API_BASE_URL } from "../../lib/api/apiClient"

export default function Dashboard() {
  const router = useRouter()
  const { currentOrder, ORDER_STATUSES } = useOrder()
  
  const [partnerData, setPartnerData] = useState({
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

  // Simulate incoming orders when online
  // No frontend simulation of orders in production

  // Reset simulation when returning to dashboard (after completing an order)
  useEffect(() => {}, [currentOrder, partnerData.isOnline])

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

  const handleStatusChange = async (isOnline) => {
    if (isOnline) {
      // Check subscription from localStorage
      let active = false
      try {
        const raw = window.localStorage.getItem('partnerSubscription')
        if (raw) {
          const sub = JSON.parse(raw)
          active = isSubscriptionActive(sub?.expiryDate)
        }
      } catch {}
      if (!active) {
        setShowSubscriptionPopup(true)
        return
      }
    }
    // Persist to backend and localStorage
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      await fetch(`${API_BASE_URL}/drivers/me/online`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isOnline })
      })
      try { localStorage.setItem('driver_is_online', JSON.stringify(!!isOnline)) } catch {}
    } catch {}
    setPartnerData(prev => ({ ...prev, isOnline }))
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
  
  // Show subscription popup on dashboard load if not active
  useEffect(() => {
    // hydrate name and online from localStorage/backend
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null
      if (raw) {
        const u = JSON.parse(raw)
        setPartnerData(prev => ({ ...prev, name: u?.name || prev.name }))
      }
    } catch {}
    // Hydrate online from backend first; fallback to localStorage
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        const res = await fetch(`${API_BASE_URL}/drivers/me`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (res.ok) {
          const me = await res.json()
          const online = typeof me?.isOnline === 'boolean' ? me.isOnline : false
          setPartnerData(prev => ({ ...prev, isOnline: online }))
          try { localStorage.setItem('driver_is_online', JSON.stringify(!!online)) } catch {}
        } else {
          const raw = localStorage.getItem('driver_is_online')
          if (raw != null) setPartnerData(prev => ({ ...prev, isOnline: JSON.parse(raw) }))
        }
      } catch {
        try {
          const raw = localStorage.getItem('driver_is_online')
          if (raw != null) setPartnerData(prev => ({ ...prev, isOnline: JSON.parse(raw) }))
        } catch {}
      }
    })()
    let active = false
    try {
      const raw = window.localStorage.getItem('partnerSubscription')
      if (raw) {
        const sub = JSON.parse(raw)
        active = isSubscriptionActive(sub?.expiryDate)
      }
    } catch {}
    if (!active) {
      const timer = setTimeout(() => setShowSubscriptionPopup(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])
  
  const handlePlanSelection = (planId) => {
    setSelectedPlan(planId)
    setShowSubscriptionPopup(false)
    
    // Navigate to subscription main page
    router.push('/dashboard/subscription')
  }
  
  const closeSubscriptionPopup = () => {
    setShowSubscriptionPopup(false)
    setSelectedPlan('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20" onClick={handleUserInteraction}>
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">{getGreeting()}</p>
            <h1 className="text-xl font-bold text-slate-800">{partnerData.name}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-warning-100 px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-warning-600 fill-current" />
              <span className="text-sm font-semibold text-warning-700">{partnerData.rating}</span>
            </div>
            <Link href="/dashboard/map" className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Live Map">
              <MapPin className="w-5 h-5 text-slate-700" />
            </Link>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full border-2 border-white"></div>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Online/Offline Toggle */}
        <OnlineToggle 
          initialStatus={partnerData.isOnline}
          onStatusChange={handleStatusChange}
        />

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

            {/* Subscription Plans */}
            <div className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-slate-600">Choose a plan that fits your needs</p>
              </div>
              
              <div className="space-y-3">
                {subscriptionPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handlePlanSelection(plan.id)}
                    className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-brand-700">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-slate-600">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-brand-600">
                          ₹{plan.price}
                        </div>
                        <div className="text-xs text-slate-500">per {plan.duration}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {plan.features.map((feature, idx) => (
                        <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeSubscriptionPopup}
                  className="flex-1 py-3 px-4 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                >
                  Later
                </button>
              </div>
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
  )
}
