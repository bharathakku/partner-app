// Subscription plans and utility functions

export const SUBSCRIPTION_PLANS = {
  DAILY: {
    id: 'daily',
    name: 'Daily Plan',
    price: 49,
    currency: '₹',
    duration: 1,
    durationType: 'day',
    description: 'Perfect for occasional deliveries',
    features: [
      'Unlimited orders for 1 day',
      'Access to all delivery zones',
      'Customer support',
      'Real-time order tracking'
    ],
    color: {
      primary: 'bg-blue-600',
      secondary: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700'
    }
  },
  WEEKLY: {
    id: 'weekly',
    name: 'Weekly Plan',
    price: 299,
    currency: '₹',
    duration: 7,
    durationType: 'day',
    description: 'Most popular for regular partners',
    features: [
      'Unlimited orders for 7 days',
      'Access to all delivery zones',
      'Priority customer support',
      'Real-time order tracking',
      'Weekly performance insights'
    ],
    color: {
      primary: 'bg-green-600',
      secondary: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700'
    },
    popular: true
  },
  MONTHLY: {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 1399,
    currency: '₹',
    duration: 30,
    durationType: 'day',
    description: 'Best value for dedicated partners',
    features: [
      'Unlimited orders for 30 days',
      'Access to all delivery zones',
      'Priority customer support',
      'Real-time order tracking',
      'Monthly performance insights',
      'Exclusive bonus opportunities',
      'Advanced analytics dashboard'
    ],
    color: {
      primary: 'bg-purple-600',
      secondary: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700'
    },
    bestValue: true
  }
}

export const getPlansArray = () => {
  return Object.values(SUBSCRIPTION_PLANS)
}

export const getPlanById = (planId) => {
  return getPlansArray().find(plan => plan.id === planId)
}

export const calculateExpiryDate = (startDate, plan) => {
  const start = new Date(startDate)
  const expiry = new Date(start)
  expiry.setDate(start.getDate() + plan.duration)
  return expiry
}

export const getDaysRemaining = (expiryDate) => {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

export const isSubscriptionActive = (expiryDate) => {
  return getDaysRemaining(expiryDate) > 0
}

export const formatSubscriptionDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export const getSubscriptionStatus = (subscription) => {
  if (!subscription || !subscription.expiryDate) {
    return { status: 'inactive', message: 'No active subscription' }
  }

  const daysRemaining = getDaysRemaining(subscription.expiryDate)
  
  if (daysRemaining <= 0) {
    return { status: 'expired', message: 'Subscription expired' }
  } else if (daysRemaining <= 3) {
    return { status: 'expiring', message: `Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}` }
  } else {
    return { status: 'active', message: `${daysRemaining} days remaining` }
  }
}

// Default subscription state
export const getDefaultSubscriptionState = () => ({
  currentPlan: null,
  activationDate: null,
  expiryDate: null,
  upcomingPlan: null,
  upcomingActivationDate: null,
  autoRenewal: false,
  subscriptionHistory: []
})

// Demo/local storage helpers (used until real payment backend is wired)
export const STORAGE_KEY = 'partnerSubscription'

export const formatSubscriptionDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getStoredSubscription = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const setStoredSubscription = (sub) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sub))
  } catch {}
}

export const clearStoredSubscription = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
