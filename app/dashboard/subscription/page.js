"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Crown, Check, Star, Zap, IndianRupee, CalendarDays, TimerReset } from "lucide-react"
import BottomNav from "../../../components/BottomNav"
import { getPlansArray, getPlanById, getSubscriptionStatus, formatSubscriptionDateTime } from "../../../lib/subscription"
import { apiClient } from "../../../lib/api/apiClient"

export default function SubscriptionPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('weekly')
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const driver = await apiClient.get('/drivers/me')
        if (!mounted) return
        if (driver && driver.subscriptionExpiry) {
          const plan = getPlanById(driver.subscriptionPlan) || null
          const expiry = new Date(driver.subscriptionExpiry)
          let activation = new Date(expiry)
          const dur = plan?.duration || 0
          if (dur > 0) activation.setDate(activation.getDate() - dur)
          const sub = {
            currentPlan: plan ? plan : { id: driver.subscriptionPlan || 'plan', name: 'Active Plan' },
            activationDate: activation.toISOString(),
            expiryDate: expiry.toISOString(),
            autoRenewal: false,
            subscriptionHistory: []
          }
          setSubscription(sub)
        } else {
          setSubscription(null)
        }
      } catch {
        setSubscription(null)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Get subscription plans from lib
  const subscriptionPlans = getPlansArray()

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId)
  }

  const handleContinue = () => {
    const plan = subscriptionPlans.find(p => p.id === selectedPlan)
    router.push(`/dashboard/subscription/pay?planId=${selectedPlan}&amount=${plan.price}`)
  }

  const hasSubscription = !!subscription && !!subscription.currentPlan
  const status = useMemo(() => subscription ? getSubscriptionStatus(subscription) : { status: 'inactive', message: 'No active subscription' }, [subscription])

  const handleRenew = () => {
    if (!subscription?.currentPlan) return
    const plan = getPlanById(subscription.currentPlan.id) || subscription.currentPlan
    router.push(`/dashboard/subscription/pay?planId=${plan.id}&amount=${plan.price}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Crown className="w-6 h-6 text-brand-600" />
              Choose Your Plan
            </h1>
            <p className="text-sm text-slate-600">Select the perfect subscription for you</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Subscription Summary */}
        {hasSubscription && (
          <div className="partner-card p-6 border-brand-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs uppercase text-slate-500">Current Plan</div>
                <div className="text-lg font-bold text-slate-800">{subscription.currentPlan.name}</div>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${status.status === 'active' ? 'bg-green-100 text-green-700' : status.status === 'expiring' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                {status.message}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-slate-500" />
                <span>Activated: <strong className="text-slate-900">{formatSubscriptionDateTime(subscription.activationDate)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <TimerReset className="w-4 h-4 text-slate-500" />
                <span>Ends on: <strong className="text-slate-900">{formatSubscriptionDateTime(subscription.expiryDate)}</strong></span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={handleRenew}
                className="partner-button-primary w-full py-3 text-sm font-semibold"
              >
                Renew
              </button>
              <button
                onClick={() => router.push('/dashboard/subscription')}
                className="w-full py-3 text-sm font-semibold border border-slate-300 rounded-xl bg-white hover:bg-slate-50"
              >
                Change Plan
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Start Earning with DeliveryPro
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Choose a plan that fits your schedule and start earning immediately
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="space-y-4">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => handlePlanSelect(plan.id)}
              className={`relative feature-card p-6 cursor-pointer transition-all duration-300 ${
                selectedPlan === plan.id 
                  ? 'border-2 border-brand-500 bg-brand-50/50' 
                  : 'border border-slate-200 hover:border-brand-300 hover:bg-brand-50/20'
              }`}
            >
              {(plan.popular || plan.bestValue) && (
                <div className="absolute -top-3 left-6">
                  <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {plan.bestValue ? 'Best Value' : 'Most Popular'}
                  </div>
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4 pr-10">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                  <p className="text-sm text-slate-600">{plan.description}</p>
                </div>
                <div className="text-right ml-4 flex-shrink-0 max-w-[100px]">
                  <div className="text-xl font-bold text-brand-600 flex items-center justify-end">
                    <IndianRupee className="w-4 h-4" />
                    {plan.price}
                  </div>
                  <div className="text-xs text-slate-500 whitespace-nowrap">per {plan.duration === 1 ? plan.durationType : `${plan.duration} ${plan.durationType}s`}</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-success-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Selection Indicator */}
              <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all ${
                selectedPlan === plan.id 
                  ? 'border-brand-500 bg-brand-500' 
                  : 'border-slate-300'
              }`}>
                {selectedPlan === plan.id && (
                  <Check className="w-4 h-4 text-white absolute top-0.5 left-0.5" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="feature-card p-6 bg-gradient-to-r from-success-50 to-brand-50 border-success-200">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-success-600" />
            What You Get
          </h3>
          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success-600" />
              <span>Instant access to all available orders</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success-600" />
              <span>24/7 customer and partner support</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success-600" />
              <span>Real-time earnings tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success-600" />
              <span>Flexible working hours</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="partner-button-primary w-full py-4 text-lg font-semibold"
        >
          {hasSubscription ? 'Change / Extend Plan' : `Continue with ${subscriptionPlans.find(p => p.id === selectedPlan)?.name} - ₹${subscriptionPlans.find(p => p.id === selectedPlan)?.price}`}
        </button>

        {/* Footer Info */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>Cancel anytime • No hidden fees • Secure payments</p>
          <p>
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-brand-600">Terms</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-brand-600">Privacy Policy</Link>
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
