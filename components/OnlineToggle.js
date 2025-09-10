"use client"

import { useState } from "react"
import { Power, Loader2 } from "lucide-react"
import { cn } from "../lib/utils"
import { useRouter, usePathname } from "next/navigation"

export default function OnlineToggle({ initialStatus = false, onStatusChange, isOnline, onToggle }) {
  const [internalIsOnline, setInternalIsOnline] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  
  // Use external state if provided (for order-demo page), otherwise use internal state
  const currentOnlineState = isOnline !== undefined ? isOnline : internalIsOnline
  const handleStateChange = onToggle || setInternalIsOnline

  const handleToggle = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newStatus = !currentOnlineState
      handleStateChange(newStatus)
      onStatusChange?.(newStatus)
      
      // Stay on current page when going online
      // Order popup will appear directly on dashboard after 3 seconds
    } catch (error) {
      console.error("Failed to toggle status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="partner-card p-6">
      <div className="text-center">
        <div className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300",
          currentOnlineState 
            ? "bg-gradient-to-r from-success-500 to-success-600 shadow-lg shadow-success-200" 
            : "bg-slate-200 border-2 border-slate-300"
        )}>
          {isLoading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Power className={cn(
              "w-8 h-8 transition-colors",
              currentOnlineState ? "text-white" : "text-slate-500"
            )} />
          )}
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          You're {currentOnlineState ? "Online" : "Offline"}
        </h3>
        
        <p className="text-slate-600 mb-6">
          {currentOnlineState 
            ? "Ready to receive delivery requests" 
            : "You won't receive any delivery requests"
          }
        </p>
        
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={cn(
            "px-8 py-3 rounded-xl font-semibold text-base transition-all duration-200 disabled:opacity-50",
            currentOnlineState
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              : "bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 shadow-lg hover:shadow-xl"
          )}
        >
          {isLoading ? "Switching..." : currentOnlineState ? "Go Offline" : "Go Online"}
        </button>
      </div>
    </div>
  )
}
