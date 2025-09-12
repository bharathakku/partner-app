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
      // Simulate quick processing for free registration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Store registration completion data
      if (typeof window !== 'undefined') {
        const registrationData = {
          vehicleType,
          amount: 0,
          registrationMethod: 'free',
          registrationId: `FREE_REG_${Date.now()}`,
          completedAt: new Date().toISOString(),
          status: 'completed'
        }
        
        localStorage.setItem('registration_payment', JSON.stringify(registrationData))
      }
      
      alert('Registration completed successfully! Welcome to DeliveryPro!')
      router.push("/auth/activation-pending")
    } catch (err) {
      alert("Registration failed. Please try again.")
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
          
          <div className="bg-success-50 rounded-lg p-4 mb-6 border border-success-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-success-800 font-medium">Registration Fee</span>
              <span className="text-3xl font-bold text-success-700">FREE</span>
            </div>
            <div className="text-sm text-success-700">
              ✓ No registration fee required - Start earning immediately!
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-semibold text-slate-800 mb-4">What You Get with Free Registration:</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-success-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">Instant Partner Access</p>
                  <p className="text-xs text-slate-600">
                    Immediate access to all delivery opportunities in your area
                  </p>
                </div>
                <div className="text-sm font-semibold text-success-700">✓</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-success-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">Start Earning Today</p>
                  <p className="text-xs text-slate-600">
                    Begin taking delivery orders immediately after verification
                  </p>
                </div>
                <div className="text-sm font-semibold text-success-700">✓</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-success-50 rounded-lg border border-success-200">
            <p className="text-sm text-success-800">
              <strong>Zero Registration Fee:</strong> We believe in making it easy for partners to join. No upfront costs - just bring your vehicle and start earning!
            </p>
          </div>
        </div>

        {/* Complete Registration */}
        <div className="partner-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Complete Your Registration</h3>

          <div className="mb-6 p-4 bg-gradient-to-r from-brand-50 to-success-50 rounded-lg border border-success-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Ready to Start!</h4>
                <p className="text-sm text-slate-600">Your documents are verified and ready for processing</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleProceed}
            disabled={isLoading}
            className="w-full bg-success-600 text-white py-4 px-6 rounded-xl text-base font-semibold hover:bg-success-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Completing Registration...</span>
              </div>
            ) : (
              'Complete Free Registration & Start Earning'
            )}
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4" />
            <span>Secure registration process</span>
          </div>
          
          <div className="mt-4 p-3 bg-success-50 rounded-lg border border-success-200">
            <p className="text-xs text-success-700">
              <strong>Note:</strong> After completing registration, your account will be submitted for verification. 
              You can start earning once verification is complete (usually within 24 hours).
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
