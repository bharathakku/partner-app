"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, IndianRupee, CreditCard, QrCode, Check, Shield, Clock } from "lucide-react"
import BottomNav from "../../../../components/BottomNav"
import { formatCurrency } from "../../../../lib/utils"

function WalletPayContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const amountParam = searchParams.get("amount")
  const amount = useMemo(() => {
    const v = Math.max(10, Math.floor(Number(amountParam) || 0))
    return v
  }, [amountParam])

  const [method, setMethod] = useState("upi") // 'upi' | 'card'
  const [upiId, setUpiId] = useState("")
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" })

  const handleProceed = () => {
    // This would integrate with a gateway; here we just simulate
    if (typeof window !== 'undefined') {
      try {
        // Mark weekly settlement until today so dues recalculate from tomorrow
        const today = new Date()
        const keyDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().slice(0,10)
        window.localStorage.setItem('weekly_settled_until', keyDate)
      } catch (e) {
        // ignore storage errors
      }
    }
    alert(`Proceeding to pay ${formatCurrency(amount)} via ${method.toUpperCase()}`)
    router.push("/dashboard/wallet")
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
          <h1 className="text-xl font-bold text-slate-800">Pay Dues</h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Amount */}
        <div className="partner-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Amount to Pay</p>
              <p className="text-3xl font-bold text-brand-700 mt-1">{formatCurrency(amount)}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-emerald-700 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" /> Secure Payment
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">This payment adjusts your pending platform charges.</p>
        </div>

        {/* Methods */}
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
            Proceed to Pay {formatCurrency(amount)}
          </button>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> You will be redirected back to Wallet after payment.
          </p>
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
          <h1 className="text-xl font-bold text-slate-800">Pay Dues</h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Amount Loading */}
        <div className="partner-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Amount to Pay</p>
              <div className="w-32 h-8 bg-slate-200 rounded mt-1 animate-pulse"></div>
            </div>
            <div className="w-32 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
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

export default function WalletPayPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WalletPayContent />
    </Suspense>
  )
}

