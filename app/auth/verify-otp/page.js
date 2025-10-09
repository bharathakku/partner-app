"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { formatPhoneNumber } from "../../../lib/utils"

export default function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [phone, setPhone] = useState("")
  const [authMode, setAuthMode] = useState("login")
  const [countryCode, setCountryCode] = useState("91")
  const [usingDevCode, setUsingDevCode] = useState(false)
  const inputRefs = useRef([])
  const router = useRouter()
  // Normalize API base: prefer env, else current origin. Always include '/api'
  const API_BASE = (() => {
    const envBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
    const base = (envBase && envBase.trim().length > 0)
      ? envBase.trim().replace(/\/$/, "")
      : (typeof window !== 'undefined' ? `${window.location.origin}` : "")
    if (!base) return "/api"
    return base.endsWith("/api") ? base : `${base}/api`
  })()
  const [otpToken, setOtpToken] = useState("")

  // Define handleVerify BEFORE effects that reference it
  const handleVerify = useCallback(async (otpCode = otp.join("")) => {
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      if (!otpToken) {
        setError("OTP session expired. Please request a new code.")
        return
      }

      const res = await fetch(`${API_BASE}/auth/phone/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otpToken, code: otpCode, role: "partner" })
      })
      const data = await res.json()
      if (!res.ok || !data.token) {
        throw new Error(data.error || "Invalid verification code")
      }

      // Persist auth
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("user_data", JSON.stringify(data.user))
      localStorage.setItem("partner_authenticated", "true")

      // Navigate post-login
      if (authMode === "signup") {
        router.push("/auth/kyc")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [otp, otpToken, authMode, router, API_BASE])

  useEffect(() => {
    // Get phone number and auth mode from localStorage
    const storedPhone = localStorage.getItem("partner_phone")
    const storedAuthMode = localStorage.getItem("auth_mode") || "login"
    const storedToken = localStorage.getItem("partner_otp_token") || ""
    const storedCc = localStorage.getItem("partner_country_code") || "91"
    const storedDevCode = localStorage.getItem("partner_dev_code") || ""
    
    if (!storedPhone) {
      router.push("/auth/phone")
      return
    }
    
    setPhone(storedPhone)
    setAuthMode(storedAuthMode)
    setCountryCode(storedCc)
    setOtpToken(storedToken)

    // If backend provided a devCode (SMS not sent), auto-verify for faster testing
    if (storedDevCode && storedDevCode.length === 6) {
      setUsingDevCode(true)
      setTimeout(() => handleVerify(String(storedDevCode)), 200)
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router, handleVerify])

  const handleInputChange = (index, value) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (value && newOtp.every(digit => digit)) {
      handleVerify(newOtp.join(""))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  

  const handleResendOTP = async () => {
    if (!canResend) return

    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/phone/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+${countryCode}${phone}`, role: "partner" })
      })
      const data = await res.json()
      if (!res.ok || !data.token) throw new Error(data.error || "Failed to resend code")

      // Save new OTP token
      setOtpToken(data.token)
      localStorage.setItem("partner_otp_token", data.token)

      // Update dev code info from backend if provided
      if (data.devCode) {
        localStorage.setItem("partner_dev_code", String(data.devCode))
        setUsingDevCode(true)
      } else {
        localStorage.removeItem("partner_dev_code")
        setUsingDevCode(false)
      }

      // Reset timer and inputs
      setResendTimer(30)
      setCanResend(false)
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()

      // Restart countdown
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (err) {
      setError(err.message || "Failed to resend code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 mb-8">
        <Link href="/auth/phone" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <h1 className="text-lg font-semibold text-slate-800">Verify Code</h1>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            {authMode === "signup" ? "Complete Account Creation" : "Verify Login"}
          </h2>
          <p className="text-slate-600 leading-relaxed mb-2">
            {authMode === "signup" 
              ? "Enter the verification code sent to"
              : "We've sent a login code to"
            }
          </p>
          <p className="text-brand-600 font-semibold text-lg">
            +{countryCode} {formatPhoneNumber(phone)}
          </p>
          {usingDevCode && (
            <p className="mt-2 text-xs text-slate-500">Using development code from server for testing</p>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4 text-center">
              Verification Code
            </label>
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
                  autoComplete="off"
                />
              ))}
            </div>
            {error && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-error-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.some(digit => !digit)}
            className="partner-button-primary w-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify Code"
            )}
          </button>
        </form>

        {/* Resend Code */}
        <div className="text-center mt-8">
          {canResend ? (
            <button
              onClick={handleResendOTP}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 text-brand-600 hover:text-brand-700 font-semibold transition-colors mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Resend Code</span>
            </button>
          ) : (
            <p className="text-slate-600">
              Resend code in{" "}
              <span className="font-semibold text-brand-600">{resendTimer}s</span>
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-8">
        <p className="text-xs text-slate-500">
          Didn't receive the code?{" "}
          <Link href="/support" className="text-brand-600 underline">
            Get Help
          </Link>
        </p>
      </div>
    </div>
  )
}
