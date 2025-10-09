"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, IndianRupee, TrendingUp, TrendingDown, 
  Calendar, Clock, Package, Star, Gift, Download,
  BarChart3, PieChart, Target, Award
} from "lucide-react"
import BottomNav from "../../../components/BottomNav"
import { formatCurrency, formatDate } from "../../../lib/utils"

export default function DetailedEarnings() {
  const [selectedPeriod, setSelectedPeriod] = useState("week")
  
  const [earningsData, setEarningsData] = useState({
    today: {
      totalEarnings: 850,
      deliveryEarnings: 720,
      tips: 80,
  // incentives: 50, (removed)
      orders: 8,
      hours: 6.5,
      averagePerOrder: 106.25,
      peakHours: 3.5
    },
    week: {
      totalEarnings: 4200,
      deliveryEarnings: 3600,
      tips: 380,
  // incentives: 220, (removed)
      orders: 42,
      hours: 35,
      averagePerOrder: 100,
      peakHours: 18
    },
    month: {
      totalEarnings: 18500,
      deliveryEarnings: 15800,
      tips: 1650,
  // incentives: 1050, (removed)
      orders: 185,
      hours: 152,
      averagePerOrder: 100,
      peakHours: 78
    }
  })

  const [dailyBreakdown, setDailyBreakdown] = useState([
    { date: "2024-01-10", earnings: 850, orders: 8, hours: 6.5, tips: 80 },
    { date: "2024-01-09", earnings: 720, orders: 7, hours: 5.8, tips: 65 },
    { date: "2024-01-08", earnings: 680, orders: 6, hours: 5.2, tips: 45 },
    { date: "2024-01-07", earnings: 780, orders: 8, hours: 6.0, tips: 70 },
    { date: "2024-01-06", earnings: 650, orders: 6, hours: 5.0, tips: 55 },
    { date: "2024-01-05", earnings: 920, orders: 10, hours: 7.5, tips: 95 },
    { date: "2024-01-04", earnings: 600, orders: 5, hours: 4.5, tips: 40 }
  ])

  // Incentive breakdown removed

  const currentData = earningsData[selectedPeriod]
  const periodLabels = {
    today: "Today",
    week: "This Week", 
    month: "This Month"
  }

  const getPerformanceMetrics = () => {
    const hoursWorked = currentData.hours
    const ordersCompleted = currentData.orders
    const earningsPerHour = currentData.totalEarnings / hoursWorked
    const peakHourPercentage = (currentData.peakHours / hoursWorked) * 100

    return {
      earningsPerHour: earningsPerHour.toFixed(2),
      ordersPerHour: (ordersCompleted / hoursWorked).toFixed(1),
      peakHourPercentage: peakHourPercentage.toFixed(1),
      tipPercentage: ((currentData.tips / currentData.deliveryEarnings) * 100).toFixed(1)
    }
  }

  const metrics = getPerformanceMetrics()

  const getEarningsBreakdown = () => {
    const total = currentData.totalEarnings
    return [
      {
        category: "Delivery Earnings",
        amount: currentData.deliveryEarnings,
        percentage: ((currentData.deliveryEarnings / total) * 100).toFixed(1),
        color: "bg-brand-500"
      },
      {
        category: "Tips",
        amount: currentData.tips,
        percentage: ((currentData.tips / total) * 100).toFixed(1),
        color: "bg-success-500"
      },
      // Incentives removed from breakdown
    ]
  }

  const breakdown = getEarningsBreakdown()

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Detailed Earnings</h1>
              <p className="text-sm text-slate-600">{periodLabels[selectedPeriod]} Report</p>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Download className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Period Selector */}
        <div className="partner-card p-6">
          <div className="flex space-x-1 bg-slate-100 rounded-xl p-1">
            {Object.keys(earningsData).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedPeriod === period
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {periodLabels[period]}
              </button>
            ))}
          </div>
        </div>

        {/* Total Earnings Card */}
        <div className="earnings-card">
          <div className="text-center mb-6">
            <h2 className="text-sm text-slate-600 mb-2">Total Earnings - {periodLabels[selectedPeriod]}</h2>
            <p className="text-4xl font-bold text-brand-700 mb-2">
              {formatCurrency(currentData.totalEarnings)}
            </p>
            <div className="flex items-center justify-center space-x-2 text-success-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">+12.5% from last {selectedPeriod}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Package className="w-5 h-5 text-brand-600" />
                <span className="text-sm text-slate-600">Orders</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{currentData.orders}</p>
            </div>
            <div className="bg-white/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-brand-600" />
                <span className="text-sm text-slate-600">Hours</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{currentData.hours}h</p>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="partner-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Earnings Breakdown</h3>
            <PieChart className="w-5 h-5 text-slate-600" />
          </div>
          
          <div className="space-y-4">
            {breakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{item.category}</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-800">{formatCurrency(item.amount)}</span>
                    <span className="text-xs text-slate-500 ml-2">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="partner-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Performance Metrics</h3>
            <BarChart3 className="w-5 h-5 text-slate-600" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-xl p-4 border border-success-200">
              <div className="flex items-center space-x-2 mb-2">
                <IndianRupee className="w-5 h-5 text-success-600" />
                <span className="text-sm text-success-700">Per Hour</span>
              </div>
              <p className="text-xl font-bold text-success-800">{formatCurrency(metrics.earningsPerHour)}</p>
            </div>
            
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl p-4 border border-brand-200">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-5 h-5 text-brand-600" />
                <span className="text-sm text-brand-700">Orders/Hour</span>
              </div>
              <p className="text-xl font-bold text-brand-800">{metrics.ordersPerHour}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-purple-700">Peak Hours</span>
              </div>
              <p className="text-xl font-bold text-purple-800">{metrics.peakHourPercentage}%</p>
            </div>
            
            <div className="bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl p-4 border border-warning-200">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-warning-600" />
                <span className="text-sm text-warning-700">Tip Rate</span>
              </div>
              <p className="text-xl font-bold text-warning-800">{metrics.tipPercentage}%</p>
            </div>
          </div>
        </div>

        {/* Incentive Breakdown removed */}

        {/* Daily Breakdown (for week/month view) */}
        {selectedPeriod !== "today" && (
          <div className="partner-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Daily Breakdown</h3>
              <Calendar className="w-5 h-5 text-slate-600" />
            </div>
            
            <div className="space-y-3">
              {dailyBreakdown.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-800">{formatDate(day.date)}</p>
                      <p className="text-xs text-slate-600">{day.hours}h worked</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Orders</p>
                      <p className="font-bold text-slate-800">{day.orders}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Tips</p>
                      <p className="font-bold text-success-600">{formatCurrency(day.tips)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Total</p>
                      <p className="font-bold text-brand-600">{formatCurrency(day.earnings)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Targets & Goals */}
        <div className="partner-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Targets & Goals</h3>
            <Target className="w-5 h-5 text-slate-600" />
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Weekly Target</span>
                <span className="text-sm text-slate-600">{formatCurrency(currentData.totalEarnings)} / {formatCurrency(5000)}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-brand-500 to-brand-600 h-3 rounded-full"
                  style={{ width: `${Math.min((currentData.totalEarnings / 5000) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500">84% completed</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Monthly Target</span>
                <span className="text-sm text-slate-600">{formatCurrency(18500)} / {formatCurrency(20000)}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-success-500 to-success-600 h-3 rounded-full"
                  style={{ width: `92.5%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500">92.5% completed</p>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="partner-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Export Report</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="partner-button-secondary flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button className="partner-button-secondary flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
