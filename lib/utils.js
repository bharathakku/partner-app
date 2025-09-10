import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = "₹") {
  return `${currency}${amount.toLocaleString('en-IN')}`
}

export function formatDate(date, options = {}) {
  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }
  
  return new Date(date).toLocaleDateString('en-IN', { ...defaultOptions, ...options })
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getGreeting() {
  const hour = new Date().getHours()
  
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export function calculateDaysPending(lastPaymentDate) {
  const today = new Date()
  const lastPayment = new Date(lastPaymentDate)
  const diffTime = Math.abs(today - lastPayment)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function calculateWeeklyEarnings(dailyEarnings) {
  return dailyEarnings.reduce((sum, earning) => sum + earning.amount, 0)
}

export function getStatusColor(status) {
  const colors = {
    online: 'bg-success-500 text-white',
    offline: 'bg-slate-200 text-slate-600',
    pending: 'bg-warning-500 text-white',
    active: 'bg-brand-500 text-white',
    inactive: 'bg-slate-400 text-white'
  }
  
  return colors[status] || colors.offline
}

export function validatePhoneNumber(phone) {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone)
}

export function formatPhoneNumber(phone) {
  if (phone.length === 10) {
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`
  }
  return phone
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
