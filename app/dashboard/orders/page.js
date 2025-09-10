"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, Package, MapPin, Clock, Star, 
  IndianRupee, Calendar, Filter, Search, ChevronRight 
} from "lucide-react"
import BottomNav from "../../../components/BottomNav"
import { formatCurrency, formatDate, formatTime } from "../../../lib/utils"

export default function OrderHistory() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  
  const [orders, setOrders] = useState([
    {
      id: "ORD001234",
      date: "2024-01-10T18:30:00Z",
      restaurant: "McDonald's",
      restaurantAddress: "Sector 18, Noida",
      customer: "Rahul S.",
      deliveryAddress: "Sector 15, Noida",
      distance: 3.2,
      duration: "28 mins",
      earnings: 125,
      tip: 20,
      rating: 5,
      status: "completed",
      paymentMode: "online"
    },
    {
      id: "ORD001233",
      date: "2024-01-10T17:15:00Z",
      restaurant: "Domino's Pizza",
      restaurantAddress: "Sector 16, Noida",
      customer: "Priya M.",
      deliveryAddress: "Sector 12, Noida",
      distance: 2.8,
      duration: "22 mins",
      earnings: 95,
      tip: 15,
      rating: 4,
      status: "completed",
      paymentMode: "cash"
    },
    {
      id: "ORD001232",
      date: "2024-01-10T16:45:00Z",
      restaurant: "KFC",
      restaurantAddress: "City Center, Noida",
      customer: "Amit K.",
      deliveryAddress: "Sector 22, Noida",
      distance: 4.1,
      duration: "35 mins",
      earnings: 140,
      tip: 25,
      rating: 5,
      status: "completed",
      paymentMode: "online"
    },
    {
      id: "ORD001231",
      date: "2024-01-10T15:20:00Z",
      restaurant: "Subway",
      restaurantAddress: "Mall of India",
      customer: "Neha R.",
      deliveryAddress: "Sector 18, Noida",
      distance: 1.9,
      duration: "18 mins",
      earnings: 75,
      tip: 10,
      rating: 4,
      status: "completed",
      paymentMode: "online"
    },
    {
      id: "ORD001230",
      date: "2024-01-10T14:30:00Z",
      restaurant: "Burger King",
      restaurantAddress: "DLF Mall, Noida",
      customer: "Vikash T.",
      deliveryAddress: "Sector 25, Noida",
      distance: 5.2,
      duration: "42 mins",
      earnings: 165,
      tip: 30,
      rating: 5,
      status: "completed",
      paymentMode: "cash"
    },
    {
      id: "ORD001229",
      date: "2024-01-09T19:15:00Z",
      restaurant: "Pizza Hut",
      restaurantAddress: "Sector 18, Noida",
      customer: "Anjali P.",
      deliveryAddress: "Sector 20, Noida",
      distance: 2.5,
      duration: "25 mins",
      earnings: 110,
      tip: 0,
      rating: 3,
      status: "completed",
      paymentMode: "online"
    }
  ])

  const filterOptions = [
    { key: "all", label: "All Orders" },
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" }
  ]

  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.date)
    const today = new Date()
    const searchMatch = order.restaurant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       order.customer.toLowerCase().includes(searchTerm.toLowerCase())

    if (!searchMatch) return false

    switch (activeFilter) {
      case "today":
        return orderDate.toDateString() === today.toDateString()
      case "week":
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - 7)
        return orderDate >= weekStart
      case "month":
        const monthStart = new Date(today)
        monthStart.setDate(today.getDate() - 30)
        return orderDate >= monthStart
      default:
        return true
    }
  })

  const totalEarnings = filteredOrders.reduce((sum, order) => sum + order.earnings + order.tip, 0)
  const averageRating = filteredOrders.reduce((sum, order) => sum + order.rating, 0) / filteredOrders.length || 0

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-success-600 bg-success-100"
      case "cancelled":
        return "text-error-600 bg-error-100"
      default:
        return "text-slate-600 bg-slate-100"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Order History</h1>
              <p className="text-sm text-slate-600">{filteredOrders.length} orders found</p>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Filter className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="earnings-card">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-success-500 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Earnings</p>
                <p className="text-xl font-bold text-success-700">{formatCurrency(totalEarnings)}</p>
              </div>
            </div>
          </div>
          
          <div className="partner-card p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg Rating</p>
                <p className="text-xl font-bold text-warning-700">{averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="partner-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by restaurant, order ID, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="partner-card p-6">
          <div className="flex space-x-1 bg-slate-100 rounded-xl p-1">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setActiveFilter(option.key)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeFilter === option.key
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="partner-card p-6">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">#{order.id}</h3>
                      <p className="text-sm text-slate-600">
                        {formatDate(order.date)} • {formatTime(order.date)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                {/* Restaurant & Customer Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-success-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{order.restaurant}</p>
                      <p className="text-sm text-slate-600">{order.restaurantAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-brand-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{order.customer}</p>
                      <p className="text-sm text-slate-600">{order.deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600">Distance</span>
                      </div>
                      <p className="font-bold text-slate-800">{order.distance} km</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600">Duration</span>
                      </div>
                      <p className="font-bold text-slate-800">{order.duration}</p>
                    </div>
                  </div>
                </div>

                {/* Earnings & Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Earnings</p>
                      <p className="font-bold text-success-600">{formatCurrency(order.earnings)}</p>
                    </div>
                    {order.tip > 0 && (
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Tip</p>
                        <p className="font-bold text-success-600">+{formatCurrency(order.tip)}</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Payment</p>
                      <p className="font-semibold text-slate-800 capitalize">{order.paymentMode}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 bg-warning-100 px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 text-warning-600 fill-current" />
                    <span className="text-sm font-bold text-warning-700">{order.rating}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No Orders Found</h3>
              <p className="text-slate-500">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {filteredOrders.length > 0 && (
          <div className="text-center">
            <button className="partner-button-secondary px-8 py-3">
              Load More Orders
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
