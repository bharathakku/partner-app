
'use client'

import { useEffect, useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import OrderReceiving from './OrderReceiving'
import { API_BASE_URL } from '../lib/api/apiClient'
import { useProfile } from '../app/contexts/ProfileContext'
import { useNotification } from '../app/services/notificationService'

export default function GlobalOrderListener() {
  const { profileData } = useProfile()
  const { resetAudioContext } = useNotification()
  const [isOnline, setIsOnline] = useState(false)
  const pathname = usePathname()

  // Require auth and restrict to operational pages only
  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null), [])
  const shouldAttach = !!token && (pathname?.startsWith('/dashboard') || pathname?.startsWith('/orders'))

  // Hydrate from localStorage fast
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('driver_is_online') : null
      if (raw != null) setIsOnline(JSON.parse(raw))
    } catch {}
  }, [])

  // Poll backend for accurate online state (only when attached)
  useEffect(() => {
    let timer
    async function poll() {
      try {
        const t = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        if (!shouldAttach || !t) { return }
        const res = await fetch(`${API_BASE_URL}/drivers/me`, { headers: { Authorization: `Bearer ${t}` } })
        if (res.ok) {
          const me = await res.json()
          const online = !!me?.isOnline
          setIsOnline(online)
          try { localStorage.setItem('driver_is_online', JSON.stringify(online)) } catch {}
        }
      } catch {}
      timer = setTimeout(poll, 30000)
    }
    poll()
    return () => { try { clearTimeout(timer) } catch {} }
  }, [shouldAttach])

  // Resume audio context on any click/tap globally
  useEffect(() => {
    const handler = () => resetAudioContext()
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [resetAudioContext])

  if (!shouldAttach) return null
  try { console.log('[listener] attach:', { isOnline }) } catch {}
  return (<OrderReceiving isOnline={isOnline} />)
}
