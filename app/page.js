"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Truck, Zap, ShieldCheck, IndianRupee, Package, Star, Phone, ArrowRight, Loader2, AlertCircle, TrendingUp, Users } from "lucide-react"
import { validatePhoneNumber, formatPhoneNumber } from "../lib/utils"

export default function Welcome() {
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [authMode, setAuthMode] = useState("signup") // "login" or "signup"
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [liveStats, setLiveStats] = useState({
    activePartners: 8247,
    todayEarnings: 342150,
    newJoins: 127
  })
  const router = useRouter()
  
  // Simulate live stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        activePartners: prev.activePartners + Math.floor(Math.random() * 3),
        todayEarnings: prev.todayEarnings + Math.floor(Math.random() * 500),
        newJoins: prev.newJoins + (Math.random() > 0.7 ? 1 : 0)
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])
  
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 10) {
      setPhone(formatPhoneNumber(value))
      setError("")
    }
  }
  
  const handleAuth = async (e) => {
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
      // Store phone number and auth mode
      localStorage.setItem("partner_phone", phone.replace(/\s/g, ""))
      localStorage.setItem("auth_mode", authMode)
      
      // Redirect to external auth host to avoid internal route/middleware loops
      if (typeof window !== 'undefined') {
        window.location.href = `http://localhost:3002?mode=${authMode}`
      }
    } catch (err) {
      setError("Failed to proceed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleShowLogin = () => {
    // Navigate to dedicated auth route with login mode
    router.push("/auth/login?mode=login")
  }
  
  const handleShowSignup = () => {
    // Navigate to dedicated auth route with signup mode
    router.push("/auth/login?mode=signup") 
  }
  
  const toggleAuthMode = () => {
    setAuthMode(authMode === "login" ? "signup" : "login")
    setError("")
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-100/20 to-success-100/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-success-100/20 to-brand-100/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      
      {/* Header */}
      <div className="flex justify-center pt-12 relative z-10">
        <div className="feature-card p-6 flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">DeliveryPro</h1>
            <p className="text-slate-500 font-medium">Smart Delivery Platform</p>
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-slate-600 font-medium">4.9 Rating</span>
              </div>
              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              <span className="text-xs text-green-600 font-semibold">🟢 Live Orders Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent mb-6">Start Your Delivery Journey</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Join thousands of partners earning daily
          </p>
        </div>

        {/* Auth Section */}
        {showAuthForm ? (
          <div className="space-y-6">
            {/* Auth Form */}
            <div className="feature-card p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {authMode === "signup" ? "Join Our Platform" : "Welcome Back"}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {authMode === "signup" ? "Start earning as a delivery partner today" : "Sign in to your partner account"}
                </p>
              </div>
              
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label htmlFor="auth-phone" className="block text-sm font-medium text-slate-700 mb-2">
                    📱 Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-sm font-medium">+91</span>
                    </div>
                    <input
                      id="auth-phone"
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full pl-16 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none text-center text-lg font-semibold tracking-wider transition-colors"
                      placeholder="000 000 0000"
                      maxLength="12"
                      autoComplete="tel"
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
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Phone className="w-5 h-5" />
                      <span>{authMode === "signup" ? "Send OTP & Join Revolution" : "Send OTP & Login"}</span>
                    </div>
                  )}
                </button>
              </form>
              
              {/* Mode Toggle */}
              <div className="text-center pt-4 border-t border-slate-200 mt-4">
                <p className="text-sm text-slate-600 mb-2">
                  {authMode === "signup" ? "Already have an account?" : "New to our platform?"}
                </p>
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-brand-600 hover:text-brand-700 font-medium text-sm underline"
                  disabled={isLoading}
                >
                  {authMode === "signup" ? "Login instead" : "Sign up as Partner"}
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAuthForm(false)}
                  className="text-sm text-slate-600 hover:text-slate-800 underline"
                >
                  Back to main page
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sign Up Button */}
            <button
              onClick={handleShowSignup}
              className="partner-button-primary w-full py-5 text-lg font-bold shadow-xl hover:shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-full group-hover:animate-pulse"></div>
              <div className="relative flex flex-col items-center justify-center space-y-1">
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5" />
                  <span>Sign Up New User</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
                <span className="text-sm opacity-90">Start earning today</span>
              </div>
            </button>
            
            {/* Login Button */}
            <button
              onClick={handleShowLogin}
              className="w-full py-4 px-6 border-2 border-brand-200 bg-white/80 backdrop-blur-sm text-brand-700 font-semibold rounded-xl hover:bg-brand-50 hover:border-brand-300 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Login Existing Users</span>
                </div>
                <span className="text-sm opacity-75">🔐 Partner Login</span>
              </div>
            </button>
          </div>
        )}
      </div>

        {/* Footer */}
      <div className="text-center pt-8">
        <p className="text-xs text-slate-500">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-brand-600">Terms</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
