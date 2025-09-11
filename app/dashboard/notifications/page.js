"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, Bell, Package, IndianRupee, Star, 
  AlertCircle, Info, CheckCircle, Clock, Gift 
} from "lucide-react"
import BottomNav from "../../../components/BottomNav"
import { formatCurrency, formatDate, formatTime } from "../../../lib/utils"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "payment",
      title: "Payment Received",
      message: "Your weekly earnings of ₹4,200 have been credited to your account",
      timestamp: "2025-09-11T10:30:00Z",
      read: false,
      action: "View Details"
    },
    {
      id: 2,
      type: "order",
      title: "New Delivery Request",
      message: "You have a new delivery request from Restaurant ABC to Sector 15",
      timestamp: "2025-09-11T09:45:00Z",
      read: true,
      action: "Accept Order"
    },
    {
      id: 3,
      type: "rating",
      title: "Great Rating Received!",
      message: "Customer rated you 5 stars for your excellent service. Keep it up!",
      timestamp: "2025-09-11T08:20:00Z",
      read: false,
      action: "View Rating"
    },
    {
      id: 4,
      type: "incentive",
      title: "Bonus Achieved!",
      message: "Congratulations! You've completed the Weekend Bonus challenge and earned ₹500",
      timestamp: "2025-09-10T20:15:00Z",
      read: false,
      action: "Claim Bonus"
    },
    {
      id: 5,
      type: "system",
      title: "App Update Available",
      message: "A new version of the app is available with improved features and bug fixes",
      timestamp: "2025-09-10T14:30:00Z",
      read: true,
      action: "Update Now"
    },
    {
      id: 6,
      type: "payment_due",
      title: "Payment Reminder",
      message: "You have pending platform charges of ₹210. Please clear your dues",
      timestamp: "2025-09-10T12:00:00Z",
      read: true,
      action: "Pay Now"
    },
    {
      id: 7,
      type: "order",
      title: "Order Completed",
      message: "Order #ORD123456 has been successfully delivered. Earned ₹85",
      timestamp: "2025-09-09T19:45:00Z",
      read: true,
      action: "View Details"
    },
    {
      id: 8,
      type: "system",
      title: "Weekly Report Ready",
      message: "Your weekly performance report is now available for download",
      timestamp: "2025-09-09T09:00:00Z",
      read: true,
      action: "Download"
    }
  ])

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "payment":
        return <IndianRupee className="w-5 h-5 text-success-600" />
      case "order":
        return <Package className="w-5 h-5 text-brand-600" />
      case "rating":
        return <Star className="w-5 h-5 text-warning-600" />
      case "incentive":
        return <Gift className="w-5 h-5 text-purple-600" />
      case "payment_due":
        return <AlertCircle className="w-5 h-5 text-error-600" />
      case "system":
        return <Info className="w-5 h-5 text-slate-600" />
      default:
        return <Bell className="w-5 h-5 text-slate-600" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case "payment":
        return "bg-success-100"
      case "order":
        return "bg-brand-100"
      case "rating":
        return "bg-warning-100"
      case "incentive":
        return "bg-purple-100"
      case "payment_due":
        return "bg-error-100"
      case "system":
        return "bg-slate-100"
      default:
        return "bg-slate-100"
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

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
              <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-slate-600">{unreadCount} unread messages</p>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-brand-600 font-semibold hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`partner-card p-4 cursor-pointer transition-all duration-200 ${
                  !notification.read 
                    ? "border-l-4 border-l-brand-500 bg-brand-50/50" 
                    : "hover:bg-slate-50"
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`font-semibold text-slate-800 ${!notification.read ? "text-slate-900" : ""}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-3 h-3 bg-brand-500 rounded-full flex-shrink-0 ml-2"></div>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        {formatDate(notification.timestamp)} at {formatTime(notification.timestamp)}
                      </p>
                      
                      {notification.action && (
                        <button className="text-xs text-brand-600 font-semibold hover:underline">
                          {notification.action}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No Notifications</h3>
              <p className="text-slate-500">You're all caught up! New notifications will appear here.</p>
            </div>
          )}
        </div>

        {/* Notification Settings */}
        {notifications.length > 0 && (
          <div className="mt-8 partner-card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Notification Settings</h3>
            
            <div className="space-y-4">
              <Link 
                href="/dashboard/settings"
                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Manage Notifications</p>
                    <p className="text-xs text-slate-600">Control what notifications you receive</p>
                  </div>
                </div>
                <div className="text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
