'use client'

import { useEffect, useState } from 'react'
import OrderReceiving from './OrderReceiving'
import { API_BASE_URL } from '../lib/api/apiClient'
import { useProfile } from '../app/contexts/ProfileContext'
import { useNotification } from '../app/services/notificationService'

export default function GlobalOrderListener() {
  const { profileData } = useProfile()
  const { resetAudioContext } = useNotification()
  const [isOnline, setIsOnline] = useState(false)

  // Hydrate from localStorage fast
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('driver_is_online') : null
      if (raw != null) setIsOnline(JSON.parse(raw))
    } catch {}
  }, [])

  // Poll backend for accurate online state
  useEffect(() => {
    let timer
    async function poll() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        const res = await fetch(`${API_BASE_URL}/drivers/me`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
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
  }, [])

  // Resume audio context on any click/tap globally
  useEffect(() => {
    const handler = () => resetAudioContext()
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [resetAudioContext])

  return (
    <OrderReceiving isOnline={isOnline} />
  )
}
