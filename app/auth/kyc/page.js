"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, FileText, Camera, Upload, Loader2, AlertCircle, CheckCircle, Car, IndianRupee, Package, Shirt } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "../../../lib/utils"
import { 
  VEHICLE_TYPES, 
  getVehicleTypesArray, 
  getVehicleTypeById, 
  validateVehicleNumber, 
  formatVehicleNumber
} from "../../../lib/registration"

export default function KYCVerification() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    aadharNumber: "",
    panNumber: "",
    drivingLicense: "",
    vehicleNumber: "",
    vehicleType: "ace_pickup"
  })
  const [documents, setDocuments] = useState({
    aadhar: null,
    pan: null,
    drivingLicense: null,
    vehicleRC: null,
    vehiclePicture: null
  })
  const [vehicleTypes] = useState(getVehicleTypesArray())
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    
    if (!formData.aadharNumber.replace(/\s/g, "")) {
      newErrors.aadharNumber = "Aadhar number is required"
    } else if (formData.aadharNumber.replace(/\s/g, "").length !== 12) {
      newErrors.aadharNumber = "Aadhar number must be 12 digits"
    }
    
    if (!formData.panNumber.trim()) {
      newErrors.panNumber = "PAN number is required"
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
      newErrors.panNumber = "Please enter a valid PAN number"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    
    if (!formData.drivingLicense.trim()) {
      newErrors.drivingLicense = "Driving license number is required"
    }
    
    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = "Vehicle number is required"
    } else if (!validateVehicleNumber(formData.vehicleNumber)) {
      newErrors.vehicleNumber = "Please enter a valid vehicle number (e.g., KA05AB1234)"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const validateStep3 = () => {
    const newErrors = {}
    
    const requiredDocs = ['aadhar', 'pan', 'drivingLicense', 'vehicleRC', 'vehiclePicture']
    requiredDocs.forEach(doc => {
      if (!documents[doc]) {
        newErrors[doc] = `${doc === 'vehiclePicture' ? 'Vehicle picture' : doc} is required`
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleAadharChange = (value) => {
    const cleanValue = value.replace(/\D/g, "")
    if (cleanValue.length <= 12) {
      const formattedValue = cleanValue.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3")
      handleInputChange("aadharNumber", formattedValue)
    }
  }

  const handleFileUpload = (docType, event) => {
    const file = event.target.files[0]
    if (file) {
      setDocuments(prev => ({ ...prev, [docType]: file }))
    }
  }

  const handleVehicleNumberChange = (value) => {
    const formattedValue = formatVehicleNumber(value)
    handleInputChange("vehicleNumber", formattedValue)
  }

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    } else if (currentStep === 3 && validateStep3()) {
      handleRegistrationCompletion() // Go directly to completion
    }
  }

  const handleRegistrationCompletion = async () => {
    setIsLoading(true)
    
    try {
      // Simulate quick processing for free registration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Store registration data
      const registrationData = {
        ...formData,
        documents,
        registrationFee: {
          amount: 0,
          paid: true,
          paymentId: 'NO_FEE_REQUIRED'
        },
        registrationDate: new Date().toISOString()
      }
      
      localStorage.setItem('partner_registration', JSON.stringify(registrationData))
      
      // Navigate to activation pending
      router.push("/auth/activation-pending")
    } catch (err) {
      setErrors({ submit: "Failed to complete registration. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 mb-8">
        <Link href="/auth/verify-otp" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <h1 className="text-lg font-semibold text-slate-800">KYC Verification</h1>
        <div className="w-10"></div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step <= currentStep 
                ? "bg-brand-500 text-white" 
                : "bg-slate-200 text-slate-500"
            }`}>
              {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
            {step < 5 && (
              <div className={`w-12 h-1 mx-2 ${
                step < currentStep ? "bg-brand-500" : "bg-slate-200"
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-brand-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Personal Information</h2>
              <p className="text-slate-600">Please provide your basic details</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="partner-input"
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <div className="mt-1 flex items-center space-x-2 text-error-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.fullName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="partner-input"
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <div className="mt-1 flex items-center space-x-2 text-error-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Aadhar Number</label>
                <input
                  type="text"
                  value={formData.aadharNumber}
                  onChange={(e) => handleAadharChange(e.target.value)}
                  className="partner-input text-center font-mono tracking-wider"
                  placeholder="0000 0000 0000"
                  maxLength="14"
                />
                {errors.aadharNumber && (
                  <div className="mt-1 flex items-center space-x-2 text-error-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.aadharNumber}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">PAN Number</label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange("panNumber", e.target.value.toUpperCase())}
                  className="partner-input text-center font-mono tracking-wider"
                  placeholder="ABCDE1234F"
                  maxLength="10"
                />
                {errors.panNumber && (
                  <div className="mt-1 flex items-center space-x-2 text-error-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.panNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="partner-button-primary w-full py-4 text-base font-semibold mt-8"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Vehicle Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-brand-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Vehicle Information</h2>
              <p className="text-slate-600">Provide your vehicle and license details</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {vehicleTypes.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => handleInputChange("vehicleType", vehicle.id)}
                      className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.vehicleType === vehicle.id
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{vehicle.icon}</div>
                        <div className="text-sm font-semibold text-slate-800">{vehicle.name}</div>
                        <div className="text-xs text-slate-600">{vehicle.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Driving License Number</label>
                <input
                  type="text"
                  value={formData.drivingLicense}
                  onChange={(e) => handleInputChange("drivingLicense", e.target.value.toUpperCase())}
                  className="partner-input font-mono tracking-wide"
                  placeholder="Enter license number"
                />
                {errors.drivingLicense && (
                  <div className="mt-1 flex items-center space-x-2 text-error-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.drivingLicense}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Registration Number</label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => handleVehicleNumberChange(e.target.value)}
                  className="partner-input text-center font-mono tracking-wider"
                  placeholder="KA 05 AB 1234"
                  maxLength="13"
                />
                <div className="mt-1 text-xs text-slate-500">
                  Enter your vehicle number as shown on RC (e.g., KA05AB1234)
                </div>
                {errors.vehicleNumber && (
                  <div className="mt-1 flex items-center space-x-2 text-error-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.vehicleNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setCurrentStep(1)}
                className="partner-button-secondary flex-1 py-4 text-base font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="partner-button-primary flex-1 py-4 text-base font-semibold"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Document Upload */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-brand-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Upload Documents</h2>
              <p className="text-slate-600">Please upload clear photos of your documents</p>
            </div>

            <div className="space-y-4">
              {[
                { key: "aadhar", label: "Aadhar Card", required: true },
                { key: "pan", label: "PAN Card", required: true },
                { key: "drivingLicense", label: "Driving License", required: true },
                { key: "vehicleRC", label: "Vehicle RC", required: true },
                { key: "vehiclePicture", label: "Vehicle Picture", required: true }
              ].map((doc) => (
                <div key={doc.key} className="border-2 border-dashed border-slate-300 rounded-xl p-4">
                  <label className="block cursor-pointer">
                    <div className="text-center">
                      {documents[doc.key] ? (
                        <div className="flex items-center justify-center space-x-2 text-success-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">{documents[doc.key].name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-slate-700">{doc.label}</p>
                          <p className="text-xs text-slate-500">Tap to upload</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(doc.key, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              ))}
            </div>

            {errors.submit && (
              <div className="flex items-center space-x-2 text-error-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.submit}</span>
              </div>
            )}

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                className="partner-button-secondary flex-1 py-4 text-base font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={Object.keys(documents).some(key => !documents[key]) || isLoading}
                className="partner-button-primary flex-1 py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Completing...</span>
                  </div>
                ) : (
                  'Complete Free Registration'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
