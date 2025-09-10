"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CreditCard, Calendar, TrendingUp, Clock, IndianRupee, Download, AlertCircle, Edit3, CheckCircle, Wallet, Minus, Plus, Shield } from "lucide-react"
import Link from "next/link"
import BottomNav from "../../../components/BottomNav"
import { formatCurrency, formatDate, calculateDaysPending } from "../../../lib/utils"
import { useOrder } from "../../contexts/OrderContext"

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("due")
  
  const [walletData, setWalletData] = useState({
    dailyDue: 30, // Daily amount charged
    pendingDues: 250,
    lastPaymentDate: "2024-01-05",
    weeklyEarnings: 4200,
    totalEarnings: 18500,
    accountBalance: -350, // Negative balance example
    weeklyPaymentEnabled: true,
    customWeeklyAmount: 210,
    nextWeeklyPaymentDate: "2024-01-12"
  })

  const [paymentHistory, setPaymentHistory] = useState([
    {
      id: 1,
      date: "2024-01-05",
      type: "payment",
      description: "Platform Charges Payment",
      amount: -210,
      status: "completed"
    },
    {
      id: 2,
      date: "2024-01-04",
      type: "earning",
      description: "Delivery Earnings (Paid to Bank)",
      amount: 850,
      status: "paid_directly"
    },
    {
      id: 3,
      date: "2024-01-03",
      type: "earning",
      description: "Delivery Earnings (Paid to UPI)",
      amount: 720,
      status: "paid_directly"
    },
    {
      id: 4,
      date: "2024-01-02",
      type: "earning",
      description: "Delivery Earnings (Paid to Bank)",
      amount: 650,
      status: "paid_directly"
    },
    {
      id: 5,
      date: "2024-01-01",
      type: "earning",
      description: "COD Collection (Paid to UPI)",
      amount: 320,
      status: "paid_directly"
    }
  ])

  const { orderHistory } = useOrder()

  // Helpers to compute chargeable days (only days with >=1 completed order) since last settlement
  const getDateKey = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10)

  const [settledUntil, setSettledUntil] = useState(() => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem('weekly_settled_until') || null
  })

  const chargeableDaysSinceSettlement = (() => {
    const since = settledUntil ? new Date(settledUntil) : new Date(0)
    const daysSet = new Set()
    orderHistory.forEach(o => {
      const completedAt = o.completedAt ? new Date(o.completedAt) : null
      if (completedAt && completedAt > since) {
        daysSet.add(getDateKey(completedAt))
      }
    })
    return Array.from(daysSet)
  })()

  const weeklyCap = 7
  const chargePerDay = 30
  const daysPending = chargeableDaysSinceSettlement.length
  const chargeableCount = Math.min(daysPending, weeklyCap)
  const totalDue = chargeableCount * chargePerDay

  const [payAmount, setPayAmount] = useState(() => {
    if (totalDue <= 0) return 0
    return Math.min(100, totalDue)
  })
  const [editingWeeklyAmount, setEditingWeeklyAmount] = useState(false)
  const [tempWeeklyAmount, setTempWeeklyAmount] = useState(walletData.customWeeklyAmount)
  const [paymentType, setPaymentType] = useState('partial') // 'partial', 'weekly', 'full'

  const clampPayAmount = (value) => {
    const v = Math.max(10, Math.min(totalDue, Math.floor(Number(value) || 0)))
    return v
  }

  const clampWeeklyAmount = (value) => {
    return Math.max(50, Math.floor(Number(value) || 0))
  }

  // Calculate minimum required payment for negative balance
  const minimumPayment = walletData.accountBalance < 0 ? Math.abs(walletData.accountBalance) : 0
  const effectiveMinPayment = Math.max(10, minimumPayment)

  const handleQuickAmount = (amt) => {
    setPayAmount(clampPayAmount(amt))
  }

  const handlePayment = () => {
    let amount
    switch(paymentType) {
      case 'weekly':
        amount = walletData.customWeeklyAmount
        break
      case 'full':
        amount = totalDue + (walletData.accountBalance < 0 ? Math.abs(walletData.accountBalance) : 0)
        break
      default:
        amount = clampPayAmount(payAmount)
    }
    window.location.href = `/dashboard/wallet/pay?amount=${amount}&type=${paymentType}`
  }

  const handleWeeklyAmountSave = () => {
    setWalletData(prev => ({ ...prev, customWeeklyAmount: clampWeeklyAmount(tempWeeklyAmount) }))
    setEditingWeeklyAmount(false)
  }

  const updateBalance = (paymentAmount) => {
    setWalletData(prev => {
      let newBalance = prev.accountBalance + paymentAmount
      // If there was a negative balance, payment goes towards clearing it first
      if (prev.accountBalance < 0) {
        newBalance = Math.min(0, prev.accountBalance + paymentAmount)
      }
      return { ...prev, accountBalance: newBalance }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <h1 className="text-xl font-bold text-slate-800">Wallet</h1>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Download className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Earnings Overview */}
        <div className="earnings-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Total Earnings</h3>
            <TrendingUp className="w-5 h-5 text-brand-600" />
          </div>
          
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-brand-700 mb-3">
              {formatCurrency(walletData.totalEarnings)}
            </p>
            <p className="text-sm text-slate-600">All-time earnings from deliveries</p>
          </div>
          
          {/* Direct Payment Info */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-success-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <IndianRupee className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 mb-2">Direct Payment System</h4>
                <p className="text-sm text-green-700 leading-relaxed">
                  All customer payments are transferred directly to your registered bank account or UPI. 
                  <span className="font-medium">No withdrawal needed</span> - money reaches you instantly after delivery!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Balance Status */}
        <div className="partner-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Account Balance</h3>
            <Wallet className="w-5 h-5 text-slate-600" />
          </div>
          
          <div className={`text-center p-4 rounded-xl ${
            walletData.accountBalance >= 0 
              ? "bg-success-50 border border-success-200" 
              : "bg-error-50 border border-error-200"
          }`}>
            <p className={`text-3xl font-bold mb-2 ${
              walletData.accountBalance >= 0 ? "text-success-700" : "text-error-700"
            }`}>
              {walletData.accountBalance >= 0 ? "+" : ""}{formatCurrency(walletData.accountBalance)}
            </p>
            <p className={`text-sm ${
              walletData.accountBalance >= 0 ? "text-success-600" : "text-error-600"
            }`}>
              {walletData.accountBalance >= 0 ? "Available Balance" : "Outstanding Balance"}
            </p>
            
            {walletData.accountBalance < 0 && (
              <div className="mt-3 p-3 bg-error-100 rounded-lg">
                <p className="text-xs text-error-700 font-medium">
                  ⚠️ Negative balance requires full payment: {formatCurrency(Math.abs(walletData.accountBalance))}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Payment Setup */}
        <div className="partner-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Weekly Auto Payment</h3>
            <Calendar className="w-5 h-5 text-brand-600" />
          </div>
          
          <div className="bg-brand-50 rounded-xl p-4 border border-brand-200 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-brand-800">Weekly Amount</p>
                <p className="text-xs text-brand-600">Automatically deducted every week</p>
              </div>
              <div className="flex items-center gap-2">
                {editingWeeklyAmount ? (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                      <input
                        type="number"
                        value={tempWeeklyAmount}
                        onChange={(e) => setTempWeeklyAmount(e.target.value)}
                        className="w-20 pl-6 pr-2 py-1 border border-brand-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                        min="50"
                      />
                    </div>
                    <button
                      onClick={handleWeeklyAmountSave}
                      className="p-1 bg-success-100 text-success-600 rounded hover:bg-success-200"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-brand-700">{formatCurrency(walletData.customWeeklyAmount)}</span>
                    <button
                      onClick={() => {
                        setTempWeeklyAmount(walletData.customWeeklyAmount)
                        setEditingWeeklyAmount(true)
                      }}
                      className="p-1 bg-brand-100 text-brand-600 rounded hover:bg-brand-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-700">Next Payment:</span>
              <span className="text-sm font-semibold text-brand-800">{formatDate(walletData.nextWeeklyPaymentDate)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {[150, 200, 300].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  setWalletData(prev => ({ ...prev, customWeeklyAmount: amt }))
                  setTempWeeklyAmount(amt)
                }}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  walletData.customWeeklyAmount === amt
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Due Alert */}
        {(totalDue > 0 || walletData.accountBalance < 0) && (
          <div className="payment-due partner-card p-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                walletData.accountBalance < 0 ? "bg-error-100" : "bg-warning-100"
              }`}>
                <AlertCircle className={`w-6 h-6 ${
                  walletData.accountBalance < 0 ? "text-error-600" : "text-warning-600"
                }`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-1 ${
                  walletData.accountBalance < 0 ? "text-error-900" : "text-warning-900"
                }`}>
                  {walletData.accountBalance < 0 ? "Negative Balance - Full Payment Required" : "Payment Due"}
                </h3>
                <p className={`text-sm mb-3 ${
                  walletData.accountBalance < 0 ? "text-error-700" : "text-warning-700"
                }`}>
                  {walletData.accountBalance < 0 
                    ? `You must pay the full negative amount of ${formatCurrency(Math.abs(walletData.accountBalance))} plus any pending dues`
                    : `You have pending platform charges of ${daysPending} days`
                  }
                </p>
                
                <div className="bg-white/50 rounded-lg p-3 mb-4">
                  {walletData.accountBalance < 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-error-800">Negative Balance:</span>
                      <span className="text-sm font-semibold text-error-900">{formatCurrency(Math.abs(walletData.accountBalance))}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-warning-800">Daily Charge:</span>
                    <span className="text-sm font-semibold text-warning-900">{formatCurrency(walletData.dailyDue)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-warning-800">Days Pending:</span>
                    <span className="text-sm font-semibold text-warning-900">{daysPending} days</span>
                  </div>
                  <div className="border-t border-warning-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-warning-800">Platform Dues:</span>
                      <span className="text-lg font-bold text-warning-900">{formatCurrency(totalDue)}</span>
                    </div>
                    {walletData.accountBalance < 0 && (
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-error-300">
                        <span className="font-semibold text-error-800">Total Required:</span>
                        <span className="text-lg font-bold text-error-900">
                          {formatCurrency(totalDue + Math.abs(walletData.accountBalance))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Type Selection */}
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-1 gap-3">
                {/* Weekly Payment Option */}
                <div 
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    paymentType === 'weekly' 
                      ? "border-brand-500 bg-brand-50" 
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                  onClick={() => setPaymentType('weekly')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        paymentType === 'weekly' ? "border-brand-500 bg-brand-500" : "border-slate-300"
                      }`}>
                        {paymentType === 'weekly' && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Weekly Payment</p>
                        <p className="text-xs text-slate-600">Pay your custom weekly amount</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-brand-700">{formatCurrency(walletData.customWeeklyAmount)}</span>
                  </div>
                </div>
                
                {/* Full Payment Option */}
                <div 
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    paymentType === 'full' 
                      ? "border-success-500 bg-success-50" 
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                  onClick={() => setPaymentType('full')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        paymentType === 'full' ? "border-success-500 bg-success-500" : "border-slate-300"
                      }`}>
                        {paymentType === 'full' && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Pay Full Amount</p>
                        <p className="text-xs text-slate-600">Clear all dues {walletData.accountBalance < 0 ? '+ negative balance' : ''}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-success-700">
                      {formatCurrency(totalDue + (walletData.accountBalance < 0 ? Math.abs(walletData.accountBalance) : 0))}
                    </span>
                  </div>
                </div>
                
                {/* Partial Payment Option - Only if balance is not negative */}
                {walletData.accountBalance >= 0 && (
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      paymentType === 'partial' 
                        ? "border-warning-500 bg-warning-50" 
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                    onClick={() => setPaymentType('partial')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          paymentType === 'partial' ? "border-warning-500 bg-warning-500" : "border-slate-300"
                        }`}>
                          {paymentType === 'partial' && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">Partial Payment</p>
                          <p className="text-xs text-slate-600">Pay custom amount (min ₹{effectiveMinPayment})</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">₹</span>
                        <input
                          type="number"
                          min={effectiveMinPayment}
                          max={totalDue}
                          value={payAmount}
                          onChange={(e) => {
                            setPayAmount(clampPayAmount(e.target.value))
                            setPaymentType('partial')
                          }}
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-warning-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPaymentType('partial')
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {paymentType === 'partial' && walletData.accountBalance >= 0 && (
                <div className="bg-white/80 rounded-lg p-3 border border-slate-200">
                  <div className="flex flex-wrap gap-2">
                    {[50, 100, 200, totalDue].filter(amt => amt >= effectiveMinPayment && amt <= totalDue).map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          setPayAmount(amt)
                          setPaymentType('partial')
                        }}
                        className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                          payAmount === amt && paymentType === 'partial'
                            ? "bg-warning-600 text-white border-warning-600"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {amt === totalDue ? 'Full Due' : `₹${amt}`}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Remaining amount stays pending for future payment.</p>
                </div>
              )}
            </div>

            <button
              onClick={handlePayment}
              className={`w-full py-3 px-6 rounded-xl text-base font-semibold transition-colors ${
                walletData.accountBalance < 0 
                  ? "bg-error-600 hover:bg-error-700 text-white"
                  : paymentType === 'weekly' 
                    ? "bg-brand-600 hover:bg-brand-700 text-white"
                    : paymentType === 'full'
                      ? "bg-success-600 hover:bg-success-700 text-white"
                      : "bg-warning-600 hover:bg-warning-700 text-white"
              }`}
            >
              {(() => {
                switch(paymentType) {
                  case 'weekly':
                    return `Pay Weekly Amount - ${formatCurrency(walletData.customWeeklyAmount)}`
                  case 'full':
                    return `Pay Full Amount - ${formatCurrency(totalDue + (walletData.accountBalance < 0 ? Math.abs(walletData.accountBalance) : 0))}`
                  default:
                    return `Pay Now - ${formatCurrency(clampPayAmount(payAmount))}`
                }
              })()}
            </button>
            
            {walletData.accountBalance < 0 && (
              <div className="mt-3 p-3 bg-error-50 rounded-lg border border-error-200">
                <p className="text-xs text-error-700">
                  ⚠️ <strong>Important:</strong> With a negative balance, you must pay the full outstanding amount weekly. 
                  Partial payments are not available until your balance is positive.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Weekly Earnings */}
        <div className="partner-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">This Week's Earnings</h3>
            <Calendar className="w-5 h-5 text-slate-600" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-success-50 rounded-xl p-4 border border-success-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success-500 rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-success-600 mb-1">Weekly Total</p>
                  <p className="text-xl font-bold text-success-700">{formatCurrency(walletData.weeklyEarnings)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-brand-50 rounded-xl p-4 border border-brand-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-brand-600 mb-1">All Time</p>
                  <p className="text-xl font-bold text-brand-700">{formatCurrency(walletData.totalEarnings)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Tabs */}
        <div className="partner-card p-6">
          <div className="flex border-b border-slate-200 mb-4">
            <button
              onClick={() => setActiveTab("due")}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "due" 
                  ? "text-brand-600 border-brand-500" 
                  : "text-slate-600 border-transparent hover:text-slate-800"
              }`}
            >
              Payment Due
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "history" 
                  ? "text-brand-600 border-brand-500" 
                  : "text-slate-600 border-transparent hover:text-slate-800"
              }`}
            >
              Transaction History
            </button>
          </div>

          {activeTab === "due" && (
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Platform charge per day:</span>
                  <span className="text-sm font-semibold text-slate-800">{formatCurrency(walletData.dailyDue)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Last payment date:</span>
                  <span className="text-sm font-semibold text-slate-800">{formatDate(walletData.lastPaymentDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Payment cycle:</span>
                  <span className="text-sm font-semibold text-slate-800">Weekly or as needed</span>
                </div>
              </div>
              
              <div className="bg-brand-50 rounded-lg p-4 border border-brand-200">
                <h4 className="font-semibold text-brand-800 mb-2">How it works:</h4>
                <ul className="text-sm text-brand-700 space-y-1">
                  <li>• Platform charge: {formatCurrency(walletData.dailyDue)}/day when active</li>
                  <li>• You can pay weekly or settle dues anytime</li>
                  <li>• Maximum 30 days payment period</li>
                  <li>• Automatic deduction available</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {paymentHistory.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === "payment" 
                        ? "bg-error-100" 
                        : "bg-success-100"
                    }`}>
                      {transaction.type === "payment" ? (
                        <CreditCard className="w-5 h-5 text-error-600" />
                      ) : (
                        <IndianRupee className="w-5 h-5 text-success-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{transaction.description}</p>
                      <p className="text-xs text-slate-600">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      transaction.amount > 0 ? "text-success-600" : "text-error-600"
                    }`}>
                      {transaction.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <p className="text-xs text-slate-500">
                      {transaction.status === 'paid_directly' ? 'Paid to Account' : transaction.status === 'completed' ? 'Completed' : transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
