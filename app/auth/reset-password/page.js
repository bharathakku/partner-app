"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { API_BASE_URL } from "../../../lib/api/apiClient"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-600">Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  )
}

function ResetPasswordInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")

  useEffect(()=>{
    const t = params?.get('token') || ''
    setToken(t)
  },[params])

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg("")
    setErr("")
    if (!token) { setErr('Invalid or missing token'); return }
    if (password.length < 6) { setErr('Password must be at least 6 characters'); return }
    if (password !== confirm) { setErr('Passwords do not match'); return }
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      const data = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(data.error || 'Failed to reset password')
      setMsg('Password reset successful. You can now log in.')
      setTimeout(()=> router.replace('/auth/login'), 800)
    } catch (e) {
      setErr(e.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 flex flex-col justify-center p-6">
      <div className="feature-card max-w-md w-full mx-auto p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Reset password</h1>
        <p className="text-sm text-slate-600 mb-6">Enter your new password below.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none" placeholder="New password" />
          <input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none" placeholder="Confirm new password" />
          <button disabled={isLoading} className="partner-button-primary w-full py-3 font-semibold disabled:opacity-50">{isLoading? 'Resetting...' : 'Reset password'}</button>
          {msg && <div className="text-green-600 text-sm">{msg}</div>}
          {err && <div className="text-error-600 text-sm">{err}</div>}
        </form>
        <div className="text-sm text-slate-600 mt-4">
          <Link href="/auth/login" className="text-brand-600 font-semibold hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  )
}
