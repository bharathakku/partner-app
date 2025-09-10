"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, MessageCircle, AlertTriangle, HelpCircle, 
  Phone, Mail, Clock, Star, ChevronRight, Headphones,
  FileText, Shield, Zap
} from "lucide-react"
import BottomNav from "../../components/BottomNav"

export default function SupportHub() {
  const [supportStats, setSupportStats] = useState({
    averageResponseTime: "2 mins",
    satisfaction: 4.8,
    issuesResolved: "95%",
    availabilityStatus: "online"
  })

  const supportOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      href: "/support/chat",
      color: "bg-brand-500",
      bgColor: "bg-brand-50",
      borderColor: "border-brand-200",
      textColor: "text-brand-700",
      status: "Available now",
      estimatedTime: "< 2 mins"
    },
    {
      title: "Raise Complaint",
      description: "Report issues and track resolution",
      icon: AlertTriangle,
      href: "/support/complaint",
      color: "bg-error-500",
      bgColor: "bg-error-50",
      borderColor: "border-error-200",
      textColor: "text-error-700",
      status: "24/7 Available",
      estimatedTime: "Response in 1 hour"
    },
    {
      title: "FAQ & Help",
      description: "Find answers to common questions",
      icon: HelpCircle,
      href: "/support/faq",
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      status: "Self Service",
      estimatedTime: "Instant answers"
    }
  ]

  const quickActions = [
    {
      title: "Call Support",
      description: "+91 98765 43210",
      icon: Phone,
      action: "tel:+919876543210",
      color: "success"
    },
    {
      title: "Email Support",
      description: "support@partnerapp.com",
      icon: Mail,
      action: "mailto:support@partnerapp.com",
      color: "brand"
    }
  ]

  const recentUpdates = [
    {
      title: "App Update v2.1",
      description: "Enhanced earnings tracking and bug fixes",
      time: "2 hours ago",
      type: "update"
    },
    {
      title: "Payment System Maintenance",
      description: "Scheduled maintenance completed successfully",
      time: "1 day ago",
      type: "maintenance"
    },
    {
      title: "New Incentive Programs",
      description: "Weekend bonus and referral rewards launched",
      time: "3 days ago",
      type: "announcement"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/settings" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Help & Support</h1>
            <p className="text-sm text-slate-600">We're here to help you 24/7</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Support Status */}
        <div className="partner-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Support Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-success-600">Online</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Clock className="w-4 h-4 text-brand-600" />
                <span className="text-sm text-slate-600">Response</span>
              </div>
              <p className="font-bold text-slate-800">{supportStats.averageResponseTime}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Star className="w-4 h-4 text-warning-600" />
                <span className="text-sm text-slate-600">Rating</span>
              </div>
              <p className="font-bold text-slate-800">{supportStats.satisfaction}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Shield className="w-4 h-4 text-success-600" />
                <span className="text-sm text-slate-600">Resolved</span>
              </div>
              <p className="font-bold text-slate-800">{supportStats.issuesResolved}</p>
            </div>
          </div>
        </div>

        {/* Support Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">How can we help you?</h3>
          
          {supportOptions.map((option, index) => {
            const Icon = option.icon
            return (
              <Link
                key={index}
                href={option.href}
                className={`block p-6 ${option.bgColor} ${option.borderColor} border rounded-xl hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${option.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${option.textColor} mb-1`}>{option.title}</h4>
                      <p className="text-sm text-slate-600 mb-2">{option.description}</p>
                      <div className="flex items-center space-x-4">
                        <span className={`text-xs font-semibold ${option.textColor}`}>{option.status}</span>
                        <span className="text-xs text-slate-500">{option.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Contact */}
        <div className="partner-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Contact</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={index}
                  href={action.action}
                  className="flex items-center space-x-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <div className={`w-10 h-10 ${
                    action.color === 'success' ? 'bg-success-500' : 'bg-brand-500'
                  } rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{action.title}</h4>
                    <p className="text-sm text-slate-600">{action.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Updates */}
        <div className="partner-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Updates</h3>
          
          <div className="space-y-4">
            {recentUpdates.map((update, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  update.type === 'update' ? 'bg-brand-100' :
                  update.type === 'maintenance' ? 'bg-warning-100' : 'bg-success-100'
                }`}>
                  {update.type === 'update' && <Zap className="w-4 h-4 text-brand-600" />}
                  {update.type === 'maintenance' && <Shield className="w-4 h-4 text-warning-600" />}
                  {update.type === 'announcement' && <Star className="w-4 h-4 text-success-600" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">{update.title}</h4>
                  <p className="text-sm text-slate-600 mb-1">{update.description}</p>
                  <span className="text-xs text-slate-500">{update.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-error-50 border border-error-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-error-500 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-error-800">Emergency Support</h3>
              <p className="text-sm text-error-700">For urgent issues during delivery</p>
            </div>
          </div>
          
          <Link
            href="tel:+919876543210"
            className="block w-full bg-error-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-error-700 transition-colors"
          >
            Call Emergency Hotline: +91 98765 43210
          </Link>
        </div>

        {/* Support Hours */}
        <div className="partner-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Support Hours</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Live Chat</span>
              <span className="font-semibold text-slate-800">24/7 Available</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Phone Support</span>
              <span className="font-semibold text-slate-800">6:00 AM - 12:00 AM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Email Support</span>
              <span className="font-semibold text-slate-800">Response within 2 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Complaint Resolution</span>
              <span className="font-semibold text-slate-800">Within 24 hours</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
