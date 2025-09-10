"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, AlertTriangle, Send, Paperclip, 
  Clock, CheckCircle, Eye, ChevronRight
} from "lucide-react"
import BottomNav from "../../../components/BottomNav"

export default function ComplaintPage() {
  const [activeTab, setActiveTab] = useState("new")
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    description: "",
    priority: "medium",
    attachments: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [existingComplaints, setExistingComplaints] = useState([
    {
      id: "CMP001234",
      subject: "Payment not credited for order #ORD001230",
      category: "Payment Issue",
      status: "in_progress",
      priority: "high",
      createdDate: "2024-01-10T10:30:00Z",
      lastUpdate: "2024-01-10T15:45:00Z",
      assignedTo: "Support Team",
      description: "My delivery payment for order #ORD001230 completed on 10th Jan has not been credited to my account."
    },
    {
      id: "CMP001223",
      subject: "App crashing during order acceptance",
      category: "Technical Issue",
      status: "resolved",
      priority: "medium",
      createdDate: "2024-01-08T14:20:00Z",
      lastUpdate: "2024-01-09T11:30:00Z",
      assignedTo: "Technical Team",
      description: "The app crashes every time I try to accept an order. This is affecting my earnings."
    },
    {
      id: "CMP001215",
      subject: "Customer behavior complaint",
      category: "Customer Issue",
      status: "closed",
      priority: "low",
      createdDate: "2024-01-05T16:45:00Z",
      lastUpdate: "2024-01-07T09:15:00Z",
      assignedTo: "Customer Relations",
      description: "Customer was rude and refused to pay the delivery charges as mentioned in the app."
    }
  ])

  const categories = [
    "Payment Issue",
    "Technical Issue", 
    "Customer Issue",
    "Account Problem",
    "Order Related",
    "App Bug",
    "Safety Concern",
    "Other"
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-warning-100 text-warning-700"
      case "in_progress":
        return "bg-brand-100 text-brand-700"
      case "resolved":
        return "bg-success-100 text-success-700"
      case "closed":
        return "bg-slate-100 text-slate-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-error-600"
      case "medium":
        return "text-warning-600"
      case "low":
        return "text-success-600"
      default:
        return "text-slate-600"
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.category || !formData.subject || !formData.description) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add new complaint to the list
      const newComplaint = {
        id: `CMP${Date.now()}`,
        subject: formData.subject,
        category: formData.category,
        status: "open",
        priority: formData.priority,
        createdDate: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        assignedTo: "Support Team",
        description: formData.description
      }
      
      setExistingComplaints(prev => [newComplaint, ...prev])
      
      // Reset form
      setFormData({
        category: "",
        subject: "",
        description: "",
        priority: "medium",
        attachments: []
      })
      
      // Switch to complaints tab
      setActiveTab("complaints")
      
      alert("Complaint submitted successfully! You will receive updates via notifications.")
      
    } catch (error) {
      alert("Failed to submit complaint. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link href="/support" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Complaints</h1>
            <p className="text-sm text-slate-600">Report issues and track resolution</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="flex px-6">
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "new"
                ? "text-brand-600 border-brand-500"
                : "text-slate-600 border-transparent hover:text-slate-800"
            }`}
          >
            New Complaint
          </button>
          <button
            onClick={() => setActiveTab("complaints")}
            className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "complaints"
                ? "text-brand-600 border-brand-500"
                : "text-slate-600 border-transparent hover:text-slate-800"
            }`}
          >
            My Complaints ({existingComplaints.length})
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* New Complaint Form */}
        {activeTab === "new" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="partner-card p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Submit New Complaint</h3>
              
              <div className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category <span className="text-error-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="partner-input"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange("priority", e.target.value)}
                    className="partner-input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Subject <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    placeholder="Brief description of your issue"
                    className="partner-input"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description <span className="text-error-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Please provide detailed information about your issue..."
                    rows={5}
                    className="partner-input resize-none"
                    required
                  />
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Attachments (Optional)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                    <Paperclip className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Attach screenshots or documents</p>
                    <p className="text-xs text-slate-500 mt-1">Max 5MB per file</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="mt-3 inline-block px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Choose Files
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setFormData({
                    category: "",
                    subject: "",
                    description: "",
                    priority: "medium",
                    attachments: []
                  })}
                  className="partner-button-secondary flex-1 py-3"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="partner-button-primary flex-1 py-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Submit Complaint</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Existing Complaints */}
        {activeTab === "complaints" && (
          <div className="space-y-4">
            {existingComplaints.length > 0 ? (
              existingComplaints.map((complaint) => (
                <div key={complaint.id} className="partner-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-slate-800">#{complaint.id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                          {complaint.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`text-xs font-semibold ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-800 mb-1">{complaint.subject}</h4>
                      <p className="text-sm text-slate-600 mb-3">{complaint.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>Category: {complaint.category}</span>
                        <span>Created: {formatDate(complaint.createdDate)}</span>
                        <span>Assigned: {complaint.assignedTo}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 ml-4" />
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>Last updated: {formatDate(complaint.lastUpdate)}</span>
                    </div>
                    <button className="text-xs text-brand-600 font-semibold hover:underline">
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No Complaints</h3>
                <p className="text-slate-500 mb-4">You haven't submitted any complaints yet.</p>
                <button
                  onClick={() => setActiveTab("new")}
                  className="partner-button-primary px-6 py-2"
                >
                  Submit First Complaint
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
