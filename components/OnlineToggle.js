"use client"

import { useState } from "react"
import { Power, Loader2 } from "lucide-react"
import { cn } from "../lib/utils"
import { useRouter, usePathname } from "next/navigation"

export default function OnlineToggle({ initialStatus = false, onStatusChange, isOnline, onToggle, variant = 'full' }) {
  const [internalIsOnline, setInternalIsOnline] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  
  // Use external state if provided (for order-demo page), otherwise use internal state
  const currentOnlineState = isOnline !== undefined ? isOnline : internalIsOnline
  const handleStateChange = onToggle || setInternalIsOnline

  const handleToggle = async () => {
    setIsLoading(true);
    
    try {
      const newStatus = !currentOnlineState;
      const token = localStorage.getItem('auth_token');
      // Ensure we always hit the /api base
      const RAW_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001').replace(/\/+$/, '');
      const API_BASE_URL = RAW_BASE.endsWith('/api') ? RAW_BASE : `${RAW_BASE}/api`;
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const apiUrl = `${API_BASE_URL}/drivers/me/online`;
      console.log('Toggling status to:', newStatus);
      console.log('Using API URL:', apiUrl);
      
      // Try to get current position for zone validation when going online
      let lat = undefined, lng = undefined;
      if (newStatus) {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          try {
            const pos = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
            });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          } catch (geoErr) {
            console.warn('Geolocation failed:', geoErr?.message || geoErr);
          }
        }
        // Require fresh location to go online (prevents stale [0,0] in DB)
        if (typeof lat !== 'number' || typeof lng !== 'number') {
          alert('Location permission is required to go online. Please allow location access and try again.');
          setIsLoading(false);
          return;
        }
        // Update server-side cached location first
        const locResp = await fetch(`${API_BASE_URL}/drivers/me/location`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ lat, lng })
        });
        if (!locResp.ok) {
          const t = await locResp.text();
          console.error('Failed to update location:', t);
          alert('Could not update your location. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      const body = { isOnline: newStatus };
      if (typeof lat === 'number' && typeof lng === 'number') {
        body.lat = lat; body.lng = lng;
      }

      // Make direct API call to backend
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || 'Failed to update status');
      }
      
      // Update local state only after successful API call
      handleStateChange(newStatus);
      onStatusChange?.(newStatus);
      
      // Show success message
      console.log(`Successfully ${newStatus ? 'went online' : 'went offline'}`);
      
    } catch (error) {
      console.error("Failed to toggle status:", error);
      // Show error to user (you can implement a toast or alert here)
      alert(error.message || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          "flex items-center justify-center h-9 px-3 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
          currentOnlineState
            ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
            : "bg-success-500 text-white hover:bg-success-600"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
        ) : (
          <Power className={cn(
            "w-3.5 h-3.5 mr-1.5",
            currentOnlineState ? "text-slate-600" : "text-white"
          )} />
        )}
        {currentOnlineState ? "Online" : "Go Online"}
      </button>
    );
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
            "w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200",
            currentOnlineState
              ? "bg-slate-800 hover:bg-slate-900"
              : "bg-success-500 hover:bg-success-600 shadow-md shadow-success-200"
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {currentOnlineState ? "Going Offline..." : "Going Online..."}
            </span>
          ) : currentOnlineState ? (
            "Go Offline"
          ) : (
            "Go Online"
          )}
        </button>
      </div>
    </div>
  )
}
