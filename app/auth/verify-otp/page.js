"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { formatPhoneNumber } from "../../../lib/utils"

export default function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [phone, setPhone] = useState("")
  const inputRefs = useRef([])
  const router = useRouter()

  useEffect(() => {
    // Get phone number from localStorage
    const storedPhone = localStorage.getItem("partner_phone")
    if (!storedPhone) {
      router.push("/auth/phone")
      return
    }
    setPhone(storedPhone)

    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleInputChange = (index, value) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (value && newOtp.every(digit => digit)) {
      handleVerify(newOtp.join(""))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (otpCode = otp.join("")) => {
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo purposes, accept any 6-digit code
      if (otpCode.length === 6) {
        // Check if user exists (simulate)
        const isExistingUser = Math.random() > 0.7 // 30% chance of being new user
        
        if (isExistingUser) {
          // Existing user - check activation status
          const isActivated = Math.random() > 0.5 // 50% chance of being activated
          
          if (isActivated) {
            localStorage.setItem("partner_authenticated", "true")
            router.push("/dashboard")
          } else {
            router.push("/auth/activation-pending")
          }
        } else {
          // New user - go to KYC
          router.push("/auth/kyc")
        }
      } else {
        setError("Invalid verification code")
      }
    } catch (err) {
      setError("Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset timer
      setResendTimer(30)
      setCanResend(false)
      
      // Clear current OTP
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
      
      // Start countdown
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (err) {
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 mb-8">
        <Link href="/auth/phone" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <h1 className="text-lg font-semibold text-slate-800">Verify Code</h1>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Enter Verification Code
          </h2>
          <p className="text-slate-600 leading-relaxed mb-2">
            We've sent a 6-digit code to
          </p>
          <p className="text-brand-600 font-semibold text-lg">
            +91 {formatPhoneNumber(phone)}
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4 text-center">
              Verification Code
            </label>
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
                  autoComplete="off"
                />
              ))}
            </div>
            {error && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-error-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.some(digit => !digit)}
            className="partner-button-primary w-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify Code"
            )}
          </button>
        </form>

        {/* Resend Code */}
        <div className="text-center mt-8">
          {canResend ? (
            <button
              onClick={handleResendOTP}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 text-brand-600 hover:text-brand-700 font-semibold transition-colors mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Resend Code</span>
            </button>
          ) : (
            <p className="text-slate-600">
              Resend code in{" "}
              <span className="font-semibold text-brand-600">{resendTimer}s</span>
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-8">
        <p className="text-xs text-slate-500">
          Didn't receive the code?{" "}
          <Link href="/support" className="text-brand-600 underline">
            Get Help
          </Link>
        </p>
      </div>
    </div>
  )
}
