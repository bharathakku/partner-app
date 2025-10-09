"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, IndianRupee, CreditCard, QrCode, Check, Shield, Clock, Crown, Calendar } from "lucide-react"
import BottomNav from "../../../../components/BottomNav"
import { formatCurrency } from "../../../../lib/utils"
import { getPlanById, calculateExpiryDate, getStoredSubscription, setStoredSubscription, formatSubscriptionDateTime } from "../../../../lib/subscription"

function SubscriptionPayContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get("planId")
  const amountParam = searchParams.get("amount")
  
  const plan = useMemo(() => {
    return getPlanById(planId)
  }, [planId])
  
  const amount = useMemo(() => {
    const v = Math.max(10, Math.floor(Number(amountParam) || 0))
    return v
  }, [amountParam])

  const [method, setMethod] = useState("upi") // 'upi' | 'card'
  const [upiId, setUpiId] = useState("")
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" })
  
  // Calculate subscription period (renew starts after existing expiry if still active)
  const now = new Date()
  const existing = getStoredSubscription()
  const baseStart = useMemo(() => {
    if (!existing?.expiryDate) return now
    const existingExpiry = new Date(existing.expiryDate)
    return existingExpiry > now ? existingExpiry : now
  }, [existing])
  const activationDate = baseStart
  const expiryDate = plan ? calculateExpiryDate(activationDate, plan) : null

  const handleProceed = () => {
    // This would integrate with a payment gateway; here we just simulate
    if (typeof window !== 'undefined') {
      try {
        // Store subscription data in localStorage (in real app, this would be API calls)
        const prev = existing || {}
        const history = Array.isArray(prev.subscriptionHistory) ? prev.subscriptionHistory : []
        const record = {
          id: Date.now(),
          planId: plan.id,
          planName: plan.name,
          amount: plan.price,
          activationDate: activationDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
          status: 'active'
        }
        const subscriptionData = {
          currentPlan: plan,
          activationDate: activationDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
          autoRenewal: false,
          subscriptionHistory: [...history, record]
        }
        setStoredSubscription(subscriptionData)
      } catch (e) {
        // ignore storage errors
      }
    }
    alert(`Successfully subscribed to ${plan?.name} for ${formatCurrency(amount)} via ${method.toUpperCase()}`)
    router.push("/dashboard/subscription")
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
        <div className="p-6">
          <div className="text-center py-8">
            <p className="text-slate-600">Invalid subscription plan</p>
            <button 
              onClick={() => router.back()}
              className="mt-4 bg-brand-600 text-white px-6 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Subscribe to Plan</h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Subscription Plan Details */}
        <div className="partner-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
              <p className="text-sm text-slate-600">{plan.description}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-600">Subscription Amount</span>
              <span className="text-2xl font-bold text-brand-700">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-600">Duration</span>
              <span className="font-semibold text-slate-800">{plan.duration} {plan.duration === 1 ? 'day' : 'days'}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-600">Activation Date</span>
              <span className="font-semibold text-slate-800">{formatSubscriptionDateTime(activationDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Expiry Date</span>
              <span className="font-semibold text-slate-800">{formatSubscriptionDateTime(expiryDate)}</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-success-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">What's Included:</span>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              {plan.features.slice(0, 4).map((feature, idx) => (
                <li key={idx}>• {feature}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="partner-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Select Payment Method</h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setMethod("upi")}
              className={`flex items-center gap-2 p-3 rounded-lg border ${method === "upi" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"}`}
            >
              <QrCode className="w-5 h-5" /> UPI
              {method === "upi" && <Check className="w-4 h-4 text-brand-600 ml-auto" />}
            </button>
            <button
              onClick={() => setMethod("card")}
              className={`flex items-center gap-2 p-3 rounded-lg border ${method === "card" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"}`}
            >
              <CreditCard className="w-5 h-5" /> Card
              {method === "card" && <Check className="w-4 h-4 text-brand-600 ml-auto" />}
            </button>
          </div>

          {method === "upi" ? (
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Enter UPI ID</label>
              <input
                type="text"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="grid grid-cols-3 gap-2 text-sm">
                <button onClick={() => setUpiId("9876543210@upi")} className="px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">PhonePe</button>
                <button onClick={() => setUpiId("yourname@oksbi")} className="px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">SBI</button>
                <button onClick={() => setUpiId("yourname@okicici")} className="px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">ICICI</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Card Details</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                value={card.number}
                onChange={(e) => setCard({ ...card, number: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input
                  type="password"
                  placeholder="CVV"
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <input
                type="text"
                placeholder="Name on card"
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          <button
            onClick={handleProceed}
            className="mt-6 w-full bg-brand-600 text-white py-3 px-6 rounded-xl text-base font-semibold hover:bg-brand-700 transition-colors"
          >
            Subscribe for {formatCurrency(amount)}
          </button>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> You will be redirected back to Subscription after payment.
          </p>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Your subscription will be activated immediately after successful payment. 
              You can start accepting orders right away!
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse"></div>
          <h1 className="text-xl font-bold text-slate-800">Subscribe to Plan</h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Plan Details Loading */}
        <div className="partner-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
            <div>
              <div className="w-32 h-5 bg-slate-200 rounded animate-pulse mb-2"></div>
              <div className="w-48 h-4 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="bg-slate-100 rounded-lg p-4 mb-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="w-24 h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="w-16 h-6 bg-slate-200 rounded animate-pulse"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="w-20 h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="w-12 h-4 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Methods Loading */}
        <div className="partner-card p-6">
          <div className="w-48 h-6 bg-slate-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="w-full h-12 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="w-full h-12 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="w-24 h-4 bg-slate-200 rounded animate-pulse"></div>
            <div className="w-full h-10 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default function SubscriptionPayPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SubscriptionPayContent />
    </Suspense>
  )
}
