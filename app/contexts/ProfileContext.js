"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ProfileContext Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong in ProfileContext</div>;
    }
    return this.props.children;
  }
}

// Helper function to safely access localStorage
const safeLocalStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

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
  }
}

// Helper function to normalize API base URL
const normalizeApiBase = () => {
  try {
    // First try to get from environment
    let base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    
    // If not in environment, try to get from window.location in browser
    if (!base && typeof window !== 'undefined') {
      base = window.location.origin;
    }
    
    // Default fallback
    if (!base) {
      base = 'http://localhost:4001';
    }
    
    // Clean up the base URL
    base = base.trim().replace(/\/$/, '');
    
    // Ensure it has /api suffix if not already present
    if (!base.endsWith('/api')) {
      base = `${base}/api`;
    }
    
    console.log('Using API base URL:', base);
    return base;
  } catch (error) {
    console.error('Error normalizing API base URL:', error);
    return 'http://localhost:4001/api';
  }
}

// Helper function to map API response to profile data structure
const mapDriverToProfile = (driver) => {
  if (!driver) return DEFAULT_PROFILE_DATA

  return {
    ...DEFAULT_PROFILE_DATA,
    ...driver,
    documents: {
      ...DEFAULT_PROFILE_DATA.documents,
      ...(driver.documents || {})
    },
    vehicle: {
      ...DEFAULT_PROFILE_DATA.vehicle,
      ...(driver.vehicle || {})
    },
    performance: {
      ...DEFAULT_PROFILE_DATA.performance,
      ...(driver.performance || {})
    },
    account: {
      ...DEFAULT_PROFILE_DATA.account,
      ...(driver.account || {})
    }
  }
}

export function ProfileProvider({ children }) {
  const [profileData, setProfileData] = useState(DEFAULT_PROFILE_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const redirectGuardRef = useRef(false)
  const pathname = useRouter()

  // Fetch profile data with enhanced error handling
  const fetchProfile = useCallback(async (retryCount = 0) => {
    // Skip if we're not in a browser environment
    if (typeof window === 'undefined') {
      console.log('Skipping fetchProfile - not in browser environment');
      return;
    }
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second
    let controller;
    let timeoutId;
    
    try {
      console.group(`[fetchProfile] Attempt ${retryCount + 1}/${MAX_RETRIES + 1}`);
      
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Fetching profile data...');
      const token = safeLocalStorage.getItem('auth_token');
      
      if (!token) {
        const error = new Error('No authentication token found. Please log in again.');
        console.error('❌ Auth error:', error.message);
        throw error;
      }

      // Setup abort controller and timeout
      controller = new AbortController();
      timeoutId = setTimeout(() => {
        console.warn('⏱️  Request timed out after 10 seconds');
        controller.abort();
      }, 10000);
      
      const apiBase = normalizeApiBase();
      const apiUrl = `${apiBase}/drivers/me`;
      
      console.log('🌐 API URL:', apiUrl);
      console.log('🔑 Token present:', !!token);
      
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-store',
        redirect: 'follow'
      };
      
      console.log('⚙️ Fetch options:', {
        ...fetchOptions,
        headers: { ...fetchOptions.headers, 'Authorization': 'Bearer [REDACTED]' }
      });
      
      let response;
      const startTime = Date.now();
      
      try {
        console.log('🚀 Sending request...');
        response = await fetch(apiUrl, fetchOptions);
        const endTime = Date.now();
        console.log(`✅ Request completed in ${endTime - startTime}ms`);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        const errorDetails = {
          name: fetchError.name,
          message: fetchError.message,
          isAborted: fetchError.name === 'AbortError',
          isNetworkError: !navigator.onLine ? 'Offline' : 'Online',
          errorType: 'network'
        };
        
        console.error('❌ Fetch error:', errorDetails);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please check your internet connection.');
        }
        
        // Network error - retry if we haven't exceeded max retries
        if (retryCount < MAX_RETRIES) {
          const nextRetry = retryCount + 1;
          const retryDelay = RETRY_DELAY * Math.pow(2, retryCount);
          console.warn(`🔄 Network error (${fetchError.message}), retrying (${nextRetry}/${MAX_RETRIES}) in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return fetchProfile(nextRetry);
        }
        
        throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
      }
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      // Log response details
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      console.log('📥 Response status:', response.status, response.statusText);
      console.log('📋 Response headers:', responseHeaders);

      // Handle different HTTP status codes
      if (!response.ok) {
        // Token might be expired, clear it and redirect to login
        if (response.status === 401) {
          console.warn('Token expired or invalid, redirecting to login');
          safeLocalStorage.removeItem('auth_token');
          safeLocalStorage.removeItem('user_data');
          
          // Use router for navigation if available, otherwise fallback to window.location
          if (pathname) {
            pathname.push('/auth/login');
          } else if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          return;
        }
        
        // Try to parse error response
        let errorMessage = `Failed to fetch profile data (HTTP ${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.warn('Failed to parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      // Process successful response
      try {
        const responseText = await response.text();
        console.log('📄 Raw API response:', responseText);
        
        let data;
        try {
          data = responseText ? JSON.parse(responseText) : {};
          console.log('🔍 Parsed API response:', data);
        } catch (parseError) {
          console.error('❌ Failed to parse JSON response:', parseError);
          throw new Error('Invalid response format from server');
        }
        
        if (!data) {
          throw new Error('Received empty response from server');
        }
        
        const mapped = mapDriverToProfile(data);
        console.log('✅ Successfully mapped profile data');
        setProfileData(mapped);
        
      } catch (parseError) {
        console.error('❌ Failed to process response:', parseError);
        throw new Error('Failed to process server response. Please try again.');
      }
      
    } catch (err) {
      console.error('❌ Profile fetch error:', {
        message: err.message,
        name: err.name,
        stack: err.stack,
        retryCount,
        maxRetries: MAX_RETRIES
      });
      
      // Only show error if we're not in the middle of a retry
      if (retryCount >= MAX_RETRIES) {
        const errorMessage = err.message || 'Failed to fetch profile data. Please try again later.';
        console.error('💥 Max retries reached, showing error to user:', errorMessage);
        setError(errorMessage);
      } else if (err.message.includes('token') || err.message.includes('auth') || err.message.includes('login')) {
        // Show auth-related errors immediately
        console.warn('🔐 Auth error detected, showing to user');
        setError(err.message);
      }
      
      // Re-throw the error to be caught by the retry mechanism
      if (retryCount < MAX_RETRIES) {
        throw err;
      }
    } finally {
      console.log('🏁 Fetch profile attempt completed');
      console.groupEnd();
      setIsLoading(false);
      
      // Clean up any pending timeouts
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Clean up any pending abort controllers
      if (controller) {
        controller = null;
      }
    }
  }, [])

  // Update profile data
  const updateProfile = useCallback(async (updates) => {
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
  }, [])

  // Update document status
  const updateDocumentStatus = useCallback(async (documentKey, status, uploadDate = null, expiryDate = null) => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setProfileData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentKey]: { 
            status, 
            uploadDate: uploadDate || new Date().toISOString().split('T')[0], 
            expiryDate 
          }
        }
      }))
      return { success: true }
    } catch (err) {
      setError('Failed to update document status')
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update performance stats
  const updatePerformanceStats = useCallback((stats) => {
    setProfileData(prev => ({ 
      ...prev, 
      performance: { ...prev.performance, ...stats } 
    }))
  }, [])

  // Calculate profile completion percentage
  const calculateProfileCompletion = useCallback(() => {
    const requiredFields = [
      profileData.name,
      profileData.email,
      profileData.phone,
      profileData.address,
      profileData.dateOfBirth
    ]

    const requiredDocuments = [
      'aadharCard',
      'panCard',
      'drivingLicense',
      'vehicleRC',
      'vehiclePicture'
    ]

    const verifiedDocs = requiredDocuments.filter(
      doc => profileData.documents[doc]?.status === 'verified'
    ).length

    const fieldsComplete = requiredFields.filter(
      f => f && String(f).trim() !== ''
    ).length

    const vehicleInfoComplete = Object.values(profileData.vehicle).filter(
      v => v && String(v).trim() !== ''
    ).length

    const totalPoints = requiredFields.length + 
                       requiredDocuments.length + 
                       Object.keys(profileData.vehicle).length

    const completedPoints = fieldsComplete + verifiedDocs + vehicleInfoComplete
    return Math.round((completedPoints / Math.max(totalPoints, 1)) * 100)
  }, [profileData])

  // Get urgent actions
  const getUrgentActions = useCallback(() => {
    const actions = []
    const docNames = {
      aadharCard: 'Aadhar Card',
      panCard: 'PAN Card',
      drivingLicense: 'Driving License',
      vehicleRC: 'Vehicle RC',
      vehiclePicture: 'Vehicle Picture'
    }

    Object.entries(profileData.documents).forEach(([key, doc]) => {
      if (doc.status === 'expired') {
        actions.push({
          type: 'document_expired',
          message: `${docNames[key] || key} has expired`,
          priority: 'high',
          action: `Upload renewed ${docNames[key] || key}`
        })
      }
      if (doc.status === 'pending') {
        actions.push({
          type: 'document_pending',
          message: `${docNames[key] || key} verification is pending`,
          priority: 'medium',
          action: `Wait for ${docNames[key] || key} verification`
        })
      }
    })

    const completion = calculateProfileCompletion()
    if (completion < 90) {
      actions.push({
        type: 'profile_incomplete',
        message: 'Your profile is incomplete',
        priority: 'high',
        action: 'Complete your profile'
      })
    }

    return actions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }, [profileData.documents, calculateProfileCompletion])

  // Format date helper
  const formatDate = useCallback((dateString) => {
    try {
      return dateString ? new Date(dateString).toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        timeZone: 'UTC' 
      }) : '—'
    } catch (e) {
      console.error('Error formatting date:', e)
      return '—'
    }
  }, [])

  // Check if document is expiring soon
  const isDocumentExpiringSoon = useCallback((documentKey, daysThreshold = 30) => {
    try {
      const doc = profileData.documents[documentKey]
      if (!doc?.expiryDate) return false
      const expiryDate = new Date(doc.expiryDate)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0
    } catch (e) {
      console.error('Error checking document expiry:', e)
      return false
    }
  }, [profileData.documents])

  // Effect to load profile on mount and handle retries
  useEffect(() => {
    let isMounted = true;
    let retryTimeout;
    const MAX_RETRIES = 3;
    let retryCount = 0;

    const loadProfile = async () => {
      if (!isMounted) return;
      
      try {
        await fetchProfile(retryCount);
      } catch (err) {
        if (isMounted && retryCount < MAX_RETRIES) {
          retryCount++;
          // Exponential backoff: 1s, 2s, 4s, etc.
          const delay = 1000 * Math.pow(2, retryCount - 1);
          console.log(`Retrying in ${delay}ms... (${retryCount}/${MAX_RETRIES})`);
          
          retryTimeout = setTimeout(() => {
            if (isMounted) loadProfile();
          }, delay);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [fetchProfile]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // State values
    profileData,
    isLoading,
    error,
    
    // Actions
    fetchProfile: () => fetchProfile(0), // Always start with retry count 0
    updateProfile,
    updateDocumentStatus,
    updatePerformanceStats,
    retryFetchProfile: () => fetchProfile(0), // Explicit retry function
    
    // Computed values
    profileCompletion: calculateProfileCompletion(),
    urgentActions: getUrgentActions(),
    
    // Helper functions
    formatDate,
    isDocumentExpiringSoon
  }), [
    profileData,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    updateDocumentStatus,
    updatePerformanceStats,
    calculateProfileCompletion,
    getUrgentActions,
    formatDate,
    isDocumentExpiringSoon
  ])

  // Only render the ErrorBoundary in client-side
  if (typeof window === 'undefined') {
    return (
      <ProfileContext.Provider value={contextValue}>
        {children}
      </ProfileContext.Provider>
    );
  }

  // Client-side rendering with ErrorBoundary
  return (
    <ErrorBoundary fallback={
      <div className="p-4 bg-red-50 text-red-700">
        <h3 className="font-bold">Profile Error</h3>
        <p>There was an error loading your profile data. Please try refreshing the page.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded"
        >
          Refresh Page
        </button>
      </div>
    }>
      <ProfileContext.Provider value={contextValue}>
        {children}
      </ProfileContext.Provider>
    </ErrorBoundary>
  )
}

// Custom hook to use the profile context
export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

export default ProfileContext