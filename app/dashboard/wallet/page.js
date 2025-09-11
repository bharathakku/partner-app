"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Crown, Calendar, TrendingUp, Clock, IndianRupee, Download, AlertCircle, CheckCircle, Star, Shield, Zap } from "lucide-react"
import Link from "next/link"
import BottomNav from "../../../components/BottomNav"
import { formatCurrency, formatDate } from "../../../lib/utils"
import { useOrder } from "../../contexts/OrderContext"
import { 
  SUBSCRIPTION_PLANS, 
  getPlansArray, 
  getPlanById, 
  getDaysRemaining, 
  isSubscriptionActive, 
  formatSubscriptionDate, 
  getSubscriptionStatus,
  getDefaultSubscriptionState
} from "../../../lib/subscription"

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState("plans")
  
  const [subscriptionData, setSubscriptionData] = useState({
    ...getDefaultSubscriptionState(),
    // Sample active subscription - Weekly plan
    currentPlan: SUBSCRIPTION_PLANS.WEEKLY,
    activationDate: "2024-01-05",
    expiryDate: "2024-01-12",
    upcomingPlan: null,
    upcomingActivationDate: null,
    autoRenewal: true,
    subscriptionHistory: [
      {
        id: 1,
        planId: 'weekly',
        planName: 'Weekly Plan',
        amount: 299,
        activationDate: "2024-01-05",
        expiryDate: "2024-01-12",
        status: 'active'
      },
      {
        id: 2,
        planId: 'daily',
        planName: 'Daily Plan',
        amount: 49,
        activationDate: "2024-01-04",
        expiryDate: "2024-01-05",
        status: 'completed'
      }
    ]
  })

  const { orderHistory } = useOrder()
  
  const [selectedPlan, setSelectedPlan] = useState(null)
  const plans = getPlansArray()

  // Subscription status and helpers
  const currentStatus = getSubscriptionStatus(subscriptionData)
  const daysRemaining = subscriptionData.expiryDate ? getDaysRemaining(subscriptionData.expiryDate) : 0
  const isActive = subscriptionData.expiryDate ? isSubscriptionActive(subscriptionData.expiryDate) : false
  
  const handlePlanSelection = (planId) => {
    const plan = getPlanById(planId)
    setSelectedPlan(plan)
    // Navigate to subscription payment
    window.location.href = `/dashboard/subscription/pay?planId=${planId}&amount=${plan.price}`
  }
  
  const handleAutoRenewalToggle = () => {
    setSubscriptionData(prev => ({ ...prev, autoRenewal: !prev.autoRenewal }))
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
            <h1 className="text-xl font-bold text-slate-800">Subscription</h1>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Download className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Subscription Status */}
        {subscriptionData.currentPlan && (
          <div className="partner-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Current Subscription</h3>
              <Crown className="w-5 h-5 text-brand-600" />
            </div>
            
            <div className={`p-4 rounded-xl border ${
              isActive 
                ? currentStatus.status === 'expiring' 
                  ? 'bg-warning-50 border-warning-200'
                  : 'bg-success-50 border-success-200'
                : 'bg-error-50 border-error-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className={`font-semibold text-lg ${
                    isActive 
                      ? currentStatus.status === 'expiring'
                        ? 'text-warning-900'
                        : 'text-success-900'
                      : 'text-error-900'
                  }`}>
                    {subscriptionData.currentPlan.name}
                  </h4>
                  <p className={`text-sm ${
                    isActive 
                      ? currentStatus.status === 'expiring'
                        ? 'text-warning-700'
                        : 'text-success-700'
                      : 'text-error-700'
                  }`}>
                    {currentStatus.message}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    isActive 
                      ? currentStatus.status === 'expiring'
                        ? 'text-warning-800'
                        : 'text-success-800'
                      : 'text-error-800'
                  }`}>
                    {daysRemaining}
                  </p>
                  <p className={`text-xs ${
                    isActive 
                      ? currentStatus.status === 'expiring'
                        ? 'text-warning-600'
                        : 'text-success-600'
                      : 'text-error-600'
                  }`}>
                    days left
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Activated on</p>
                  <p className="font-semibold">{formatSubscriptionDate(subscriptionData.activationDate)}</p>
                </div>
                <div>
                  <p className="text-slate-600">Expires on</p>
                  <p className="font-semibold">{formatSubscriptionDate(subscriptionData.expiryDate)}</p>
                </div>
              </div>
              
              {/* Auto renewal toggle */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">Auto Renewal</p>
                    <p className="text-xs text-slate-600">Automatically renew when expired</p>
                  </div>
                  <button
                    onClick={handleAutoRenewalToggle}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      subscriptionData.autoRenewal 
                        ? 'bg-success-600' 
                        : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      subscriptionData.autoRenewal 
                        ? 'translate-x-6' 
                        : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* No Active Subscription */}
        {!subscriptionData.currentPlan && (
          <div className="partner-card p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Active Subscription</h3>
              <p className="text-sm text-slate-600 mb-4">Subscribe to a plan to start receiving orders</p>
              <button
                onClick={() => setActiveTab('plans')}
                className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors"
              >
                Choose a Plan
              </button>
            </div>
          </div>
        )}

        {/* Subscription Benefits */}
        <div className="partner-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Subscription Benefits</h3>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-success-50 border border-green-200 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-900">Unlimited Orders</p>
                <p className="text-xs text-green-700">Accept as many orders as you want</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-brand-50 border border-blue-200 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-blue-900">Direct Payments</p>
                <p className="text-xs text-blue-700">Earnings paid directly to your account</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-brand-50 border border-purple-200 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-purple-900">24/7 Support</p>
                <p className="text-xs text-purple-700">Get help whenever you need it</p>
              </div>
            </div>
          </div>
        </div>



        {/* Subscription Tabs */}
        <div className="partner-card p-6">
          <div className="flex border-b border-slate-200 mb-4">
            <button
              onClick={() => setActiveTab("plans")}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "plans" 
                  ? "text-brand-600 border-brand-500" 
                  : "text-slate-600 border-transparent hover:text-slate-800"
              }`}
            >
              Choose Plan
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "history" 
                  ? "text-brand-600 border-brand-500" 
                  : "text-slate-600 border-transparent hover:text-slate-800"
              }`}
            >
              Subscription History
            </button>
          </div>

          {activeTab === "plans" && (
            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative p-4 border rounded-xl transition-all hover:shadow-md ${
                    plan.popular 
                      ? 'border-green-300 bg-green-50' 
                      : plan.bestValue 
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-slate-200 bg-white'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-4 bg-green-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                      Most Popular
                    </div>
                  )}
                  {plan.bestValue && (
                    <div className="absolute -top-2 left-4 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                      Best Value
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">{plan.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-brand-700">
                        {plan.currency}{plan.price}
                      </div>
                      <div className="text-xs text-slate-500">
                        for {plan.duration} {plan.duration === 1 ? 'day' : 'days'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-xs text-slate-600 mb-2">Features included:</div>
                    <div className="space-y-1">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-success-600" />
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={subscriptionData.currentPlan?.id === plan.id && isActive}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      subscriptionData.currentPlan?.id === plan.id && isActive
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : plan.popular
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : plan.bestValue
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-brand-600 hover:bg-brand-700 text-white'
                    }`}
                  >
                    {subscriptionData.currentPlan?.id === plan.id && isActive
                      ? 'Current Plan'
                      : `Subscribe for ${plan.currency}${plan.price}`
                    }
                  </button>
                </div>
              ))}
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-6">
                <h4 className="font-semibold text-blue-800 mb-2">How Subscriptions Work:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Choose a plan and pay upfront</li>
                  <li>• Get unlimited order access during the plan period</li>
                  <li>• Earnings are paid directly to your account</li>
                  <li>• Auto-renewal available for continuous access</li>
                  <li>• Cancel or change plans anytime</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {subscriptionData.subscriptionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600">No subscription history yet</p>
                  <p className="text-sm text-slate-500 mt-1">Your subscription history will appear here</p>
                </div>
              ) : (
                subscriptionData.subscriptionHistory.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        subscription.status === "active" 
                          ? "bg-success-100" 
                          : subscription.status === "completed"
                            ? "bg-blue-100"
                            : "bg-slate-100"
                      }`}>
                        <Crown className={`w-5 h-5 ${
                          subscription.status === "active" 
                            ? "text-success-600" 
                            : subscription.status === "completed"
                              ? "text-blue-600"
                              : "text-slate-600"
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{subscription.planName}</p>
                        <p className="text-xs text-slate-600">
                          {formatSubscriptionDate(subscription.activationDate)} - {formatSubscriptionDate(subscription.expiryDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-error-600">
                        -{formatCurrency(subscription.amount)}
                      </p>
                      <p className={`text-xs capitalize ${
                        subscription.status === 'active' 
                          ? 'text-success-600' 
                          : subscription.status === 'completed'
                            ? 'text-blue-600'
                            : 'text-slate-500'
                      }`}>
                        {subscription.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
