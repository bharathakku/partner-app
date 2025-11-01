"use client"

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ProfileContext = createContext()

// Sample partner profile data - in a real app, this would come from an API
const DEFAULT_PROFILE_DATA = {
  // Personal Information
  name: "Rajesh Kumar",
  email: "rajesh.kumar@example.com",
  phone: "+91 98765 43210",
  alternatePhone: "+91 87654 32109",
  address: "123 Main Street, Sector 15, Gurugram, Haryana 122001",
  dateOfBirth: "1985-06-15",
  joinedDate: "2023-01-15",
  
  // Profile & Rating
  rating: 4.8,
  totalRatings: 1247,
  profileComplete: 95,
  
  // Document Status
  documents: {
    aadharCard: { status: "verified", uploadDate: "2023-01-16", expiryDate: null },
    panCard: { status: "verified", uploadDate: "2023-01-16", expiryDate: null },
    drivingLicense: { status: "verified", uploadDate: "2023-01-16", expiryDate: "2028-06-15" },
    vehicleRC: { status: "pending", uploadDate: "2023-12-01", expiryDate: "2025-12-31" },
    insurance: { status: "expired", uploadDate: "2023-01-16", expiryDate: "2023-12-15" },
    pollution: { status: "verified", uploadDate: "2023-11-01", expiryDate: "2024-11-01" }
  },
  
  // Vehicle Information
  vehicle: {
    type: "Motorcycle",
    brand: "Honda",
    model: "Activa 6G",
    registrationNumber: "HR26 AB 1234",
    color: "Blue",
    yearOfManufacture: "2022"
  },
  
  // Performance Stats
  performance: {
    totalOrders: 2847,
    completedOrders: 2698,
    cancelledOrders: 149,
    completionRate: 94.8,
    onTimeDeliveryRate: 96.2,
    avgDeliveryTime: "28 minutes",
    totalEarnings: "₹1,24,500",
    thisMonthEarnings: "₹18,750"
  },
  
  // Account Details
  account: {
    partnerId: "PID123456",
    partnerType: "Premium",
    accountStatus: "Active",
    kycStatus: "Completed",
    trainingStatus: "Completed",
    subscription: {
      status: "active", // 'active', 'expired', 'none'
      planId: "monthly",
      startDate: new Date().toISOString(),
      // Set end date to 30 days from now by default
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: true,
      // Add plan details for reference
      planName: "Monthly Plan",
      amount: 1399,
      currency: "INR"
    }
  },

  // Referral Information
  referral: {
    referralCode: "RAJ2024",
    totalReferrals: 5,
    referralEarnings: "₹500"
  }
}

export function ProfileProvider({ children }) {
  const [profileData, setProfileData] = useState(DEFAULT_PROFILE_DATA)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Simulated API call to fetch profile data
  const fetchProfile = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, you would fetch from your API here
      // const response = await fetch('/api/partner/profile')
      // const data = await response.json()
      
      setProfileData(DEFAULT_PROFILE_DATA)
    } catch (err) {
      setError('Failed to fetch profile data')
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, you would send updates to your API here
      // const response = await fetch('/api/partner/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates)
      // })
      
      // Update local state
      setProfileData(prevData => ({
        ...prevData,
        ...updates
      }))
      
      return { success: true }
    } catch (err) {
      setError('Failed to update profile')
      console.error('Profile update error:', err)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Update document status
  const updateDocumentStatus = async (documentKey, status, uploadDate = null, expiryDate = null) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updatedDocuments = {
        ...profileData.documents,
        [documentKey]: {
          status,
          uploadDate: uploadDate || new Date().toISOString().split('T')[0],
          expiryDate
        }
      }
      
      setProfileData(prevData => ({
        ...prevData,
        documents: updatedDocuments
      }))
      
      return { success: true }
    } catch (err) {
      setError('Failed to update document status')
      console.error('Document update error:', err)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Update performance stats (usually called after completing orders)
  const updatePerformanceStats = (stats) => {
    setProfileData(prevData => ({
      ...prevData,
      performance: {
        ...prevData.performance,
        ...stats
      }
    }))
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const requiredFields = [
      profileData.name,
      profileData.email,
      profileData.phone,
      profileData.address,
      profileData.dateOfBirth
    ]
    
    const requiredDocuments = ['aadharCard', 'panCard', 'drivingLicense', 'vehicleRC', 'insurance']
    const verifiedDocs = requiredDocuments.filter(doc => 
      profileData.documents[doc]?.status === 'verified'
    ).length
    
    const fieldsComplete = requiredFields.filter(field => field && field.trim() !== '').length
    const vehicleInfoComplete = Object.values(profileData.vehicle).filter(value => 
      value && value.trim() !== ''
    ).length
    
    const totalPoints = requiredFields.length + requiredDocuments.length + Object.keys(profileData.vehicle).length
    const completedPoints = fieldsComplete + verifiedDocs + vehicleInfoComplete
    
    return Math.round((completedPoints / totalPoints) * 100)
  }

  // Get urgent actions needed
  const getUrgentActions = () => {
    const actions = []
    
    // Check for expired documents
    Object.entries(profileData.documents).forEach(([key, doc]) => {
      if (doc.status === 'expired') {
        const docNames = {
          aadharCard: 'Aadhar Card',
          panCard: 'PAN Card',
          drivingLicense: 'Driving License',
          vehicleRC: 'Vehicle RC',
          insurance: 'Vehicle Insurance',
          pollution: 'Pollution Certificate'
        }
        actions.push({
          type: 'document_expired',
          message: `${docNames[key]} has expired`,
          priority: 'high',
          action: `Upload renewed ${docNames[key]}`
        })
      }
      
      if (doc.status === 'pending') {
        const docNames = {
          aadharCard: 'Aadhar Card',
          panCard: 'PAN Card',
          drivingLicense: 'Driving License',
          vehicleRC: 'Vehicle RC',
          insurance: 'Vehicle Insurance',
          pollution: 'Pollution Certificate'
        }
        actions.push({
          type: 'document_pending',
          message: `${docNames[key]} verification is pending`,
          priority: 'medium',
          action: `Wait for ${docNames[key]} verification`
        })
      }
    })
    
    // Check profile completion
    const completion = calculateProfileCompletion()
    if (completion < 90) {
      actions.push({
        type: 'profile_incomplete',
        message: `Profile is ${completion}% complete`,
        priority: 'low',
        action: 'Complete your profile to get more orders'
      })
    }
    
    return actions.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 }
      return priorities[b.priority] - priorities[a.priority]
    })
  }

  // Load profile data on mount
  useEffect(() => {
    console.log('=== Initializing Profile Context ===');
    
    // Try to load user data from localStorage
    try {
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        console.log('Loaded user data from localStorage:', userData);
        
        // Update the profile data with stored data
        if (userData.account?.subscription) {
          console.log('Found subscription in localStorage:', userData.account.subscription);
          setProfileData(prev => ({
            ...prev,
            account: {
              ...prev.account,
              subscription: {
                ...prev.account?.subscription,
                ...userData.account.subscription
              }
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);
    }
    
    // In a real app, you would fetch the latest profile data here
    // fetchProfile();
  }, [])

  // Recalculate profile completion when data changes
  useEffect(() => {
    const completion = calculateProfileCompletion()
    if (completion !== profileData.profileComplete) {
      setProfileData(prevData => ({
        ...prevData,
        profileComplete: completion
      }))
    }
  }, [profileData.name, profileData.email, profileData.phone, profileData.address, profileData.dateOfBirth, profileData.documents, profileData.vehicle])

  // Check if user has active subscription
  const hasActiveSubscription = useCallback(() => {
    try {
      console.log('Checking subscription status...');
      if (!profileData?.account?.subscription) {
        console.log('No subscription data found');
        return false;
      }
      
      const { status, endDate } = profileData.account.subscription;
      console.log('Subscription data:', { status, endDate });
      
      // If no end date, consider it as no active subscription
      if (!endDate) {
        console.log('No end date found in subscription');
        return false;
      }
      
      // If status is explicitly set to 'expired' or 'none', return false
      if (['expired', 'none'].includes(status)) {
        console.log('Subscription status is expired or none');
        return false;
      }
      
      // Check if the end date is in the future
      const isActive = new Date(endDate) > new Date();
      console.log('Subscription is active:', isActive);
      return isActive;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }, [profileData]);

  // Update subscription status
  const updateSubscription = useCallback(async (subscriptionData) => {
    console.log('=== Updating Subscription ===');
    console.log('New subscription data:', subscriptionData);
    
    setProfileData(prevData => {
      const currentSubscription = prevData.account?.subscription || {};
      const updatedSubscription = {
        ...currentSubscription,
        ...subscriptionData,
        status: 'active', // Ensure status is set to active
        updatedAt: new Date().toISOString()
      };
      
      console.log('Previous subscription:', currentSubscription);
      console.log('Updated subscription:', updatedSubscription);
      
      const updated = {
        ...prevData,
        account: {
          ...prevData.account,
          subscription: updatedSubscription
        }
      };
      
      console.log('New profile data with subscription:', updated);
      return updated;
    });
    
    // Also update localStorage for persistence
    try {
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const currentSubscription = userData.account?.subscription || {};
      const updatedSubscription = {
        ...currentSubscription,
        ...subscriptionData,
        status: 'active',
        updatedAt: new Date().toISOString()
      };
      
      const updatedUserData = {
        ...userData,
        account: {
          ...userData.account,
          subscription: updatedSubscription
        }
      };
      
      localStorage.setItem('user_data', JSON.stringify(updatedUserData));
      console.log('Successfully updated subscription in localStorage');
    } catch (error) {
      console.error('Error updating subscription in localStorage:', error);
    }
  }, []);
  };

  const value = {
    // Data
    profileData,
    isLoading,
    error,
    
    // Actions
    fetchProfile,
    updateProfile,
    updateDocumentStatus,
    updatePerformanceStats,
    updateSubscription,
    
    // Subscription
    hasActiveSubscription,
    
    // Computed values
    profileCompletion: calculateProfileCompletion(),
    urgentActions: getUrgentActions(),
    
    // Helper functions
    formatDate: (dateString) => {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    
    isDocumentExpiringSoon: (documentKey, daysThreshold = 30) => {
      const doc = profileData.documents[documentKey]
      if (!doc?.expiryDate) return false
      
      const expiryDate = new Date(doc.expiryDate)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
      
      return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0
    }
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

export default ProfileContext
