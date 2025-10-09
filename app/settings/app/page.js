"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, Bell, Shield, Moon, Globe2 } from "lucide-react"

export default function AppSettingsPage() {
  const [notifyOrders, setNotifyOrders] = useState(true)
  const [notifyPromotions, setNotifyPromotions] = useState(false)
  const [shareAnalytics, setShareAnalytics] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [locale, setLocale] = useState("en-IN")
  const [saved, setSaved] = useState("")

  useEffect(() => {
    try {
      const raw = localStorage.getItem('partner_app_settings')
      if (raw) {
        const s = JSON.parse(raw)
        setNotifyOrders(!!s.notifyOrders)
        setNotifyPromotions(!!s.notifyPromotions)
        setShareAnalytics(!!s.shareAnalytics)
        setDarkMode(!!s.darkMode)
        setLocale(s.locale || 'en-IN')
      }
    } catch {}
  }, [])

  const save = () => {
    const s = { notifyOrders, notifyPromotions, shareAnalytics, darkMode, locale }
    try { localStorage.setItem('partner_app_settings', JSON.stringify(s)) } catch {}
    setSaved("Saved!")
    setTimeout(() => setSaved(""), 1500)
  }

  const Row = ({ children }) => (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white">{children}</div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/settings" className="p-2 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-slate-600"/></Link>
          <h1 className="text-xl font-bold text-slate-800">App Settings</h1>
          {saved && <span className="ml-2 text-emerald-700 text-sm">{saved}</span>}
        </div>

        <div className="space-y-3">
          <Row>
            <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-brand-600"/><div>
              <div className="font-semibold">Order Notifications</div>
              <div className="text-sm text-slate-600">Get alerts for new and assigned orders</div>
            </div></div>
            <input type="checkbox" checked={notifyOrders} onChange={e => setNotifyOrders(e.target.checked)} />
          </Row>

          <Row>
            <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-brand-600"/><div>
              <div className="font-semibold">Promotional Updates</div>
              <div className="text-sm text-slate-600">Offers, bonuses and announcements</div>
            </div></div>
            <input type="checkbox" checked={notifyPromotions} onChange={e => setNotifyPromotions(e.target.checked)} />
          </Row>

          <Row>
            <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-brand-600"/><div>
              <div className="font-semibold">Share Analytics</div>
              <div className="text-sm text-slate-600">Help improve the app by sharing usage stats</div>
            </div></div>
            <input type="checkbox" checked={shareAnalytics} onChange={e => setShareAnalytics(e.target.checked)} />
          </Row>

          <Row>
            <div className="flex items-center gap-3"><Moon className="w-5 h-5 text-brand-600"/><div>
              <div className="font-semibold">Dark Mode</div>
              <div className="text-sm text-slate-600">Use a dark color theme</div>
            </div></div>
            <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
          </Row>

          <Row>
            <div className="flex items-center gap-3"><Globe2 className="w-5 h-5 text-brand-600"/><div>
              <div className="font-semibold">Language & Region</div>
              <div className="text-sm text-slate-600">Affects dates and formats</div>
            </div></div>
            <select value={locale} onChange={e => setLocale(e.target.value)} className="border border-slate-200 rounded-lg p-2">
              <option value="en-IN">English (India)</option>
              <option value="en-US">English (US)</option>
            </select>
          </Row>
        </div>

        <div className="flex justify-end">
          <button onClick={save} className="partner-button-primary px-4 py-2">Save Settings</button>
        </div>
      </div>
    </div>
  )
}
