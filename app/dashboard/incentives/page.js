"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Gift, Star, Trophy, Target, Clock, IndianRupee } from "lucide-react"
import BottomNav from "../../../components/BottomNav"
import { formatCurrency } from "../../../lib/utils"

export default function IncentivesPage() {
  const [activeIncentives, setActiveIncentives] = useState([
    {
      id: 1,
      title: "Weekend Bonus",
      description: "Complete 15 deliveries this weekend",
      reward: 500,
      progress: 8,
      target: 15,
      endDate: "2024-01-14",
      type: "bonus"
    },
    {
      id: 2,
      title: "Peak Hour Champion",
      description: "Work 4 hours during peak time (6-9 PM)",
      reward: 300,
      progress: 2.5,
      target: 4,
      endDate: "2024-01-12",
      type: "hourly"
    },
    {
      id: 3,
      title: "Customer Rating Bonus",
      description: "Maintain 4.8+ rating this week",
      reward: 400,
      progress: 4.9,
      target: 4.8,
      endDate: "2024-01-14",
      type: "rating",
      achieved: true
    }
  ])

  const [completedIncentives, setCompletedIncentives] = useState([
    {
      id: 4,
      title: "New Year Special",
      description: "Complete 50 deliveries in January",
      reward: 1000,
      completedDate: "2024-01-08",
      type: "bonus"
    },
    {
      id: 5,
      title: "Perfect Week",
      description: "100% order acceptance rate",
      reward: 250,
      completedDate: "2024-01-05",
      type: "performance"
    }
  ])

  const getProgressPercentage = (progress, target) => {
    return Math.min((progress / target) * 100, 100)
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "bonus":
        return <Gift className="w-5 h-5" />
      case "rating":
        return <Star className="w-5 h-5" />
      case "performance":
        return <Trophy className="w-5 h-5" />
      case "hourly":
        return <Clock className="w-5 h-5" />
      default:
        return <Target className="w-5 h-5" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "bonus":
        return "bg-purple-100 text-purple-600"
      case "rating":
        return "bg-warning-100 text-warning-600"
      case "performance":
        return "bg-success-100 text-success-600"
      case "hourly":
        return "bg-brand-100 text-brand-600"
      default:
        return "bg-slate-100 text-slate-600"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Incentives</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Total Earnings This Month */}
        <div className="earnings-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Incentive Earnings</h3>
            <Trophy className="w-5 h-5 text-brand-600" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">This Month</p>
              <p className="text-2xl font-bold text-brand-700">{formatCurrency(2150)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">All Time</p>
              <p className="text-2xl font-bold text-brand-700">{formatCurrency(8750)}</p>
            </div>
          </div>
        </div>

        {/* Active Incentives */}
        <div className="partner-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Active Incentives</h3>
          
          <div className="space-y-4">
            {activeIncentives.map((incentive) => (
              <div key={incentive.id} className={`border rounded-xl p-4 ${
                incentive.achieved ? "border-success-300 bg-success-50" : "border-slate-200 bg-white"
              }`}>
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(incentive.type)}`}>
                    {getTypeIcon(incentive.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-slate-800">{incentive.title}</h4>
                      <div className="flex items-center space-x-1">
                        <IndianRupee className="w-4 h-4 text-success-600" />
                        <span className="font-bold text-success-600">{incentive.reward}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{incentive.description}</p>
                    
                    {!incentive.achieved && (
                      <>
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                          <span>Progress: {incentive.progress} / {incentive.target}</span>
                          <span>{Math.round(getProgressPercentage(incentive.progress, incentive.target))}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-brand-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${getProgressPercentage(incentive.progress, incentive.target)}%` }}
                          ></div>
                        </div>
                      </>
                    )}
                    
                    {incentive.achieved && (
                      <div className="flex items-center space-x-2 text-success-600">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm font-semibold">Achieved! Reward pending</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  <span>Ends: {new Date(incentive.endDate).toLocaleDateString()}</span>
                  <span className="capitalize">{incentive.type} Incentive</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Incentives */}
        <div className="partner-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recently Completed</h3>
          
          <div className="space-y-3">
            {completedIncentives.map((incentive) => (
              <div key={incentive.id} className="flex items-center space-x-3 p-3 bg-success-50 border border-success-200 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(incentive.type)}`}>
                  {getTypeIcon(incentive.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">{incentive.title}</h4>
                  <p className="text-sm text-slate-600">{incentive.description}</p>
                  <p className="text-xs text-slate-500">Completed: {new Date(incentive.completedDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-success-600">
                    <IndianRupee className="w-4 h-4" />
                    <span className="font-bold">{incentive.reward}</span>
                  </div>
                  <span className="text-xs text-success-500">Credited</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips for Earning More */}
        <div className="partner-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Tips to Earn More</h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-brand-50 border border-brand-200 rounded-lg">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-brand-800">Work During Peak Hours</h4>
                <p className="text-sm text-brand-700">6-9 PM weekdays and 12-3 PM weekends offer bonus rates</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <div className="w-8 h-8 bg-warning-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-warning-800">Maintain High Ratings</h4>
                <p className="text-sm text-warning-700">Keep your rating above 4.5 to qualify for premium incentives</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-800">Complete Weekly Targets</h4>
                <p className="text-sm text-purple-700">Consistent performance unlocks exclusive bonus opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
