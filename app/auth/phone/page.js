"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Phone, Loader2, AlertCircle } from "lucide-react"
import { validatePhoneNumber, formatPhoneNumber } from "../../../lib/utils"

export default function PhoneVerification() {
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [authMode, setAuthMode] = useState("login")
  const router = useRouter()
  
  useEffect(() => {
    // Check if this is a login or signup flow
    const mode = localStorage.getItem("auth_mode") || "login"
    setAuthMode(mode)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!phone.trim()) {
      setError("Please enter your phone number")
      return
    }

    if (!validatePhoneNumber(phone.replace(/\s/g, ""))) {
      setError("Please enter a valid 10-digit phone number")
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Store phone number for next steps
      localStorage.setItem("partner_phone", phone.replace(/\s/g, ""))
      localStorage.setItem("auth_mode", authMode)
      
      // Navigate to OTP verification
      router.push("/auth/verify-otp")
    } catch (err) {
      setError("Failed to send OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 10) {
      setPhone(formatPhoneNumber(value))
      setError("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 mb-8">
        <Link href="/" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <h1 className="text-lg font-semibold text-slate-800">Phone Verification</h1>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Phone className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            {authMode === "signup" 
              ? "Create Partner Account" 
              : authMode === "reset"
                ? "Reset Password"
                : "Partner Login"
            }
          </h2>
          <p className="text-slate-600 leading-relaxed">
            {authMode === "signup" 
              ? "Enter your mobile number to create your partner account"
              : authMode === "reset"
                ? "Enter your registered mobile number to reset password"
                : "Enter your registered mobile number to login"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-500 text-sm font-medium">+91</span>
              </div>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="partner-input pl-16 text-center text-lg font-semibold tracking-wider"
                placeholder="000 000 0000"
                maxLength="12"
                autoComplete="tel"
                autoFocus
              />
            </div>
            {error && (
              <div className="mt-2 flex items-center space-x-2 text-error-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || phone.replace(/\s/g, "").length !== 10}
            className="partner-button-primary w-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending OTP...</span>
              </div>
            ) : (
              authMode === "signup" 
                ? "Send OTP & Create Account" 
                : authMode === "reset"
                  ? "Send Reset Code"
                  : "Send Login OTP"
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          {authMode === "signup" ? (
            <p className="text-sm text-slate-600">
              By proceeding, you agree to receive SMS messages from us
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <Link href="/" className="text-brand-600 font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-8">
        <p className="text-xs text-slate-500">
          Need help? Contact{" "}
          <Link href="/support" className="text-brand-600 underline">
            Partner Support
          </Link>
        </p>
      </div>
    </div>
  )
}
