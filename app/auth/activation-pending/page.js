"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Clock, CheckCircle, Phone, MessageCircle, RefreshCw, AlertCircle } from "lucide-react"
import { getVehicleTypeById } from "../../../lib/registration"
import { API_BASE_URL } from "../../../lib/api/apiClient"

export default function ActivationPending() {
  const [timeRemaining, setTimeRemaining] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activationStatus, setActivationStatus] = useState("pending")
  const [registrationData, setRegistrationData] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Load registration data from localStorage
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('partner_registration')
      if (storedData) {
        try {
          setRegistrationData(JSON.parse(storedData))
        } catch (e) {
          console.error('Error parsing registration data:', e)
        }
      }
    }
    
    // Simulate activation time (24-48 hours)
    const activationTime = new Date()
    activationTime.setHours(activationTime.getHours() + 36) // 36 hours from now

    const updateTimer = () => {
      const now = new Date()
      const timeDiff = activationTime - now

      if (timeDiff <= 0) {
        setActivationStatus("ready")
        setTimeRemaining("Account ready for activation!")
      } else {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeRemaining(`${hours}h ${minutes}m remaining`)
      }
    }

    updateTimer()

    // Initial status check on mount: do NOT auto-redirect; require user to tap Check Status
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const checkNow = async () => {
      if (!token) return
      try {
        const res = await fetch(`${API_BASE_URL}/drivers/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include'
        })
        if (res.ok) {
          const data = await res.json()
          // Driver route returns either driver doc or { exists:false }
          const docs = Array.isArray(data?.documents) ? data.documents : []
          const hasDocs = docs.length > 0
          const docsApproved = hasDocs && docs.every(d => (d?.status || '').toLowerCase() === 'approved')
          const isActive = !!data?.isActive
          if (isActive && docsApproved) { setActivationStatus('ready') }
        }
      } catch {}
    }
    checkNow()
    const timer = setInterval(updateTimer, 60000) // Update every minute
    return () => { clearInterval(timer) }
  }, [])

  const handleRefreshStatus = async () => {
    setIsRefreshing(true)
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) {
        setActivationStatus("pending")
        return
      }
      const res = await fetch(`${API_BASE_URL}/drivers/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        const docs = Array.isArray(data?.documents) ? data.documents : []
        const hasDocs = docs.length > 0
        const docsApproved = hasDocs && docs.every(d => (d?.status || '').toLowerCase() === 'approved')
        const isActive = !!data?.isActive
        if (isActive && docsApproved) { setActivationStatus('ready'); router.replace('/dashboard') }
        else { setActivationStatus('pending') }
      } else {
        setActivationStatus('pending')
      }
    } catch (err) {
      console.error("Failed to refresh status:", err)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusIcon = () => {
    switch (activationStatus) {
      case "ready":
        return <CheckCircle className="w-16 h-16 text-success-500" />
      case "pending":
      default:
        return <Clock className="w-16 h-16 text-warning-500" />
    }
  }

  const getStatusMessage = () => {
    switch (activationStatus) {
      case "ready":
        return {
          title: "Account Ready!",
          description: "Your account has been verified and is ready for activation."
        }
      case "pending":
      default:
        return {
          title: "Account Under Review",
          description: "Our team is reviewing your documents and will activate your account soon."
        }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warning-50 via-white to-warning-100 flex flex-col justify-center p-6">
      <div className="max-w-md mx-auto w-full text-center">
        {/* Status Icon */}
        <div className="flex justify-center mb-8">
          {getStatusIcon()}
        </div>

        {/* Status Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            {getStatusMessage().title}
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            {getStatusMessage().description}
          </p>
          
          {activationStatus === "pending" && (
            <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 text-warning-700">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">{timeRemaining}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Cards */}
        <div className="space-y-4 mb-8">
          {activationStatus === "ready" ? (
            <button 
              onClick={() => router.push("/dashboard")}
              className="partner-button-primary w-full py-4 text-lg font-semibold"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
                className="partner-button-primary w-full py-4 text-base font-semibold disabled:opacity-50"
              >
                {isRefreshing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Checking Status...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-5 h-5" />
                    <span>Check Status</span>
                  </div>
                )}
              </button>

              <div className="grid grid-cols-2 gap-4">
                <Link 
                  href="/support" 
                  className="partner-button-secondary py-3 text-sm font-semibold flex items-center justify-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Support</span>
                </Link>
                
                <Link 
                  href="/support/chat" 
                  className="partner-button-secondary py-3 text-sm font-semibold flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Live Chat</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Registration Summary */}
        {registrationData && (
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-slate-800 mb-4">Registration Summary</h3>
            
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-600 mb-1">Vehicle Type</p>
                <p className="font-medium text-slate-800">
                  {getVehicleTypeById(registrationData.vehicleType)?.icon} {getVehicleTypeById(registrationData.vehicleType)?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Vehicle Number</p>
                <p className="font-medium text-slate-800">{registrationData.vehicleNumber}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Information Cards */}
        <div className="space-y-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl p-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Documents Submitted</h3>
                <p className="text-sm text-slate-600">All required documents and vehicle photo received</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl p-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-warning-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Background Verification</h3>
                <p className="text-sm text-slate-600">In progress - typically takes 24-48 hours</p>
              </div>
            </div>
          </div>

        </div>

        {/* Important Note */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-brand-700 leading-relaxed">
            <span className="font-semibold">Important:</span> You'll receive an SMS and email notification 
            once your account is activated. Keep this app handy!
          </p>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-4">
            Need to update your information?
          </p>
          <Link 
            href="/auth/phone" 
            className="text-brand-600 font-semibold hover:underline"
          >
            Start Over
          </Link>
        </div>
      </div>
    </div>
  )
}
