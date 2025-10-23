"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, IndianRupee, Shield, Clock, Crown, Calendar } from "lucide-react"
import BottomNav from "../../../../components/BottomNav"
import { formatCurrency } from "../../../../lib/utils"
import { getPlanById, getStoredSubscription, formatSubscriptionDateTime } from "../../../../lib/subscription"
import { apiClient, API_BASE_URL } from "../../../../lib/api/apiClient"

function SubscriptionPayContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get("planId")
  const amountParam = searchParams.get("amount")
  
  const plan = useMemo(() => {
    return getPlanById(planId)
  }, [planId])
  
  const amount = useMemo(() => {
    const v = Math.max(10, Math.floor(Number(amountParam) || 0))
    return v
  }, [amountParam])

  // Razorpay handles method selection inside its modal; we keep UI minimal
  const [loading, setLoading] = useState(false)
  
  // Calculate subscription period (renew starts after existing expiry if still active)
  const existing = getStoredSubscription()
  const baseStart = useMemo(() => {
    const now = new Date()
    if (!existing?.expiryDate) return now
    const existingExpiry = new Date(existing.expiryDate)
    return existingExpiry > now ? existingExpiry : now
  }, [existing])
  const activationDate = baseStart
  const expiryDate = null

  // Load Razorpay script once with better error handling
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      console.log('Razorpay already loaded')
      setRazorpayLoaded(true)
      return
    }
    
    // Check if script is already being loaded
    if (document.getElementById('rzp-checkout')) {
      console.log('Razorpay script already loading')
      return
    }
    
    console.log('Loading Razorpay script...')
    const s = document.createElement('script')
    s.id = 'rzp-checkout'
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    
    s.onload = () => {
      console.log('Razorpay script loaded successfully')
      setRazorpayLoaded(true)
    }
    
    s.onerror = (error) => {
      console.error('Failed to load Razorpay script:', error)
      alert('Failed to load payment processor. Please refresh the page and try again.')
    }
    
    document.body.appendChild(s)
    
    return () => {
      try { 
        const script = document.getElementById('rzp-checkout')
        if (script) document.body.removeChild(script)
      } catch (e) {
        console.error('Error cleaning up Razorpay script:', e)
      }
    }
  }, [])

  const handleProceed = async () => {
    if (!plan) {
      console.error('No plan selected')
      return
    }
    
    if (!razorpayLoaded) {
      console.error('Razorpay not loaded yet')
      alert('Payment system is still initializing. Please wait a moment and try again.')
      return
    }
    
    if (!window.Razorpay) {
      console.error('Razorpay is not available')
      alert('Payment processor not available. Please refresh the page and try again.')
      return
    }
    
    setLoading(true)
    try {
      console.log('Creating Razorpay order for plan:', plan.id)
      
      // 1) Create a Razorpay order on backend
      console.log('Sending request to create order...', { planId: plan.id })
      
      let response;
      try {
        console.log('Sending request to create order for plan:', plan.id);
        response = await apiClient.post('/payments/razorpay/order', { planId: plan.id });
        console.log('Order creation response:', response);
        
        // Handle the nested response structure
        if (!response || !response.data || !response.data.order) {
          console.error('Invalid response structure:', response);
          throw new Error('Invalid response from payment server');
        }
        
        // Extract the order and keyId from the response
        const { order, keyId } = response.data;
        
        if (!order || !order.id) {
          throw new Error('Invalid order data received from server');
        }
        
        // Update the response to match expected format
        response.data = {
          order: order,
          keyId: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        };
      } catch (error) {
        console.error('Error creating order:', error);
        const errorData = error.response?.data || error.data || {};
        const errorMessage = errorData.error || 'Failed to create payment order';
        const errorDetails = errorData.details || errorData.message || 'Unknown error occurred';
        
        console.error('Error creating order:', {
          message: error.message,
          status: error.response?.status,
          code: errorData.code,
          details: errorDetails,
          response: error.response?.data,
          headers: error.response?.headers
        });
        
        // Construct a more detailed error message
        let userFriendlyError = errorMessage;
        if (errorDetails && errorDetails !== errorMessage) {
          userFriendlyError += `: ${errorDetails}`;
        }
        
        // Add specific guidance for common error codes
        if (errorData.code === 'BAD_REQUEST_ERROR') {
          userFriendlyError += ' Please check the payment details and try again.';
        } else if (error.response?.status === 500) {
          userFriendlyError += ' The server encountered an error. Please try again later.';
        } else if (!navigator.onLine) {
          userFriendlyError = 'No internet connection. Please check your network and try again.';
        }
        
        throw new Error(userFriendlyError);
      }
      
      console.log('Full response from server:', response);
      
      const order = response.data.order;
      const keyId = response.data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      
      if (!order || !order.id) {
        console.error('Order creation failed - missing order data:', {
          response: response,
          data: response?.data,
          status: response?.status
        });
        throw new Error('Failed to create payment order: Missing order ID');
      }
      
      if (!order || !order.id) {
        console.error('Invalid order data in response:', { order });
        throw new Error('Invalid order data received from server');
      }
      
      console.log('Order created successfully:', { 
        orderId: order.id, 
        amount: order.amount,
        currency: order.currency
      });

      // 2) Open Razorpay Checkout
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user_data') || 'null') : null
      
      if (!keyId && !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        throw new Error('Razorpay key ID is not configured');
      }
            
      // For test mode, use the test key and enable test mode
      const isTestMode = process.env.NODE_ENV === 'development' || 
                         (keyId && keyId.startsWith('rzp_test_')) ||
                         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_test_');
      
      console.log('Razorpay Mode:', isTestMode ? 'TEST MODE' : 'LIVE MODE');
      
      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'YourDelivery Partner',
        description: `${plan.name} subscription`,
        order_id: order.id,
        theme: {
          color: '#4F46E5',
        },
        // Enable test mode if using test credentials
        ...(isTestMode && {
          notes: {
            internalTestNote: 'This is a test transaction',
          },
          handler: async function (response) {
            console.log('Test payment successful:', response);
            try {
              // Verify the payment with your backend
              const verify = await apiClient.post('/payments/razorpay/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id,
              });

              if (verify?.data?.success) {
                // Show success message and redirect
                alert('Payment successful! Your subscription is now active.');
                router.push('/dashboard/subscription?payment=success');
              } else {
                throw new Error(verify?.data?.error || 'Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              alert(`Payment verification failed: ${error.message}`);
            }
          },
        }),
        theme: { 
          color: '#4F46E5',
        },
        prefill: {
          name: user?.name || 'Partner',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        modal: { 
          ondismiss: function() {
            console.log('Payment modal dismissed')
            setLoading(false)
          } 
        },
        handler: async function (response) {
          try {
            console.log('Payment successful:', response)
            // Verify signature and activate subscription
            const verify = await apiClient.post('/payments/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
            })
            
            if (verify?.error) {
              throw new Error(verify.error)
            }
            
            alert('Payment successful! Your subscription is now active.')
            router.push('/dashboard/subscription')
          } catch (error) {
            console.error('Payment verification failed:', error)
            alert('Payment verification failed. Please contact support with your payment ID: ' + (response.razorpay_payment_id || 'unknown'))
          } finally {
            setLoading(false)
          }
        }
      }
      console.log('Opening Razorpay checkout...', options)
      try {
        const rzp = new window.Razorpay(options)
        rzp.open()
      } catch (e) {
        console.error('Failed to open Razorpay:', e)
        throw new Error('Failed to open payment window. Please try again.')
      }
    } catch (e) {
      alert(e?.message || 'Payment failed to start')
    } finally {
      setLoading(false)
    }
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
        <div className="p-6">
          <div className="text-center py-8">
            <p className="text-slate-600">Invalid subscription plan</p>
            <button 
              onClick={() => router.back()}
              className="mt-4 bg-brand-600 text-white px-6 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Subscribe to Plan</h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Subscription Plan Details */}
        <div className="partner-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
              <p className="text-sm text-slate-600">{plan.description}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-600">Subscription Amount</span>
              <span className="text-2xl font-bold text-brand-700">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-600">Duration</span>
              <span className="font-semibold text-slate-800">{plan.duration} {plan.duration === 1 ? 'day' : 'days'}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-600">Activation Date</span>
              <span className="font-semibold text-slate-800">{formatSubscriptionDateTime(activationDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Payment Gateway</span>
              <span className="font-semibold text-slate-800">Razorpay</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-success-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">What's Included:</span>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              {plan.features.slice(0, 4).map((feature, idx) => (
                <li key={idx}>• {feature}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment via Razorpay */}
        <div className="partner-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Secure Payment</h3>
          <p className="text-sm text-slate-600 mb-4">You will pay using Razorpay. UPI and Cards are available inside the Razorpay popup.</p>

          <button
            onClick={handleProceed}
            disabled={loading || !razorpayLoaded}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-colors ${
              loading || !razorpayLoaded
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {!razorpayLoaded ? 'Loading payment...' : loading ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
          </button>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> You will be redirected back to Subscription after payment.
          </p>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Your subscription will be activated immediately after successful payment. 
              You can start accepting orders right away!
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse"></div>
          <h1 className="text-xl font-bold text-slate-800">Subscribe to Plan</h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Plan Details Loading */}
        <div className="partner-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
            <div>
              <div className="w-32 h-5 bg-slate-200 rounded animate-pulse mb-2"></div>
              <div className="w-48 h-4 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="bg-slate-100 rounded-lg p-4 mb-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="w-24 h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="w-16 h-6 bg-slate-200 rounded animate-pulse"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="w-20 h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="w-12 h-4 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Methods Loading */}
        <div className="partner-card p-6">
          <div className="w-48 h-6 bg-slate-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="w-full h-12 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="w-full h-12 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="w-24 h-4 bg-slate-200 rounded animate-pulse"></div>
            <div className="w-full h-10 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default function SubscriptionPayPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SubscriptionPayContent />
    </Suspense>
  )
}
