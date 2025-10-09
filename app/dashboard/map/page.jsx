'use client'

import { useEffect, useRef, useState } from 'react'
import { apiClient, API_BASE_URL } from '../../../lib/api/apiClient'

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject('ssr')
    if (window.L) return resolve(window.L)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const s = document.createElement('script')
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    s.async = true
    s.onload = () => resolve(window.L)
    s.onerror = reject
    document.body.appendChild(s)
  })
}

export default function DriverLiveMapPage() {
  const mapRef = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)
  const zoneCircle = useRef(null)
  const [error, setError] = useState('')
  const [watchId, setWatchId] = useState(null)
  const [status, setStatus] = useState({ lat: null, lng: null, accuracy: null, ts: null })

  useEffect(() => {
    let mounted = true
    async function init() {
      try {
        const L = await loadLeaflet()
        if (!mounted) return
        map.current = L.map(mapRef.current, { center: [12.9716, 77.5946], zoom: 13 })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map.current)

        // Try to center on driver's last known location from backend
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
          const res = await fetch(`${API_BASE_URL}/drivers/me`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
          if (res.ok) {
            const me = await res.json()
            const coords = me?.location?.coordinates
            if (Array.isArray(coords) && coords.length === 2) {
              const [lng, lat] = coords
              const ll = [lat, lng]
              marker.current = L.marker(ll).addTo(map.current)
              map.current.setView(ll, 14)
              zoneCircle.current = L.circle(ll, { radius: 3000, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.12 }).addTo(map.current)
            }
          }
        } catch {}

        // Auto-start watch so the driver immediately sees their location
        if (navigator.geolocation && watchId === null) {
          const id = navigator.geolocation.watchPosition((pos) => {
            const lat = pos.coords.latitude
            const lng = pos.coords.longitude
            const acc = pos.coords.accuracy
            setStatus({ lat, lng, accuracy: acc, ts: Date.now() })
            const ll = [lat, lng]
            if (!marker.current) marker.current = L.marker(ll).addTo(map.current)
            marker.current.setLatLng(ll)
            map.current.setView(ll, 15)
            if (!zoneCircle.current) {
              zoneCircle.current = L.circle(ll, { radius: 3000, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.12 }).addTo(map.current)
            } else zoneCircle.current.setLatLng(ll)
          }, (err) => {
            setError(err?.message || 'Location permission denied')
          }, { enableHighAccuracy: true, maximumAge: 5000 })
          setWatchId(id)
        }
      } catch (e) {
        setError('Failed to load map')
      }
    }
    init()
    return () => { 
      mounted = false 
      if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  // No manual start button; permission prompt occurs on first visit

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100">
      <div className="px-4 py-4">
        <h1 className="text-xl font-semibold">Live Map</h1>
        <p className="text-sm text-slate-600">Your current location with zone radius</p>
      </div>
      <div className="px-4 pb-6">
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div ref={mapRef} style={{ width: '100%', height: 520 }} />
        </div>
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        {(status.lat != null) && (
          <div className="fixed bottom-6 right-6 z-10 text-xs bg-white/90 backdrop-blur border border-slate-200 rounded px-2 py-1 shadow">
            <div><b>Lat:</b> {status.lat.toFixed(5)} <b>Lng:</b> {status.lng.toFixed(5)}</div>
            {status.accuracy != null && <div><b>±</b> {Math.round(status.accuracy)} m</div>}
            {status.ts && <div>{new Date(status.ts).toLocaleTimeString()}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
