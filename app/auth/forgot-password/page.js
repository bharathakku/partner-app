"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { API_BASE_URL } from "../../../lib/api/apiClient"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg("")
    setErr("")
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(data.error || 'Failed to request reset')
      setMsg('If the email exists, a reset link has been sent.')
    } catch (e) {
      setErr(e.message || 'Failed to request reset')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 flex flex-col justify-center p-6">
      <div className="feature-card max-w-md w-full mx-auto p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Forgot password</h1>
        <p className="text-sm text-slate-600 mb-6">Enter your email and we'll send a reset link.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none" placeholder="you@example.com" />
          <button disabled={isLoading} className="partner-button-primary w-full py-3 font-semibold disabled:opacity-50">{isLoading? 'Sending...' : 'Send reset link'}</button>
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
