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
  const zonesLayersRef = useRef([])
  const [error, setError] = useState('')
  const [watchId, setWatchId] = useState(null)
  const [status, setStatus] = useState({ lat: null, lng: null, accuracy: null, ts: null })
  const [zones, setZones] = useState([])

  useEffect(() => {
    let mounted = true
    async function init() {
      try {
        const L = await loadLeaflet()
        if (!mounted) return
        map.current = L.map(mapRef.current, { center: [12.9716, 77.5946], zoom: 13 })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map.current)

        // Load and draw zones overlay
        try {
          const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/zones`)
          const arr = await res.json()
          const list = Array.isArray(arr) ? arr : (Array.isArray(arr?.data) ? arr.data : [])
          setZones(list)
          // draw
          zonesLayersRef.current = []
          list.forEach(z => {
            const latlngs = Array.isArray(z.coordinates) ? z.coordinates.map(c => [c.lat, c.lng]) : []
            if (latlngs.length >= 3) {
              const poly = L.polygon(latlngs, { color: z.color || '#3b82f6', weight: 2, fillColor: z.color || '#3b82f6', fillOpacity: 0.15 })
              poly.addTo(map.current)
              zonesLayersRef.current.push(poly)
            }
          })
        } catch {}

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
      // cleanup zone layers
      try {
        if (map.current && zonesLayersRef.current.length) {
          zonesLayersRef.current.forEach(l => { try { map.current.removeLayer(l) } catch {} })
          zonesLayersRef.current = []
        }
      } catch {}
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
