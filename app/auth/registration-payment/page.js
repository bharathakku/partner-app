"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, IndianRupee, CreditCard, QrCode, Check, Shield, Clock, Package, Shirt } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "../../../lib/utils"
import { getVehicleTypeById, formatRegistrationFee, getRegistrationIncludes, isTwoWheeler } from "../../../lib/registration"

function RegistrationPaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicleType = searchParams.get("vehicleType") || "bike"
  const amount = parseInt(searchParams.get("amount")) || 1000
  
  const vehicle = useMemo(() => {
    return getVehicleTypeById(vehicleType)
  }, [vehicleType])

  const [method, setMethod] = useState("upi") // 'upi' | 'card'
  const [upiId, setUpiId] = useState("")
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" })
  const [isLoading, setIsLoading] = useState(false)

  const handleProceed = async () => {
    setIsLoading(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Store payment success data
      if (typeof window !== 'undefined') {
        const paymentData = {
          vehicleType,
          amount,
          paymentMethod: method,
          paymentId: `REG_PAY_${Date.now()}`,
          paidAt: new Date().toISOString(),
          includes: getRegistrationIncludes(vehicleType)
        }
        
        localStorage.setItem('registration_payment', JSON.stringify(paymentData))
      }
      
      alert(`Registration fee payment successful! ₹${amount} paid via ${method.toUpperCase()}`)
      router.push("/auth/activation-pending")
    } catch (err) {
      alert("Payment failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
        <div className="p-6">
          <div className="text-center py-8">
            <p className="text-slate-600">Invalid vehicle type</p>
            <Link href="/auth/kyc" className="mt-4 bg-brand-600 text-white px-6 py-2 rounded-lg">
              Go Back
            </Link>
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
          <Link href="/auth/kyc" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Registration Payment</h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Registration Package Details */}
        <div className="partner-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-brand-600 rounded-xl flex items-center justify-center">
              <span className="text-3xl">{vehicle.icon}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{vehicle.name} Registration</h3>
              <p className="text-sm text-slate-600">{vehicle.description}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-600 font-medium">Registration Fee</span>
              <span className="text-3xl font-bold text-brand-700">{formatRegistrationFee(amount)}</span>
            </div>
            <div className="text-sm text-slate-600">
              One-time registration fee for partner onboarding
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-semibold text-slate-800 mb-4">Your Registration Package Includes:</h4>
            <div className="space-y-3">
              {getRegistrationIncludes(vehicleType).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                    {item.includes('bag') ? <Package className="w-5 h-5 text-success-600" /> : <Shirt className="w-5 h-5 text-success-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{item}</p>
                    <p className="text-xs text-slate-600">
                      {item.includes('bag') ? 'Professional insulated delivery bag' : 'Official branded partner uniform'}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-success-700">✓</div>
                </div>
              ))}
            </div>
          </div>
          
          {isTwoWheeler(vehicleType) ? (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Two-Wheeler Special:</strong> Complete starter kit with delivery bag and uniform - everything you need to start earning!
              </p>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Multi-Wheeler Advantage:</strong> Lower registration fee since no delivery bag needed - your vehicle provides the storage space!
              </p>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="partner-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Select Payment Method</h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setMethod("upi")}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${method === "upi" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <QrCode className="w-5 h-5" /> UPI
              {method === "upi" && <Check className="w-4 h-4 text-brand-600 ml-auto" />}
            </button>
            <button
              onClick={() => setMethod("card")}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${method === "card" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
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
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="grid grid-cols-3 gap-2 text-sm">
                <button onClick={() => setUpiId("9876543210@paytm")} className="px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">Paytm</button>
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
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input
                  type="password"
                  placeholder="CVV"
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <input
                type="text"
                placeholder="Name on card"
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          <button
            onClick={handleProceed}
            disabled={isLoading}
            className="mt-6 w-full bg-brand-600 text-white py-4 px-6 rounded-xl text-base font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing Payment...</span>
              </div>
            ) : (
              `Pay ${formatRegistrationFee(amount)} & Complete Registration`
            )}
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4" />
            <span>Secure payment processing</span>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> After successful payment, your account will be submitted for verification. 
              You'll receive your registration kit within 2-3 business days.
            </p>
          </div>
        </div>
      </div>
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
          <h1 className="text-xl font-bold text-slate-800">Registration Payment</h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Package Details Loading */}
        <div className="partner-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-slate-200 rounded-xl animate-pulse"></div>
            <div>
              <div className="w-48 h-6 bg-slate-200 rounded animate-pulse mb-2"></div>
              <div className="w-32 h-4 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="bg-slate-100 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="w-24 h-5 bg-slate-200 rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Payment Methods Loading */}
        <div className="partner-card p-6">
          <div className="w-48 h-6 bg-slate-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="w-full h-12 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="w-full h-12 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegistrationPaymentPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RegistrationPaymentContent />
    </Suspense>
  )
}
