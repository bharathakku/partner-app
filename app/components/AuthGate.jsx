"use client"

import { useEffect } from "react"
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

  useEffect(() => {
    let cancelled = false
    const isPublic = PUBLIC_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"))
    const isProtected = PROTECTED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"))

    async function check() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        if (!isProtected) {
          // If on pending or kyc, still redirect forward if approved
          if (pathname?.startsWith('/auth/activation-pending') || pathname?.startsWith('/auth/kyc')) {
            if (!token) return
            const res = await fetch(`${API_BASE_URL}/drivers/me`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
            if (!res.ok) return
            const me = await res.json()
            const docs = Array.isArray(me?.documents) ? me.documents : []
            const hasDocs = docs.length > 0
            const isActive = !!me?.isActive
            if (isActive) { if (!cancelled) router.replace('/dashboard') }
            else if (hasDocs && pathname?.startsWith('/auth/kyc')) { if (!cancelled) router.replace('/auth/activation-pending') }
          }
          return
        }
        // Protected: require token
        if (!token) { if (!cancelled) router.replace('/auth/login'); return }
        const res = await fetch(`${API_BASE_URL}/drivers/me`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (!res.ok) { if (!cancelled) router.replace('/auth/activation-pending'); return }
        const me = await res.json()
        const docs = Array.isArray(me?.documents) ? me.documents : []
        const hasDocs = docs.length > 0
        const isActive = !!me?.isActive
        if (!hasDocs) { if (!cancelled) router.replace('/auth/kyc'); return }
        if (!isActive) { if (!cancelled) router.replace('/auth/activation-pending'); return }
      } catch {
        if (!cancelled) router.replace('/auth/activation-pending')
      }
    }

    check()
    return () => { cancelled = true }
  }, [pathname, router])

  return children
}
