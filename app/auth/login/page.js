"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Phone, Loader2, AlertCircle, User } from "lucide-react"
import { validatePhoneNumber, formatPhoneNumber } from "../../../lib/utils"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handlePhoneChange = (value) => {
    const cleanValue = value.replace(/\D/g, "")
    if (cleanValue.length <= 10) {
      setPhone(formatPhoneNumber(cleanValue))
      setError("")
    }
  }

  const validateForm = () => {
    if (!phone.trim()) {
      setError("Please enter your phone number")
      return false
    }
    if (!validatePhoneNumber(phone.replace(/\s/g, ""))) {
      setError("Please enter a valid 10-digit phone number")
      return false
    }
    
    return true
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Store phone number and mark as login
      localStorage.setItem("partner_phone", phone.replace(/\s/g, ""))
      localStorage.setItem("auth_mode", "login")
      
      // Navigate to OTP verification
      router.push("/auth/verify-otp")
    } catch (err) {
      setError("Failed to send OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 mb-8">
        <Link href="/" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <h1 className="text-lg font-semibold text-slate-800">Partner Login</h1>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Welcome Back!
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Sign in to your partner account
          </p>
        </div>

        {/* Login Form */}
        <div className="feature-card p-6 mb-6">
          <form onSubmit={handleSendOTP} className="space-y-6">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                📱 Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-sm font-medium">+91</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full pl-16 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none text-center text-lg font-semibold tracking-wider transition-colors"
                  placeholder="000 000 0000"
                  maxLength="12"
                  autoComplete="tel"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                We'll send you a verification code
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-error-600 bg-error-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Send OTP Button */}
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
                <div className="flex items-center justify-center space-x-2">
                  <Phone className="w-5 h-5" />
                  <span>Send OTP</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{" "}
            <Link href="/" className="text-brand-600 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-800 mb-2">🧪 Demo Login:</p>
          <div className="space-y-1 text-xs text-blue-700">
            <p>Phone: <span className="font-mono">987 654 3210</span></p>
            <p>OTP: <span className="font-mono">Any 6-digit code works</span></p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-8">
        <p className="text-xs text-slate-500">
          Having trouble?{" "}
          <Link href="/support" className="text-brand-600 underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  )
}
