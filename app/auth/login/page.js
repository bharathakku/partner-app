"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import OTPInput from "@/components/OTPInput"
import { Loader2, Phone, ArrowLeft } from "lucide-react"

// Wrap useSearchParams usage in a Suspense boundary to satisfy Next.js prerendering
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-600">Loading...</div>}>
      <LoginInner />
    </Suspense>
  )
}

function LoginInner() {
  const [phone, setPhone] = useState("")
  const [step, setStep] = useState("phone")
  const [mode, setMode] = useState("login") // "login" or "signup"
  const [otpSessionToken, setOtpSessionToken] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Normalize API base: prefer env, else current origin. Always include '/api'
  const API_BASE = (() => {
    const envBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
    const base = (envBase && envBase.trim().length > 0)
      ? envBase.trim().replace(/\/$/, "")
      : (typeof window !== 'undefined' ? `${window.location.origin}` : "")
    if (!base) return "/api"
    return base.endsWith("/api") ? base : `${base}/api`
  })()

  // Initialize mode from URL params or localStorage
  useEffect(() => {
    const urlMode = searchParams.get('mode')
    const storedMode = localStorage.getItem('auth_mode')
    const storedPhone = localStorage.getItem('partner_phone')
    
    if (urlMode && (urlMode === 'login' || urlMode === 'signup')) {
      setMode(urlMode)
    } else if (storedMode && (storedMode === 'login' || storedMode === 'signup')) {
      setMode(storedMode)
    }
    
    if (storedPhone) {
      setPhone(storedPhone)
    }
  }, [searchParams])

  const validatePhone = () => /^\d{10}$/.test(phone)

  const routeAfterAuth = async (jwt) => {
    try {
      const res = await fetch(`${API_BASE}/drivers/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
        credentials: 'include'
      })
      if (!res.ok) {
        // If profile fetch fails: signup -> KYC, login -> activation pending
        router.replace(mode === "signup" ? "/auth/kyc" : "/auth/activation-pending")
        return
      }
      const driver = await res.json()
      if (driver && driver.exists === false) {
        router.replace("/auth/kyc")
        return
      }
      // Decide path by documents and active state
      const docs = Array.isArray(driver?.documents) ? driver.documents : []
      const hasDocs = docs.length > 0
      const isActive = !!driver?.isActive
      if (!hasDocs) {
        router.replace("/auth/kyc")
        return
      }
      if (!isActive) {
        router.replace("/auth/activation-pending")
        return
      }
      try { localStorage.setItem('driver_profile', JSON.stringify(driver)) } catch {}
      // Profile exists -> go to main dashboard
      router.replace("/dashboard")
    } catch {
      router.replace(mode === "signup" ? "/auth/kyc" : "/dashboard")
    }
  }

  const handleVerifyOTP = async (enteredOtp) => {
    setError("")
    setSuccess("")
    setIsVerifying(true)
    try {
      const res = await fetch(`${API_BASE}/auth/phone/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otpSessionToken, code: enteredOtp, role: "driver" })
      })
      const data = await res.json()
      if (!res.ok || !data.token) throw new Error(data.error || "Invalid OTP")
      setSuccess(mode === "signup" ? "Account created successfully!" : "Login successful!")
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("user_data", JSON.stringify(data.user))
      await routeAfterAuth(data.token)
    } catch (err) {
      setError(err.message || "An error occurred while verifying OTP")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleBack = () => {
    setStep("phone")
    setError("")
    setSuccess("")
  }

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login")
    setError("")
    setSuccess("")
    setStep("phone")
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (!validatePhone()) {
      setError("Enter a valid 10-digit phone number")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/phone/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "+91" + phone, role: "driver", mode })
      })
      const data = await res.json()
      if (!res.ok || !data.token) throw new Error(data.error || "Failed to send OTP")
      setOtpSessionToken(data.token)
      setSuccess(`OTP sent to your phone! ${mode === "signup" ? "Complete signup by verifying." : ""}`)
      setStep("otp")
      if (data.devCode) {
        try { setTimeout(() => handleVerifyOTP(String(data.devCode)), 200) } catch {}
      }
    } catch (err) {
      setError(err.message || "An error occurred while sending OTP")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 flex flex-col justify-center p-6">
      <div className="feature-card max-w-md w-full mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {mode === "login" ? "Partner Login" : "Partner Sign Up"}
          </h2>
          <p className="text-sm text-slate-600">
            {mode === "login" ? "Sign in with your phone number" : "Create your partner account"}
          </p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label htmlFor="login-phone" className="block text-sm font-medium text-slate-700 mb-2">
                📱 Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-sm font-medium">+91</span>
                </div>
                <input
                  id="login-phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0,10))}
                  className="w-full pl-16 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none text-center text-lg font-semibold tracking-wider transition-colors"
                  placeholder="0000000000"
                  maxLength={10}
                  autoComplete="tel"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !validatePhone()}
              className="partner-button-primary w-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2"/> Sending OTP...</>
              ) : (
                <><Phone className="w-5 h-5 mr-2"/> {mode === "login" ? "Send OTP" : "Create Account"}</>
              )}
            </button>

            {error && <div className="mt-2 text-error-600 text-sm">{error}</div>}
            {success && <div className="mt-2 text-green-600 text-sm">{success}</div>}
            
            {/* Mode Toggle */}
            <div className="text-center pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-2">
                {mode === "login" ? "New to our platform?" : "Already have an account?"}
              </p>
              <button
                type="button"
                onClick={toggleMode}
                className="text-brand-600 hover:text-brand-700 font-medium text-sm underline"
                disabled={isLoading}
              >
                {mode === "login" ? "Sign up as Partner" : "Login instead"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button onClick={handleBack} className="text-slate-600 hover:text-slate-800 flex items-center gap-1 text-sm" disabled={isVerifying}>
                <ArrowLeft className="w-4 h-4"/> Change Number
              </button>
              <button
                onClick={handleSendOTP}
                className="text-sm text-brand-700 hover:underline"
                disabled={isLoading || isVerifying}
              >
                Resend OTP
              </button>
            </div>
            <OTPInput
              length={6}
              onComplete={code => { if (code.length === 6) handleVerifyOTP(code) }}
              disabled={isVerifying}
            />
            <button
              onClick={() => handleVerifyOTP(document.querySelector('[data-otp-input]')?.value || "")}
              disabled={isVerifying}
              className="partner-button-primary w-full py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isVerifying ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2"/> Verifying...</>
              ) : (
                mode === "login" ? 'Verify & Login' : 'Verify & Create Account'
              )}
            </button>
            {error && <div className="mt-1 text-error-600 text-sm">{error}</div>}
            {success && <div className="mt-1 text-green-600 text-sm">{success}</div>}
          </div>
        )}
      </div>
    </div>
  )
}