"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { API_BASE_URL } from "../../lib/api/apiClient"

const PUBLIC_PREFIXES = [
  "/", // marketing landing
  "/auth", // all auth pages
  "/help",
  "/support",
  "/privacy",
  "/terms"
]

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/orders",
  "/profile",
  "/settings",
]

export default function AuthGate({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    const isPublic = PUBLIC_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"))
    const isProtected = PROTECTED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"))

    async function check() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        if (!isProtected) {
          // Never redirect on public routes before the user logs in.
          // We only gate protected pages; auth pages should always render.
          if (!cancelled) setChecked(true)
          return
        }
        // Protected: require token
        if (!token) { if (!cancelled) { router.replace('/auth/login'); setChecked(true) } return }
        const res = await fetch(`${API_BASE_URL}/drivers/me`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (!res.ok) { if (!cancelled) { router.replace('/auth/activation-pending'); setChecked(true) } return }
        const me = await res.json()
        const docs = Array.isArray(me?.documents) ? me.documents : []
        const hasDocs = docs.length > 0
        const docsApproved = hasDocs && docs.every(d => (d?.status || '').toLowerCase() === 'approved')
        const isActive = !!me?.isActive
        if (!hasDocs) { if (!cancelled) { router.replace('/auth/kyc'); setChecked(true) } return }
        if (!isActive || !docsApproved) { if (!cancelled) { router.replace('/auth/activation-pending'); setChecked(true) } return }
        if (!cancelled) setChecked(true)
      } catch {
        if (!cancelled) { router.replace('/auth/activation-pending'); setChecked(true) }
      }
    }

    check()
    return () => { cancelled = true }
  }, [pathname, router])

  if (!checked) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading...</div>
  }
  return children
}
