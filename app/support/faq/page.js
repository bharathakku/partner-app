"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, Search, ChevronDown, ChevronUp, ChevronRight,
  IndianRupee, Package, Smartphone, Shield, Clock,
  HelpCircle, MessageCircle
} from "lucide-react"
import BottomNav from "../../../components/BottomNav"

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedItems, setExpandedItems] = useState({})

  const categories = [
    { key: "all", label: "All", icon: HelpCircle, color: "slate" },
    { key: "earnings", label: "Earnings & Payments", icon: IndianRupee, color: "success" },
    { key: "orders", label: "Orders & Delivery", icon: Package, color: "brand" },
    { key: "app", label: "App & Technical", icon: Smartphone, color: "purple" },
    { key: "account", label: "Account & Profile", icon: Shield, color: "warning" }
  ]

  const faqs = [
    {
      id: 1,
      category: "earnings",
      question: "How much do I earn per delivery?",
      answer: "Your earnings depend on factors like distance, time, peak hours, and tips. Base fare starts from ₹25 per delivery, plus distance charges of ₹8-12 per km. During peak hours (6-9 PM), you can earn 1.5x surge pricing. Weekend bonuses and incentives can add ₹200-500 extra per week."
    },
    {
      id: 2,
      category: "earnings",
      question: "What are the daily platform charges?",
      answer: "We charge ₹30 per active day to cover technology costs, customer support, and platform services. This is only charged on days you go online and accept orders. You can pay weekly or settle dues within 30 days. No charges apply on days you're offline."
    },
    {
      id: 3,
      category: "earnings",
      question: "When do I receive my payments?",
      answer: "Earnings are credited to your account within 24-48 hours of delivery completion. For cash orders, you keep the cash immediately. Digital payments are processed through our secure system. You can track all earnings in real-time through the app."
    },
    {
      id: 4,
      category: "earnings",
      question: "How do incentives and bonuses work?",
      answer: "We offer various incentives: Weekend bonuses (₹500 for 15 deliveries), Peak hour bonuses (₹300 for 4 hours), Rating bonuses (₹200 for maintaining 4.8+ rating), and Referral bonuses (₹100 per successful referral). Check the Incentives section for active offers."
    },
    {
      id: 5,
      category: "orders",
      question: "How do I accept and manage orders?",
      answer: "When online, you'll receive order notifications with pickup and delivery details. Tap 'Accept' within 30 seconds to confirm. You can see restaurant location, customer address, estimated earnings, and delivery distance before accepting. Use GPS navigation for optimal routes."
    },
    {
      id: 6,
      category: "orders",
      question: "What if a customer is not available?",
      answer: "Call the customer first using the in-app dialer. Wait for 5 minutes at the delivery location. If still unavailable, contact support through the app for guidance. You may need to return the order to the restaurant or leave it in a safe location as per support instructions."
    },
    {
      id: 7,
      category: "orders",
      question: "Can I cancel an accepted order?",
      answer: "Yes, but frequent cancellations may affect your account status. Valid reasons include: restaurant delay beyond 20 minutes, safety concerns, vehicle breakdown, or emergency situations. Use the 'Cancel Order' button and select appropriate reason. Excessive cancellations may lead to account review."
    },
    {
      id: 8,
      category: "app",
      question: "Why is the app not working properly?",
      answer: "Common fixes: Restart the app, check internet connection, update to latest version, clear app cache, restart your phone. Ensure GPS and location services are enabled. If problems persist, report through the complaint section with screenshots for faster resolution."
    },
    {
      id: 9,
      category: "app",
      question: "How do I update my location and availability?",
      answer: "Your location updates automatically when online. To change availability, use the Online/Offline toggle on the home screen. The app works best with GPS enabled and good internet connection. You can pause orders temporarily without going completely offline."
    },
    {
      id: 10,
      category: "account",
      question: "How do I update my profile information?",
      answer: "Go to Settings > Profile to update personal details, phone number, vehicle information, and bank details. Some changes like phone number may require verification. Keep your profile updated to ensure smooth operations and payment processing."
    },
    {
      id: 11,
      category: "account",
      question: "What documents do I need for KYC?",
      answer: "Required documents: Aadhar Card, PAN Card, Driving License, Vehicle RC (Registration Certificate), and bank account details. All documents should be clear, valid, and matching your profile information. KYC verification typically takes 24-48 hours."
    },
    {
      id: 12,
      category: "account",
      question: "How do I improve my partner rating?",
      answer: "Maintain high ratings by: arriving on time, being polite with customers, handling food safely, following delivery instructions, dressing appropriately, and maintaining vehicle cleanliness. Ratings above 4.5 unlock premium incentives and priority order access."
    },
    {
      id: 13,
      category: "orders",
      question: "What safety measures should I follow?",
      answer: "Always wear a helmet, follow traffic rules, carry the thermal bag, verify customer identity before handover, avoid riding during heavy rain/storms, keep emergency contacts handy, and report any safety concerns immediately. Your safety is our priority."
    },
    {
      id: 14,
      category: "app",
      question: "How do I contact customer support?",
      answer: "Multiple ways to reach us: Live Chat (24/7 available), Call +91 98765 43210 (6 AM - 12 AM), Email support@partnerapp.com, or raise a complaint through the app. For emergencies during delivery, call our hotline immediately."
    },
    {
      id: 15,
      category: "earnings",
      question: "How does the referral program work?",
      answer: "Refer friends using your unique code. You earn ₹100 when they complete their first 5 deliveries. Share your code through the app's referral section. Track your referrals and earnings in the Settings. No limit on referrals - earn more by inviting more partners!"
    }
  ]

  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getCategoryColor = (color) => {
    const colors = {
      slate: "bg-slate-100 text-slate-600",
      success: "bg-success-100 text-success-600",
      brand: "bg-brand-100 text-brand-600", 
      purple: "bg-purple-100 text-purple-600",
      warning: "bg-warning-100 text-warning-600"
    }
    return colors[color] || colors.slate
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link href="/support" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">FAQ & Help</h1>
            <p className="text-sm text-slate-600">Find answers to common questions</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="partner-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="partner-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Browse by Category</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              const isSelected = selectedCategory === category.key
              
              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? `bg-${category.color}-50 border-${category.color}-300 text-${category.color}-700`
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? getCategoryColor(category.color) : "bg-slate-100 text-slate-500"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-left">{category.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* FAQ Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">
              {selectedCategory === "all" ? "All Questions" : categories.find(c => c.key === selectedCategory)?.label}
            </h3>
            <span className="text-sm text-slate-600">{filteredFaqs.length} questions</span>
          </div>
          
          {filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="partner-card overflow-hidden">
                  <button
                    onClick={() => toggleExpanded(faq.id)}
                    className="w-full p-6 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800 pr-4">{faq.question}</h4>
                      {expandedItems[faq.id] ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                  
                  {expandedItems[faq.id] && (
                    <div className="px-6 pb-6">
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No Questions Found</h3>
              <p className="text-slate-500 mb-4">Try adjusting your search or category filter.</p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                }}
                className="partner-button-secondary px-6 py-2"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="partner-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Still need help?</h3>
          
          <div className="space-y-3">
            <Link 
              href="/support/chat"
              className="flex items-center space-x-4 p-4 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 transition-colors"
            >
              <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-brand-800">Chat with Support</h4>
                <p className="text-sm text-brand-600">Get instant help from our team</p>
              </div>
              <div className="text-brand-400">
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
            
            <Link 
              href="/support/complaint"
              className="flex items-center space-x-4 p-4 bg-error-50 hover:bg-error-100 rounded-xl border border-error-200 transition-colors"
            >
              <div className="w-10 h-10 bg-error-500 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-error-800">Report an Issue</h4>
                <p className="text-sm text-error-600">Submit a detailed complaint</p>
              </div>
              <div className="text-error-400">
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
        </div>

        {/* Popular Articles */}
        <div className="partner-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Popular Articles</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setSelectedCategory("earnings")
                setSearchTerm("")
                toggleExpanded(2)
              }}
              className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <h4 className="font-semibold text-slate-800 text-sm">Understanding Daily Platform Charges</h4>
              <p className="text-xs text-slate-600 mt-1">Learn about our ₹30/day platform fee structure</p>
            </button>
            
            <button
              onClick={() => {
                setSelectedCategory("orders")
                setSearchTerm("")
                toggleExpanded(5)
              }}
              className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <h4 className="font-semibold text-slate-800 text-sm">How to Accept and Manage Orders</h4>
              <p className="text-xs text-slate-600 mt-1">Step-by-step guide for order management</p>
            </button>
            
            <button
              onClick={() => {
                setSelectedCategory("earnings")
                setSearchTerm("")
                toggleExpanded(4)
              }}
              className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <h4 className="font-semibold text-slate-800 text-sm">Maximizing Your Earnings with Incentives</h4>
              <p className="text-xs text-slate-600 mt-1">Tips to earn more through bonuses and incentives</p>
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
