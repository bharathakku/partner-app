"use client"

import { useState } from "react"
import Link from "next/link"
import { useProfile } from "../contexts/ProfileContext"
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, 
  Shield, FileText, CheckCircle, AlertCircle, XCircle, Clock,
  Car, Star, TrendingUp, Target, Award, Edit2, Camera,
  CreditCard, Building, Users, Activity, Settings
} from "lucide-react"

export default function ProfilePage() {
  const { profileData, isLoading, error, formatDate, urgentActions } = useProfile()
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(false)

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const getDocumentStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "expired":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getDocumentStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-50 text-green-700 border-green-200"
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "expired":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }


  const TabButton = ({ tab, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === tab
          ? "bg-brand-500 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 pb-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/settings" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isEditing
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-brand-100 text-brand-700 hover:bg-brand-200"
            }`}
          >
            <Edit2 className="w-4 h-4" />
            <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white hover:bg-brand-600 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-800">{profileData.name}</h2>
                {profileData.account.partnerType === "Premium" && (
                  <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Premium Partner
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="font-semibold text-amber-600">{profileData.rating}</span>
                  <span className="text-sm text-slate-600">({profileData.totalRatings} ratings)</span>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{profileData.account.accountStatus}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-slate-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(profileData.joinedDate)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>ID: {profileData.account.partnerId}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#e2e8f0"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - profileData.profileComplete / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-600">{profileData.profileComplete}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-1">Profile Complete</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          <TabButton tab="personal" label="Personal" icon={User} />
          <TabButton tab="documents" label="Documents" icon={FileText} />
          <TabButton tab="vehicle" label="Vehicle" icon={Car} />
          <TabButton tab="performance" label="Performance" icon={TrendingUp} />
          <TabButton tab="account" label="Account" icon={Settings} />
        </div>

        {/* Tab Content */}
        {activeTab === "personal" && (
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-brand-600" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Email Address</label>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-800">{profileData.email}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Primary Phone</label>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-800">{profileData.phone}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Alternate Phone</label>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-800">{profileData.alternatePhone}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Date of Birth</label>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-800">{formatDate(profileData.dateOfBirth)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="text-sm font-medium text-slate-700 block mb-2">Address</label>
                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                  <span className="text-slate-800">{profileData.address}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-brand-600" />
                Document Verification Status
              </h3>
              
              <div className="space-y-4">
                {[
                  { key: "aadharCard", label: "Aadhar Card", required: true },
                  { key: "panCard", label: "PAN Card", required: true },
                  { key: "drivingLicense", label: "Driving License", required: true },
                  { key: "vehicleRC", label: "Vehicle RC", required: true },
                  { key: "insurance", label: "Vehicle Insurance", required: true },
                  { key: "pollution", label: "Pollution Certificate", required: false }
                ].map((doc) => {
                  const docData = profileData.documents[doc.key]
                  return (
                    <div key={doc.key} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getDocumentStatusIcon(docData.status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-slate-800">{doc.label}</p>
                            {doc.required && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Required</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                            <span>Uploaded: {formatDate(docData.uploadDate)}</span>
                            {docData.expiryDate && (
                              <span>Expires: {formatDate(docData.expiryDate)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getDocumentStatusColor(docData.status)}`}>
                        {docData.status.charAt(0).toUpperCase() + docData.status.slice(1)}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Action Required</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Your vehicle insurance has expired. Please upload a renewed insurance document to continue receiving orders.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "vehicle" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2 text-brand-600" />
                Vehicle Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Vehicle Type</label>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-800">{profileData.vehicle.type}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Brand & Model</label>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-800">{profileData.vehicle.brand} {profileData.vehicle.model}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Registration Number</label>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-800 font-mono">{profileData.vehicle.registrationNumber}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Color</label>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-800">{profileData.vehicle.color}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Year of Manufacture</label>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-800">{profileData.vehicle.yearOfManufacture}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-brand-600" />
                Performance Statistics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-700">{profileData.performance.totalOrders}</span>
                  </div>
                  <p className="text-sm font-medium text-blue-800">Total Orders</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-700">{profileData.performance.completionRate}%</span>
                  </div>
                  <p className="text-sm font-medium text-green-800">Completion Rate</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-700">{profileData.performance.onTimeDeliveryRate}%</span>
                  </div>
                  <p className="text-sm font-medium text-purple-800">On-Time Delivery</p>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    <span className="text-2xl font-bold text-amber-700">{profileData.performance.avgDeliveryTime}</span>
                  </div>
                  <p className="text-sm font-medium text-amber-800">Avg Delivery Time</p>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <span className="text-2xl font-bold text-emerald-700">{profileData.performance.totalEarnings}</span>
                  </div>
                  <p className="text-sm font-medium text-emerald-800">Total Earnings</p>
                </div>
                
                <div className="bg-gradient-to-r from-rose-50 to-rose-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 text-rose-600" />
                    <span className="text-2xl font-bold text-rose-700">{profileData.performance.thisMonthEarnings}</span>
                  </div>
                  <p className="text-sm font-medium text-rose-800">This Month</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-brand-600" />
                Account Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Partner ID</label>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-800 font-mono">{profileData.account.partnerId}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Partner Type</label>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-800">{profileData.account.partnerType}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Account Status</label>
                  <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 font-medium">{profileData.account.accountStatus}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">KYC Status</label>
                  <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 font-medium">{profileData.account.kycStatus}</span>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 block mb-2">Training Status</label>
                  <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 font-medium">{profileData.account.trainingStatus}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
