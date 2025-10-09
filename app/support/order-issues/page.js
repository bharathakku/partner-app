"use client"

import Link from "next/link"
import { ArrowLeft, AlertTriangle, MapPin, Clock, Phone, RefreshCw, ChevronRight, Truck, PackageCheck } from "lucide-react"
import BottomNav from "../../../components/BottomNav"

export default function OrderIssuesPage() {
  const quickIssues = [
    {
      title: "Restaurant delay",
      desc: "Order not ready at pickup location",
      icon: Clock,
      color: "warning",
      steps: [
        "Politely ask the restaurant for updated prep time",
        "Wait up to 15 mins, then contact support via chat",
        "If delay exceeds 20 mins, you may cancel with reason"
      ]
    },
    {
      title: "Customer unreachable",
      desc: "Calls not answered / wrong number",
      icon: Phone,
      color: "brand",
      steps: [
        "Call from in-app dialer (2 attempts)",
        "Wait at location for 5 mins",
        "Contact support for further instruction"
      ]
    },
    {
      title: "Location issue",
      desc: "Pin/address mismatch",
      icon: MapPin,
      color: "purple",
      steps: [
        "Request a live location from customer",
        "Use alternate routes if roads are blocked",
        "Escalate to support if not resolvable"
      ]
    },
    {
      title: "App not updating",
      desc: "Status can't be changed / frozen screen",
      icon: RefreshCw,
      color: "slate",
      steps: [
        "Pull to refresh or restart the app",
        "Ensure stable internet and location services",
        "If persistent, raise a technical complaint"
      ]
    }
  ]

  const safetyTips = [
    "Always follow traffic rules and wear helmet",
    "Do not confront customers; escalate via support",
    "Avoid unsafe areas during extreme weather",
    "Keep emergency contact handy"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link href="/support" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Order Issues</h1>
            <p className="text-sm text-slate-600">Troubleshoot common problems during delivery</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickIssues.map((q, i) => {
            const Icon = q.icon
            const tint = q.color === 'warning' ? 'warning' : q.color === 'brand' ? 'brand' : q.color === 'purple' ? 'purple' : 'slate'
            return (
              <div key={i} className="partner-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${tint}-100`}>
                      <Icon className={`w-5 h-5 text-${tint}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{q.title}</h3>
                      <p className="text-sm text-slate-600">{q.desc}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {q.steps.map((s, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 text-slate-400 mt-1" />
                      <p className="text-sm text-slate-700">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Delivery checklist */}
        <div className="partner-card p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Truck className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-bold text-slate-800">Delivery Checklist</h3>
          </div>
          <ul className="list-disc pl-6 space-y-2 text-sm text-slate-700">
            <li>Verify order items at pickup</li>
            <li>Use insulated bag for hot/cold items</li>
            <li>Confirm customer name at delivery</li>
            <li>Take proof of delivery if requested</li>
          </ul>
        </div>

        {/* Next steps */}
        <div className="partner-card p-6">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-error-600" />
            <h3 className="text-lg font-bold text-slate-800">Need further help?</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link href="/support/chat" className="p-4 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                  <PackageCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-brand-800">Chat with Support</h4>
                  <p className="text-xs text-brand-700">Average response &lt; 2 mins</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-brand-400" />
            </Link>

            <Link href="/support/complaint" className="p-4 rounded-xl border border-error-200 bg-error-50 hover:bg-error-100 transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-error-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-error-800">Raise a Complaint</h4>
                  <p className="text-xs text-error-700">Track resolution within 24 hrs</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-error-400" />
            </Link>
          </div>
        </div>

        {/* Safety tips */}
        <div className="bg-warning-50 border border-warning-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-warning-700" />
            <h3 className="font-semibold text-warning-800">Safety Tips</h3>
          </div>
          <ul className="list-disc pl-6 text-sm text-warning-800 space-y-1">
            {safetyTips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
