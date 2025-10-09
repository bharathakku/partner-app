"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

const ProfileContext = createContext()

// Minimal safe defaults to avoid crashes before real data loads
const DEFAULT_PROFILE_DATA = {
  name: '—',
  email: '—',
  phone: '—',
  alternatePhone: '—',
  address: '—',
  dateOfBirth: '—',
  joinedDate: new Date().toISOString(),
  rating: '—',
  totalRatings: 0,
  profileComplete: 0,
  documents: {
    aadharCard: { status: 'pending', uploadDate: null, expiryDate: null },
    panCard: { status: 'pending', uploadDate: null, expiryDate: null },
    drivingLicense: { status: 'pending', uploadDate: null, expiryDate: null },
    vehicleRC: { status: 'pending', uploadDate: null, expiryDate: null },
    vehiclePicture: { status: 'pending', uploadDate: null, expiryDate: null },
  },
  vehicle: {
    type: '—',
    brand: '—',
    model: '—',
    registrationNumber: '—',
    color: '—',
    yearOfManufacture: '—',
  },
  performance: {
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    completionRate: 0,
    onTimeDeliveryRate: 0,
    avgDeliveryTime: '—',
    totalEarnings: '—',
    thisMonthEarnings: '—',
  },
  account: {
    partnerId: '—',
    partnerType: '—',
    accountStatus: '—',
    kycStatus: '—',
    trainingStatus: '—',
  },
  referral: {
    referralCode: '—',
    totalReferrals: 0,
    referralEarnings: '—',
  },
}

function normalizeApiBase() {
  const RAW = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001'
  return RAW.endsWith('/api') ? RAW : `${RAW.replace(/\/$/, '')}/api`
}

function mapDriverToProfile(driver) {
  const user = driver?.userId || {}
  const docsArr = Array.isArray(driver?.documents) ? driver.documents : []
  const byType = Object.fromEntries(docsArr.map(d => [String(d.type || '').toLowerCase(), d]))

  const toStatus = (s) => (s === 'approved' ? 'verified' : s === 'rejected' ? 'expired' : 'pending')

  return {
    name: driver?.fullName || user?.name || '—',
    email: driver?.email || user?.email || '—',
    phone: user?.phone || '—',
    alternatePhone: '—',
    address: '—',
    dateOfBirth: '—',
    joinedDate: driver?.createdAt || new Date().toISOString(),
    rating: '—',
    totalRatings: 0,
    profileComplete: 0,
    documents: {
      aadharCard: { status: toStatus(byType.aadhar?.status), uploadDate: null, expiryDate: null },
      panCard: { status: toStatus(byType.pan?.status), uploadDate: null, expiryDate: null },
      drivingLicense: { status: toStatus(byType['drivinglicense']?.status || byType.drivingLicense?.status), uploadDate: null, expiryDate: null },
      vehicleRC: { status: toStatus(byType['vehiclerc']?.status || byType.vehicleRC?.status), uploadDate: null, expiryDate: null },
      vehiclePicture: { status: toStatus(byType['vehiclepicture']?.status || byType.vehiclePicture?.status), uploadDate: null, expiryDate: null },
    },
    vehicle: {
      type: driver?.vehicleType || '—',
      brand: '—',
      model: '—',
      registrationNumber: driver?.vehicleNumber || '—',
      color: '—',
      yearOfManufacture: '—',
    },
    performance: {
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      completionRate: 0,
      onTimeDeliveryRate: 0,
      avgDeliveryTime: '—',
      totalEarnings: '—',
      thisMonthEarnings: '—',
    },
    account: {
      partnerId: String(driver?._id || '—'),
      partnerType: driver?.companyName ? 'Company' : 'Individual',
      accountStatus: driver?.isActive ? 'Active' : 'Inactive',
      kycStatus: docsArr.length ? (docsArr.every(d => d.status === 'approved') ? 'Completed' : 'Pending') : 'Pending',
      trainingStatus: '—',
    },
    referral: {
      referralCode: '—',
      totalReferrals: 0,
      referralEarnings: '—',
    },
  }
}

export function ProfileProvider({ children }) {
  const [profileData, setProfileData] = useState(DEFAULT_PROFILE_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const redirectGuardRef = useRef(false)
  const pathname = usePathname()

  const fetchProfile = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const API_BASE = normalizeApiBase()
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const onAuthRoute = typeof pathname === 'string' && pathname.startsWith('/auth')
      const isPublicRoute = pathname === '/' || pathname.startsWith('/terms') || pathname.startsWith('/privacy')
      const isProtectedRoute = pathname === '/profile'

      // Avoid hitting drivers/me on auth pages (login/otp/kyc) to prevent repeated 403s
      if (onAuthRoute) {
        setIsLoading(false)
        return
      }

      // Pre-hydrate minimal profile from last known user_data to avoid empty screens
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null
        if (raw) {
          const u = JSON.parse(raw)
          setProfileData(prev => ({
            ...prev,
            name: u?.name || prev.name,
            email: u?.email || prev.email,
            phone: u?.phone || prev.phone,
          }))
        }
      } catch {}

      if (!token) {
        if (!onAuthRoute && !isPublicRoute && typeof window !== 'undefined' && !redirectGuardRef.current) {
          redirectGuardRef.current = true
          setTimeout(() => { window.location.replace('/auth/login') }, 300)
        }
        setIsLoading(false)
        return
      }

      const res = await fetch(`${API_BASE}/drivers/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      })
      if (res.status === 401) {
        // Token invalid/expired: log out
        try { localStorage.removeItem('auth_token'); localStorage.removeItem('user_data'); } catch {}
        setError('Unauthorized. Please log in again.')
        if (!onAuthRoute && typeof window !== 'undefined' && !redirectGuardRef.current) {
          redirectGuardRef.current = true
          setTimeout(() => { window.location.replace('/auth/login') }, 300)
        }
        setIsLoading(false)
        return
      }
      if (res.status === 403) {
        // Authenticated but not provisioned/needs KYC.
        // Only redirect if user is trying to access protected areas.
        if (isProtectedRoute && typeof window !== 'undefined' && !redirectGuardRef.current) {
          redirectGuardRef.current = true
          setTimeout(() => { window.location.replace('/auth/kyc') }, 200)
        }
        // Otherwise, keep user on the current route and surface a soft error.
        setError('KYC required to access some features.')
        setIsLoading(false)
        return
      }
      if (res.status === 404) {
        // No driver profile yet; allow KYC when user navigates there
        if (isProtectedRoute && typeof window !== 'undefined' && !redirectGuardRef.current) {
          redirectGuardRef.current = true
          setTimeout(() => { window.location.replace('/auth/kyc') }, 200)
        }
        setIsLoading(false)
        return
      }
      if (!res.ok) throw new Error(`Failed to load profile (HTTP ${res.status})`)
      const driver = await res.json()
      const mapped = mapDriverToProfile(driver)
      setProfileData(mapped)
    } catch (err) {
      setError(err?.message || 'Failed to fetch profile data')
      console.error('Profile fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Update profile data
  const updateProfile = async (updates) => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setProfileData(prev => ({ ...prev, ...updates }))
      return { success: true }
    } catch (err) {
      setError('Failed to update profile')
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }

  const updateDocumentStatus = async (documentKey, status, uploadDate = null, expiryDate = null) => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const updatedDocuments = {
        ...profileData.documents,
        [documentKey]: { status, uploadDate: uploadDate || new Date().toISOString().split('T')[0], expiryDate }
      }
      setProfileData(prev => ({ ...prev, documents: updatedDocuments }))
      return { success: true }
    } catch (err) {
      setError('Failed to update document status')
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }

  const updatePerformanceStats = (stats) => {
    setProfileData(prev => ({ ...prev, performance: { ...prev.performance, ...stats } }))
  }

  const calculateProfileCompletion = useCallback(() => {
    const requiredFields = [profileData.name, profileData.email, profileData.phone, profileData.address, profileData.dateOfBirth]
    const requiredDocuments = ['aadharCard', 'panCard', 'drivingLicense', 'vehicleRC', 'vehiclePicture']
    const verifiedDocs = requiredDocuments.filter(doc => profileData.documents[doc]?.status === 'verified').length
    const fieldsComplete = requiredFields.filter(f => f && String(f).trim() !== '').length
    const vehicleInfoComplete = Object.values(profileData.vehicle).filter(v => v && String(v).trim() !== '').length
    const totalPoints = requiredFields.length + requiredDocuments.length + Object.keys(profileData.vehicle).length
    const completedPoints = fieldsComplete + verifiedDocs + vehicleInfoComplete
    return Math.round((completedPoints / totalPoints) * 100)
  }, [profileData])

  const getUrgentActions = () => {
    const actions = []
    Object.entries(profileData.documents).forEach(([key, doc]) => {
      if (doc.status === 'expired') {
        const names = { aadharCard: 'Aadhar Card', panCard: 'PAN Card', drivingLicense: 'Driving License', vehicleRC: 'Vehicle RC', vehiclePicture: 'Vehicle Picture' }
        actions.push({ type: 'document_expired', message: `${names[key]} has expired`, priority: 'high', action: `Upload renewed ${names[key]}` })
      }
      if (doc.status === 'pending') {
        const names = { aadharCard: 'Aadhar Card', panCard: 'PAN Card', drivingLicense: 'Driving License', vehicleRC: 'Vehicle RC', vehiclePicture: 'Vehicle Picture' }
        actions.push({ type: 'document_pending', message: `${names[key]} verification is pending`, priority: 'medium', action: `Wait for ${names[key]} verification` })
      }
    })
    const completion = calculateProfileCompletion()
    if (completion < 90) actions.push({ type: 'profile_incomplete', message: `Profile is ${completion}% complete`, priority: 'low', action: 'Complete your profile to get more orders' })
    const priorities = { high: 3, medium: 2, low: 1 }
    return actions.sort((a, b) => priorities[b.priority] - priorities[a.priority])
  }

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    const completion = calculateProfileCompletion()
    if (completion !== profileData.profileComplete) {
      setProfileData(prev => ({ ...prev, profileComplete: completion }))
    }
  }, [calculateProfileCompletion, profileData.profileComplete])

  const value = {
    profileData,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    updateDocumentStatus,
    updatePerformanceStats,
    profileCompletion: calculateProfileCompletion(),
    urgentActions: getUrgentActions(),
    formatDate: (dateString) => new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }),
    isDocumentExpiringSoon: (documentKey, daysThreshold = 30) => {
      const doc = profileData.documents[documentKey]
      if (!doc?.expiryDate) return false
      const expiryDate = new Date(doc.expiryDate)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0
    },
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) throw new Error('useProfile must be used within a ProfileProvider')
  return context
}

export default ProfileContext

