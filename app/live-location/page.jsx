'use client'

import { useEffect, useRef, useState } from 'react'
import { connectSocket } from '@/lib/socket'

export default function LiveLocationPage() {
  const [orderId, setOrderId] = useState('')
  const [lat, setLat] = useState('12.9716')
  const [lng, setLng] = useState('77.5946')
  const [isStreaming, setIsStreaming] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    connectSocket(token)
  }, [])

  const startStreaming = async () => {
    if (!orderId) {
      alert('Enter an Order ID to stream location for.')
      return
    }
    setIsStreaming(true)
    // Lazy import to avoid SSR issues
    const { emitDriverLocation } = await import('@/lib/socket')
    timerRef.current = setInterval(() => {
      const payload = {
        orderId,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        heading: 0,
        speed: 10,
      }
      emitDriverLocation(payload)
      // Simulate slight movement
      setLat((v) => (parseFloat(v) + (Math.random() - 0.5) * 0.001).toFixed(6))
      setLng((v) => (parseFloat(v) + (Math.random() - 0.5) * 0.001).toFixed(6))
    }, 2000)
  }

  const stopStreaming = () => {
    setIsStreaming(false)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }

  return (
    <div style={{ maxWidth: 560, margin: '24px auto', padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Share Live Location (Demo)</h1>
      <p style={{ color: '#555', marginBottom: 16 }}>
        This page emits your driver location for a specific Order ID via Socket.io every 2 seconds.
      </p>

      <label style={{ display: 'block', marginBottom: 8 }}>
        Order ID
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Paste Order ID here"
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </label>

      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ flex: 1 }}>
          Latitude
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>
        <label style={{ flex: 1 }}>
          Longitude
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        {!isStreaming ? (
          <button onClick={startStreaming} style={{ padding: '8px 12px', background: '#2563eb', color: 'white', borderRadius: 6 }}>
            Start Sharing
          </button>
        ) : (
          <button onClick={stopStreaming} style={{ padding: '8px 12px', background: '#ef4444', color: 'white', borderRadius: 6 }}>
            Stop Sharing
          </button>
        )}
      </div>

      <p style={{ color: '#666', marginTop: 16 }}>
        Tip: Open the user app tracking page for this Order ID to see live updates.
      </p>
    </div>
  )
}
