"use client"

import { useState, useEffect } from "react"

export default function AddressForm({ initial, onSubmit, onCancel, submitting }) {
  const [type, setType] = useState(initial?.type || "home")
  const [address, setAddress] = useState(initial?.address || "")
  const [landmark, setLandmark] = useState(initial?.landmark || "")
  const [isDefault, setIsDefault] = useState(!!initial?.isDefault)

  useEffect(() => {
    setType(initial?.type || "home")
    setAddress(initial?.address || "")
    setLandmark(initial?.landmark || "")
    setIsDefault(!!initial?.isDefault)
  }, [initial])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!address.trim()) return
    onSubmit({ type, address: address.trim(), landmark: landmark.trim(), isDefault })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Address Label</label>
        <div className="flex gap-2">
          {[
            { key: "home", label: "Home" },
            { key: "work", label: "Office" },
            { key: "other", label: "Other" },
          ].map(opt => (
            <button
              type="button"
              key={opt.key}
              onClick={() => setType(opt.key)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium ${type === opt.key ? "bg-brand-500 text-white border-brand-500" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Full Address</label>
        <textarea
          rows={3}
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="House/Flat, Street, Area, City - Pincode"
          className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Landmark (optional)</label>
        <input
          type="text"
          value={landmark}
          onChange={e => setLandmark(e.target.value)}
          placeholder="Near ..."
          className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input id="isDefault" type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
        <label htmlFor="isDefault" className="text-sm text-slate-700">Make this my default address</label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={submitting || !address.trim()} className="px-4 py-2 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 disabled:opacity-60">
          {submitting ? "Saving..." : (initial?._id ? "Save Changes" : "Add Address")}
        </button>
      </div>
    </form>
  )
}
