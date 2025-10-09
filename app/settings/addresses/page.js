"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { MapPin, Plus, Pencil, Trash2, ArrowLeft, Loader2 } from "lucide-react"
import AddressForm from "../../../components/AddressForm"

function apiBase() {
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const base = (envBase && envBase.trim().length > 0)
    ? envBase.trim().replace(/\/$/, "")
    : (typeof window !== 'undefined' ? `${window.location.origin}` : "")
  if (!base) return "/api"
  return base.endsWith("/api") ? base : `${base}/api`
}

export default function AddressesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [mode, setMode] = useState("list") // list | add | edit
  const [current, setCurrent] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${apiBase()}/addresses`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: 'include' })
      if (!res.ok) throw new Error(`Failed to load (HTTP ${res.status})`)
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  const onAdd = async (payload) => {
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch(`${apiBase()}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Failed to add (HTTP ${res.status})`)
      await load()
      setMode('list')
    } catch (e) {
      setError(e.message || 'Failed to add address')
    } finally {
      setSubmitting(false)
    }
  }

  const onEdit = async (payload) => {
    if (!current?._id) return
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch(`${apiBase()}/addresses/${current._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Failed to update (HTTP ${res.status})`)
      await load()
      setMode('list')
      setCurrent(null)
    } catch (e) {
      setError(e.message || 'Failed to update address')
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this address?')) return
    try {
      const res = await fetch(`${apiBase()}/addresses/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Failed to delete (HTTP ${res.status})`)
      setItems(prev => prev.filter(i => i._id !== id))
    } catch (e) {
      alert(e.message || 'Failed to delete address')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link href="/settings" className="p-2 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-slate-600"/></Link>
            <h1 className="text-xl font-bold text-slate-800">Saved Addresses</h1>
          </div>
          {mode === 'list' && (
            <button onClick={() => { setMode('add'); setCurrent(null) }} className="partner-button-primary px-4 py-2 flex items-center gap-2">
              <Plus className="w-4 h-4"/> Add Address
            </button>
          )}
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>}

        {mode === 'list' && (
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-600"><Loader2 className="w-4 h-4 animate-spin"/> Loading...</div>
            ) : items.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-600">
                No addresses yet. Add your first one.
              </div>
            ) : (
              items.map(item => (
                <div key={item._id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><MapPin className="w-4 h-4"/></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-slate-800 capitalize">{item.type}</div>
                      {item.isDefault && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Default</span>}
                    </div>
                    <div className="text-slate-700 mt-1 whitespace-pre-wrap">{item.address}</div>
                    {item.landmark && <div className="text-sm text-slate-500 mt-0.5">Landmark: {item.landmark}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setCurrent(item); setMode('edit') }} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1"><Pencil className="w-4 h-4"/> Edit</button>
                    <button onClick={() => onDelete(item._id)} className="px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 flex items-center gap-1"><Trash2 className="w-4 h-4"/> Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {mode === 'add' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <AddressForm onSubmit={onAdd} onCancel={() => setMode('list')} submitting={submitting} />
          </div>
        )}

        {mode === 'edit' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <AddressForm initial={current} onSubmit={onEdit} onCancel={() => setMode('list')} submitting={submitting} />
          </div>
        )}
      </div>
    </div>
  )
}
