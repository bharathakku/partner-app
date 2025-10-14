"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Mail, Lock, ArrowLeft, RefreshCw } from "lucide-react"
import { clearStoredSubscription, clearStoredSubscriptionForUser } from "../../../lib/subscription"

// Wrap useSearchParams usage in a Suspense boundary to satisfy Next.js prerendering
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-600">Loading...</div>}>
      <LoginInner />
    </Suspense>
  )
}

function LoginInner() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [captchaA, setCaptchaA] = useState(0)
  const [captchaB, setCaptchaB] = useState(0)
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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

  const routeAfterAuth = async (jwt) => {
    try {
      const res = await fetch(`${API_BASE}/drivers/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
        credentials: 'include'
      })
      if (!res.ok) {
        // If profile fetch fails, send to activation pending (wait for admin)
        router.replace("/auth/activation-pending")
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
    } catch (e) {
      // On any error, do NOT send to dashboard. Stay pending and show error.
      console.error('routeAfterAuth failed:', e)
      router.replace("/auth/activation-pending")
    }
  }
  const regenCaptcha = () => {
    setCaptchaA(Math.floor(1 + Math.random() * 9))
    setCaptchaB(Math.floor(1 + Math.random() * 9))
    setCaptchaAnswer("")
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (parseInt(captchaAnswer, 10) !== (captchaA + captchaB)) {
      setError("Captcha is incorrect")
      return
    }
    setIsLoading(true)
    try {
      const digits = (email || '').replace(/\D/g, '')
      const isPhone = /^\d{10}$/.test(digits)
      const payload = isPhone ? { phone: `+91${digits}`, password } : { email, password }
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok || !data.token) {
        const msg = data?.error || (res.status === 401 ? 'Invalid email/phone or password' : 'Login failed')
        throw new Error(msg)
      }
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("user_data", JSON.stringify(data.user))
      // Clear any legacy/global subscription cache and user-scoped cache to avoid cross-user leakage
      try {
        clearStoredSubscription()
      } catch {}
      try {
        const uid = data?.user?._id || data?.user?.id
        if (uid) clearStoredSubscriptionForUser(uid)
      } catch {}
      setSuccess("Login successful!")
      await routeAfterAuth(data.token)
    } catch (err) {
      setError(err.message || "An error occurred while logging in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 flex flex-col justify-center p-6">
      <div className="feature-card max-w-md w-full mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Partner Login</h2>
          <p className="text-sm text-slate-600">
            Sign in with your email and password
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email or Phone</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                placeholder="you@example.com or 10-digit phone"
                required
              />
            </div>
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
                placeholder="Your password"
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
              <><Loader2 className="w-5 h-5 animate-spin mr-2"/> Signing in...</>
            ) : (
              'Sign In'
            )}
          </button>

          {error && <div className="mt-2 text-error-600 text-sm">{error}</div>}
          {success && <div className="mt-2 text-green-600 text-sm">{success}</div>}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-sm text-slate-600">
            <Link href="/auth/forgot-password" className="text-brand-600 font-semibold hover:underline">Forgot password?</Link>
            <span>
              New to our platform? <Link href="/auth/signup" className="text-brand-600 font-semibold hover:underline">Sign up as Partner</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}