"use client"

import { useState } from "react"
import Link from "next/link"
import { useProfile } from "../../contexts/ProfileContext"
import { 
  ArrowLeft, User, HelpCircle, Users, Bell, FileText, 
  LogOut, ChevronRight, Phone, MessageCircle, Gift, 
  Shield, Share, Star, Settings as SettingsIcon, AlertCircle
} from "lucide-react"
import BottomNav from "../../../components/BottomNav"

export default function SettingsPage() {
  const { profileData } = useProfile()

  const [notificationSettings, setNotificationSettings] = useState({
    orderUpdates: true,
    paymentAlerts: true,
    promotions: false,
    weeklyReports: true
  })

  const handleNotificationToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("partner_authenticated")
      localStorage.removeItem("partner_phone")
      window.location.href = "/"
    }
  }

  const shareReferralCode = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join as Delivery Partner",
        text: `Join our delivery platform using my referral code: ${profileData.referral.referralCode}`,
        url: `https://partner-app.com/signup?ref=${profileData.referral.referralCode}`
      })
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`Join our delivery platform using my referral code: ${profileData.referral.referralCode}`)
      alert("Referral message copied to clipboard!")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Section */}
        <div className="partner-card p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800">{profileData.name}</h3>
              <p className="text-sm text-slate-600">{profileData.phone}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Star className="w-4 h-4 text-warning-500 fill-current" />
                <span className="text-sm font-semibold text-warning-600">{profileData.rating} Rating</span>
              </div>
            </div>
            <Link href="/profile" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Referral Section */}
        <div className="partner-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800">Refer & Earn</h3>
              <p className="text-sm text-slate-600">Invite friends and earn rewards</p>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-purple-600">Your Referral Code</p>
                <p className="text-xl font-bold text-purple-700">{profileData.referral.referralCode}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-600">Total Referrals</p>
                <p className="text-xl font-bold text-purple-700">{profileData.referral.totalReferrals}</p>
              </div>
            </div>
            <button
              onClick={shareReferralCode}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Share className="w-4 h-4" />
              <span>Share Referral Code</span>
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-slate-600">Earn ₹100 for each successful referral</p>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="partner-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-brand-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            {[
              { key: "orderUpdates", label: "Order Updates", description: "Get notified about new orders and updates" },
              { key: "paymentAlerts", label: "Payment Alerts", description: "Notifications about payments and dues" },
              { key: "promotions", label: "Promotions", description: "Special offers and promotional content" },
              { key: "weeklyReports", label: "Weekly Reports", description: "Your weekly earnings and performance summary" }
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{setting.label}</p>
                  <p className="text-xs text-slate-600">{setting.description}</p>
                </div>
                <button
                  onClick={() => handleNotificationToggle(setting.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings[setting.key] 
                      ? "bg-brand-500" 
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings[setting.key] 
                        ? "translate-x-6" 
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Help & Support */}
        <div className="partner-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-success-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Help & Support</h3>
          </div>
          
          <div className="space-y-3">
            <Link 
              href="/support" 
              className="flex items-center space-x-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-slate-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Help & Support Center</p>
                <p className="text-xs text-slate-600">Access all support options in one place</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
            
            <Link 
              href="/support/chat" 
              className="flex items-center space-x-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-slate-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Live Chat</p>
                <p className="text-xs text-slate-600">Chat with our support team</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
            
            <Link 
              href="/support/complaint" 
              className="flex items-center space-x-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <AlertCircle className="w-5 h-5 text-slate-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Raise Complaint</p>
                <p className="text-xs text-slate-600">Report issues and track resolution</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
            
            <Link 
              href="tel:+919876543210" 
              className="flex items-center space-x-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Phone className="w-5 h-5 text-slate-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Emergency Hotline</p>
                <p className="text-xs text-slate-600">+91 98765 43210 (24/7 available)</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Legal & Policies */}
        <div className="partner-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Legal & Policies</h3>
          </div>
          
          <div className="space-y-3">
            <Link 
              href="/terms-conditions" 
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-semibold text-slate-800">Terms & Conditions</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
            
            <Link 
              href="/privacy-policy" 
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-semibold text-slate-800">Privacy Policy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* App Info */}
        <div className="partner-card p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <SettingsIcon className="w-6 h-6 text-brand-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Partner App</p>
            <p className="text-xs text-slate-500">Version 1.0.0</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-error-50 hover:bg-error-100 text-error-600 border border-error-200 py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
