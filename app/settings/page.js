"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { User, MapPin, Settings, FileText, Shield } from "lucide-react"

function apiBase() {
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const base = (envBase && envBase.trim().length > 0)
    ? envBase.trim().replace(/\/$/, "")
    : (typeof window !== 'undefined' ? `${window.location.origin}` : "")
  if (!base) return "/api"
  return base.endsWith("/api") ? base : `${base}/api`
}

export default function SettingsHome() {
  const [addressCount, setAddressCount] = useState(0)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) return
    const load = async () => {
      try {
        const res = await fetch(`${apiBase()}/addresses`, { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' })
        if (res.ok) {
          const list = await res.json()
          setAddressCount(Array.isArray(list) ? list.length : 0)
        }
      } catch {}
    }
    load()
  }, [])

  const Card = ({ href, title, desc, icon: Icon }) => (
    <Link href={href} className="block bg-white rounded-xl border border-slate-200 hover:border-brand-300 transition-colors">
      <div className="p-5 flex items-center">
        <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mr-4">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-800">{title}</div>
          <div className="text-sm text-slate-600">{desc}</div>
        </div>
        <span className="text-slate-400">›</span>
      </div>
    </Link>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card href="/profile" title="Personal Information" desc="Update your details" icon={User} />
          <Card href="/settings/addresses" title={`Saved Addresses${addressCount ? ` • ${addressCount}` : ''}`} desc="Manage delivery addresses" icon={MapPin} />
          <Card href="/settings/app" title="App Settings" desc="Notifications, privacy" icon={Settings} />
          <Card href="/terms" title="Terms and Conditions" desc="Read our terms" icon={FileText} />
          <Card href="/privacy" title="Privacy Policy" desc="How we protect your data" icon={Shield} />
        </div>
      </div>
    </div>
  )
}
