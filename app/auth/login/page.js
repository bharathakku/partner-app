"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Phone, Lock, Eye, EyeOff, Loader2, AlertCircle, User, Mail } from "lucide-react"
import { validatePhoneNumber, formatPhoneNumber } from "../../../lib/utils"

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState("phone") // "phone" or "email"
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleInputChange = (field, value) => {
    if (field === "phone") {
      const cleanValue = value.replace(/\D/g, "")
      if (cleanValue.length <= 10) {
        setFormData(prev => ({ ...prev, [field]: formatPhoneNumber(cleanValue) }))
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    setError("")
  }

  const validateForm = () => {
    if (loginMethod === "phone") {
      if (!formData.phone.trim()) {
        setError("Please enter your phone number")
        return false
      }
      if (!validatePhoneNumber(formData.phone.replace(/\s/g, ""))) {
        setError("Please enter a valid 10-digit phone number")
        return false
      }
    } else {
      if (!formData.email.trim()) {
        setError("Please enter your email")
        return false
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError("Please enter a valid email address")
        return false
      }
    }
    
    if (!formData.password.trim()) {
      setError("Please enter your password")
      return false
    }
    
    return true
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo - simulate different scenarios
      const loginSuccess = Math.random() > 0.3 // 70% success rate
      
      if (loginSuccess) {
        // Store auth data
        localStorage.setItem("partner_authenticated", "true")
        localStorage.setItem("partner_phone", formData.phone.replace(/\s/g, "") || "9876543210")
        localStorage.setItem("partner_email", formData.email || "partner@example.com")
        
        // Check activation status
        const isActivated = Math.random() > 0.2 // 80% chance of being activated
        
        if (isActivated) {
          router.push("/dashboard")
        } else {
          router.push("/auth/activation-pending")
        }
      } else {
        setError("Invalid credentials. Please check your details and try again.")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    // For now, redirect to phone verification for password reset
    localStorage.setItem("auth_mode", "reset")
    router.push("/auth/phone")
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
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Login Method Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setLoginMethod("phone")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === "phone" 
                    ? "bg-white text-brand-600 shadow-sm" 
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Phone</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === "email" 
                    ? "bg-white text-brand-600 shadow-sm" 
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </div>
              </button>
            </div>

            {/* Phone/Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {loginMethod === "phone" ? "📱 Phone Number" : "📧 Email Address"}
              </label>
              {loginMethod === "phone" ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 text-sm font-medium">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full pl-16 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none text-center text-lg font-semibold tracking-wider transition-colors"
                    placeholder="000 000 0000"
                    maxLength="12"
                    autoComplete="tel"
                  />
                </div>
              ) : (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
                  placeholder="your.email@example.com"
                  autoComplete="email"
                />
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                🔒 Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-error-600 bg-error-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="partner-button-primary w-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium underline transition-colors"
              >
                Forgot Password?
              </button>
            </div>
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
          <p className="text-sm font-medium text-blue-800 mb-2">🧪 Demo Credentials:</p>
          <div className="space-y-1 text-xs text-blue-700">
            <p>Phone: <span className="font-mono">987 654 3210</span></p>
            <p>Email: <span className="font-mono">demo@deliverpro.com</span></p>
            <p>Password: <span className="font-mono">demo123</span></p>
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
