"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, User, Loader2, RefreshCw, ArrowLeft, Phone } from "lucide-react"

export default function PartnerSignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [captchaA, setCaptchaA] = useState(0)
  const [captchaB, setCaptchaB] = useState(0)
  const [captchaAnswer, setCaptchaAnswer] = useState("")
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

  useEffect(() => {
    regenCaptcha()
  }, [])

  const regenCaptcha = () => {
    setCaptchaA(Math.floor(1 + Math.random() * 9))
    setCaptchaB(Math.floor(1 + Math.random() * 9))
    setCaptchaAnswer("")
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    if (!name.trim()) {
      setError("Please enter your full name")
      setIsLoading(false)
      return
    }
    
    const digits = (phone || '').replace(/\D/g, '')
    if (!/^\d{10}$/.test(digits)) {
      setError("Please enter a valid 10-digit mobile number")
      setIsLoading(false)
      return
    }
    if (parseInt(captchaAnswer, 10) !== (captchaA + captchaB)) {
      setError("Captcha is incorrect")
      return
    }

    setIsLoading(true)
    try {
      // Prepare the signup data with all possible fields
      const signupData = {
        // Basic information
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: `+91${digits}`,
        password: password,
        
        // Authentication
        captcha: parseInt(captchaAnswer, 10),
        
        // User type and role
        role: 'driver',
        userType: 'driver',
        accountType: 'individual',
        
        // Device and source tracking
        deviceType: 'web',
        deviceName: 'web-browser',
        deviceId: 'web-' + Math.random().toString(36).substring(2, 15),
        
        // Additional metadata
        signupMethod: 'email',
        source: 'web',
        referrer: 'direct',
        
        // Timestamps
        createdAt: new Date().toISOString(),
        
        // Status flags
        isEmailVerified: false,
        isPhoneVerified: false,
        isActive: true,
        
        // Preferences (if any)
        preferences: {
          notifications: true,
          marketing: false
        }
      };
      
      console.log('Sending signup request with data:', JSON.stringify(signupData, null, 2));
      
      const response = await fetch(`/api/proxy/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(signupData),
      })
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('Invalid response from server');
      }
      
      console.log('Signup response:', { status: response.status, data });
      
      if (!response.ok) {
        // If there's an error message in the response, use it
        const errorMessage = data?.message || data?.error || "Signup failed";
        throw new Error(errorMessage);
      }
      
      // If we get here, the request was successful
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
        if (data.user) {
          localStorage.setItem("user_data", JSON.stringify(data.user));
        }
        setSuccess("Account created successfully!");
        // After partner signup, send to KYC
        router.replace("/auth/kyc");
      } else {
        throw new Error("No token received in response");
      }
    } catch (err) {
      setError(err.message || "Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex flex-col p-6">
      <div className="flex items-center justify-between pt-4 mb-8">
        <Link href="/" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <h1 className="text-lg font-semibold text-slate-800">Partner Sign Up</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="feature-card p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Partner Account</h2>
          <p className="text-sm text-slate-600 mb-6">Sign up with your email and password</p>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && <div className="text-error-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0,10))}
                  className="w-full pl-10 pr-3 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">India numbers only (auto +91)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Captcha</label>
              <div className="flex items-center gap-3">
                <div className="px-3 py-2 rounded-lg border-2 border-dashed border-brand-300 bg-brand-50 text-lg font-bold">
                  {captchaA} + {captchaB} = ?
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value.replace(/\D/g, ''))}
                  className="w-24 text-center py-2 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                  placeholder="Ans"
                  required
                />
                <button type="button" onClick={regenCaptcha} className="partner-button-secondary px-3 py-2">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="partner-button-primary w-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2"/> Creating account...</>
              ) : (
                'Sign Up'
              )}
            </button>

            <div className="text-center mt-4 text-sm text-slate-600">
              Already have an account? <Link href="/auth/login" className="text-brand-600 font-semibold hover:underline">Log in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
