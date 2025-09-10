"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, Star, TrendingUp, Clock, IndianRupee, Package } from "lucide-react"
import OnlineToggle from "../../components/OnlineToggle"
import BottomNav from "../../components/BottomNav"
import { getGreeting, formatCurrency } from "../../lib/utils"
import { useNotification } from "../services/notificationService"
import { routeBasedOrders } from "../data/dummyOrders"
import { useOrder } from "../contexts/OrderContext"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()
  const { currentOrder, acceptOrder, ORDER_STATUSES } = useOrder()
  const { triggerOrderAlert, resetAudioContext } = useNotification()
  
  const [partnerData, setPartnerData] = useState({
    name: "Rajesh Kumar",
    rating: 4.8,
    totalDeliveries: 156,
    todayEarnings: 850,
    weeklyEarnings: 4200,
    pendingDues: 250,
    isOnline: false,
    activeHours: "6h 30m"
  })

  const [todayStats, setTodayStats] = useState({
    deliveries: 8,
    earnings: 850,
    rating: 4.9,
    hours: "6h 30m"
  })

  // Order receiving states
  const [currentOrderPopup, setCurrentOrderPopup] = useState(null)
  const [simulationActive, setSimulationActive] = useState(false)
  const [remainingTime, setRemainingTime] = useState(30)

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
  useEffect(() => {
    if (!partnerData.isOnline || simulationActive) return

    const startSimulation = () => {
      setSimulationActive(true)
      
      // Show next order after 3 seconds
      setTimeout(() => {
        // Get next order from array (cycle through available orders)
        const orderIndex = Math.floor(Math.random() * routeBasedOrders.length)
        showNewOrderPopup(routeBasedOrders[orderIndex])
      }, 3000)
    }

    const initDelay = setTimeout(startSimulation, 1000)

    return () => {
      clearTimeout(initDelay)
    }
  }, [partnerData.isOnline, simulationActive])

  // Reset simulation when returning to dashboard (after completing an order)
  useEffect(() => {
    if (partnerData.isOnline && !currentOrder && !currentOrderPopup) {
      // If we're online but have no active order or popup, reset to listen for new orders
      setSimulationActive(false)
    }
  }, [currentOrder, currentOrderPopup, partnerData.isOnline])

  const showNewOrderPopup = async (order) => {
    if (!partnerData.isOnline) return

    // Trigger notification alerts
    await triggerOrderAlert(order)
    
    // Show popup
    setCurrentOrderPopup({
      ...order,
      showTime: Date.now(),
      timeoutId: setTimeout(() => {
        handleOrderDecline()
      }, 30000)
    })
  }

  const handleOrderAccept = () => {
    if (!currentOrderPopup) return

    // Clear timeout
    if (currentOrderPopup.timeoutId) {
      clearTimeout(currentOrderPopup.timeoutId)
    }

    const acceptedOrderData = { ...currentOrderPopup }
    delete acceptedOrderData.timeoutId
    delete acceptedOrderData.showTime

    acceptOrder(acceptedOrderData)
    setCurrentOrderPopup(null)
  }

  const handleOrderDecline = () => {
    if (!currentOrderPopup) return

    // Clear timeout
    if (currentOrderPopup.timeoutId) {
      clearTimeout(currentOrderPopup.timeoutId)
    }

    setCurrentOrderPopup(null)
  }

  const calculateRemainingTime = () => {
    if (!currentOrderPopup?.showTime) return 30
    const elapsed = (Date.now() - currentOrderPopup.showTime) / 1000
    return Math.max(0, 30 - Math.floor(elapsed))
  }

  useEffect(() => {
    if (!currentOrderPopup) {
      setRemainingTime(30)
      return
    }

    const timer = setInterval(() => {
      setRemainingTime(calculateRemainingTime())
    }, 1000)

    return () => clearInterval(timer)
  }, [currentOrderPopup])

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    return `${minutes} min ago`
  }

  const formatDistance = (distance) => {
    return distance || 'N/A'
  }

  const handleUserInteraction = () => {
    resetAudioContext()
  }

  const handleStatusChange = (isOnline) => {
    setPartnerData(prev => ({ ...prev, isOnline }))
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

        {/* Weekly Summary */}
        <div className="earnings-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">This Week</h3>
            <TrendingUp className="w-5 h-5 text-brand-600" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-brand-700">{formatCurrency(partnerData.weeklyEarnings)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Active Time</p>
              <p className="text-2xl font-bold text-brand-700">{partnerData.activeHours}</p>
            </div>
          </div>
          
          <div className="bg-white/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Weekly Target: ₹5,000</span>
              <span className="text-sm font-semibold text-brand-600">84%</span>
            </div>
            <div className="w-full bg-brand-200 rounded-full h-2 mt-2">
              <div className="bg-brand-500 h-2 rounded-full" style={{ width: '84%' }}></div>
            </div>
          </div>
        </div>

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
            
            <Link href="/dashboard/incentives" className="flex flex-col items-center space-y-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-purple-700">Incentives</span>
            </Link>
            
            <Link href="/dashboard/settings" className="flex flex-col items-center space-y-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition-colors">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-orange-700">Support</span>
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />

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
  )
}
