"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, User, Mail, Phone, Loader2 } from "lucide-react"

function apiBase() {
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const base = (envBase && envBase.trim().length > 0)
    ? envBase.trim().replace(/\/$/, "")
    : (typeof window !== 'undefined' ? `${window.location.origin}` : "")
  if (!base) return "/api"
  return base.endsWith("/api") ? base : `${base}/api`
}

export default function ProfilePage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`${apiBase()}/users/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Failed to load (HTTP ${res.status})`)
      const data = await res.json()
      setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "" })
    } catch (e) {
      setError(e.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`${apiBase()}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`Failed to update (HTTP ${res.status})`)
      const data = await res.json()
      setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "" })
      setSuccess('Profile updated')
      try { localStorage.setItem('user_data', JSON.stringify(data)) } catch {}
    } catch (e) {
      setError(e.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/settings" className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5 text-slate-600"/></Link>
          <h1 className="text-xl font-bold text-slate-800">Profile</h1>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white"/>
            </div>
            <div>
              <div className="text-slate-800 font-semibold">Your Details</div>
              <div className="text-slate-600 text-sm">Update your information</div>
            </div>
          </div>

          {error && <div className="mb-3 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>}
          {success && <div className="mb-3 p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">{success}</div>}

          {loading ? (
            <div className="flex items-center gap-2 text-slate-600"><Loader2 className="w-4 h-4 animate-spin"/> Loading...</div>
          ) : (
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-500"/>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="flex-1 p-3 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-500"/>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="flex-1 p-3 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-500"/>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                    className="flex-1 p-3 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                    placeholder="+91..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={load} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">Reset</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
