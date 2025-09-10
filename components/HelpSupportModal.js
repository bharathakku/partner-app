'use client'

import { useState } from 'react'
import { 
  X, HelpCircle, MessageSquare, Phone, AlertTriangle, 
  MapPin, Package, CreditCard, Clock, CheckCircle, 
  Send, Headphones, Camera, Paperclip
} from 'lucide-react'
import CameraCapture from './CameraCapture'

export default function HelpSupportModal({ isOpen, onClose, currentOrderId = null }) {
  const [activeTab, setActiveTab] = useState('problems')
  const [selectedProblem, setSelectedProblem] = useState('')
  const [customComplaint, setCustomComplaint] = useState('')
  const [complaintSubmitted, setComplaintSubmitted] = useState(false)
  const [submittingComplaint, setSubmittingComplaint] = useState(false)
  const [attachedImages, setAttachedImages] = useState([])

  const commonProblems = [
    {
      id: 'pickup-location',
      icon: MapPin,
      title: 'Unable to find pickup location',
      description: 'GPS is not accurate or address is unclear',
      solution: 'Call the sender using the contact number provided. Use landmark details for better navigation.',
      detailedSteps: [
        '1. First, try refreshing your GPS location in the app',
        '2. Call the sender/restaurant using the provided contact number',
        '3. Ask for specific landmarks or building details',
        '4. Use Google Maps as a backup navigation option',
        '5. If still unable to locate, inform the customer about potential delay',
        '6. Contact support if the address seems completely incorrect'
      ],
      tips: [
        'Always verify the complete address before starting your journey',
        'Screenshot the location from the app before leaving',
        'Keep your phone charged and GPS enabled throughout the trip'
      ]
    },
    {
      id: 'delivery-location',
      icon: MapPin,
      title: 'Unable to find delivery location',
      description: 'Customer address is unclear or GPS not working',
      solution: 'Call the customer directly. Ask for nearby landmarks or building details.',
      detailedSteps: [
        '1. Call the customer immediately upon reaching the general area',
        '2. Ask for specific building name, gate number, or landmark',
        '3. Request the customer to come to the main road if possible',
        '4. Use the customer\'s live location sharing if they can provide it',
        '5. Take a photo of the area and send it to customer for confirmation',
        '6. If customer is unavailable, wait for 10 minutes before contacting support'
      ],
      tips: [
        'Always call when you\'re 2-3 minutes away from the location',
        'Ask customers to enable location sharing for faster delivery',
        'Politely request customers to wait near the main entrance'
      ]
    },
    {
      id: 'customer-not-responding',
      icon: Phone,
      title: 'Customer not responding to calls',
      description: 'Customer phone is switched off or not answering',
      solution: 'Try calling multiple times. If still no response, contact support for guidance.',
      detailedSteps: [
        '1. Call the customer 3 times with 2-minute intervals',
        '2. Send a message through the app if available',
        '3. Wait at the delivery location for 10-15 minutes',
        '4. Try calling one more time after the waiting period',
        '5. Take a photo of the location as proof of attempted delivery',
        '6. Contact support to report non-responsive customer',
        '7. Follow support instructions for package return or safe placement'
      ],
      tips: [
        'Always document your attempts to contact the customer',
        'Be patient - customers might be in meetings or busy',
        'Never leave packages unattended without customer consent'
      ]
    },
    {
      id: 'package-damaged',
      icon: Package,
      title: 'Package appears damaged',
      description: 'Package is torn, wet, or visibly damaged',
      solution: 'Take photos immediately. Contact support before proceeding with delivery.',
      detailedSteps: [
        '1. Stop immediately and do not continue with delivery',
        '2. Take clear photos of the damage from multiple angles',
        '3. Take a photo of the package label/order ID',
        '4. Contact support immediately with photos',
        '5. Inform the customer about the damage and apologize',
        '6. Follow support instructions - usually return to sender',
        '7. Fill out incident report if required by support'
      ],
      tips: [
        'Handle packages carefully to prevent damage during transport',
        'Check package condition during pickup before leaving',
        'Use delivery bags to protect packages from weather'
      ]
    },
    {
      id: 'payment-issue',
      icon: CreditCard,
      title: 'Payment collection issues',
      description: 'Customer refuses to pay for COD orders',
      solution: 'Explain the order details politely. Contact support if customer still refuses.',
      detailedSteps: [
        '1. Politely show the customer the order details and amount',
        '2. Explain that payment was selected as Cash on Delivery',
        '3. Check if they have the correct change or can pay digitally',
        '4. If they claim they already paid online, ask them to show proof',
        '5. Give them 5-10 minutes to arrange payment',
        '6. If still refusing, contact support immediately',
        '7. Do not hand over the package without payment confirmation'
      ],
      tips: [
        'Always carry change for small denominations',
        'Accept UPI/digital payments as alternatives',
        'Remain calm and professional throughout the interaction'
      ]
    },
    {
      id: 'app-technical',
      icon: AlertTriangle,
      title: 'App technical issues',
      description: 'App is slow, freezing, or showing errors',
      solution: 'Force close and restart the app. Check your internet connection.',
      detailedSteps: [
        '1. Close the app completely (not just minimize)',
        '2. Check your internet connection (try opening a website)',
        '3. Switch between WiFi and mobile data if possible',
        '4. Restart the app and wait for it to fully load',
        '5. If still not working, restart your phone',
        '6. Clear app cache if the problem persists',
        '7. Contact support if technical issues continue'
      ],
      tips: [
        'Keep your app updated to the latest version',
        'Maintain a stable internet connection throughout deliveries',
        'Keep your phone charged above 20% at all times'
      ]
    },
    {
      id: 'vehicle-breakdown',
      icon: AlertTriangle,
      title: 'Vehicle breakdown',
      description: 'Bike/vehicle has broken down during delivery',
      solution: 'Contact support immediately. Do not abandon the package.',
      detailedSteps: [
        '1. Move to a safe location immediately',
        '2. Contact support first to inform about the breakdown',
        '3. Call the customer to inform about the delay',
        '4. Try to arrange alternative transport (auto/taxi) if feasible',
        '5. Keep the package secure with you at all times',
        '6. Follow support instructions for package handling',
        '7. Submit breakdown report with photos if required'
      ],
      tips: [
        'Keep emergency contact numbers handy',
        'Regular vehicle maintenance prevents most breakdowns',
        'Always carry basic tools and a spare key'
      ]
    },
    {
      id: 'wrong-package',
      icon: Package,
      title: 'Wrong package picked up',
      description: 'Realized the package details don\'t match',
      solution: 'Return to pickup location immediately. Verify package details with sender.',
      detailedSteps: [
        '1. Stop and check the order details carefully',
        '2. Compare package label with app order information',
        '3. Return to pickup location immediately',
        '4. Explain the situation to the sender/restaurant staff',
        '5. Exchange for the correct package after verification',
        '6. Double-check new package details before leaving',
        '7. Inform customer about slight delay due to package correction'
      ],
      tips: [
        'Always verify order details and package before leaving pickup location',
        'Check customer name, order ID, and items if visible',
        'Ask pickup staff to confirm the order before taking package'
      ]
    }
  ]

  const handleProblemSelect = (problemId) => {
    setSelectedProblem(problemId)
    setActiveTab('solution')
  }

  const handleImageCaptured = (file, images) => {
    console.log('Screenshot captured for complaint:', file.name)
    setAttachedImages(images)
  }

  const handleImageUploaded = (result, images) => {
    console.log('Screenshot uploaded for complaint:', result)
    setAttachedImages(images)
  }

  const handleSubmitComplaint = async () => {
    if (!customComplaint.trim() && !selectedProblem) {
      alert('Please describe your issue or select a common problem')
      return
    }

    setSubmittingComplaint(true)

    // Simulate API call (would include attachedImages in real implementation)
    await new Promise(resolve => setTimeout(resolve, 2000))

    setComplaintSubmitted(true)
    setSubmittingComplaint(false)

    // Auto close after 5 seconds
    setTimeout(() => {
      setComplaintSubmitted(false)
      setCustomComplaint('')
      setSelectedProblem('')
      setAttachedImages([])
      setActiveTab('problems')
      onClose()
    }, 5000)
  }

  const selectedProblemData = commonProblems.find(p => p.id === selectedProblem)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Help & Support</h2>
                <p className="text-sm opacity-90">We're here to help you!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {currentOrderId && (
            <div className="mt-3 p-3 bg-white/10 rounded-lg">
              <p className="text-sm">
                <span className="opacity-75">Current Order:</span> <span className="font-semibold">{currentOrderId}</span>
              </p>
            </div>
          )}
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {complaintSubmitted ? (
            // Success State
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Complaint Submitted!</h3>
              <p className="text-gray-600 mb-4">
                Your complaint has been successfully submitted. Our support agent will contact you within <strong>10 minutes</strong>.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-1">
                  <Headphones className="w-4 h-4" />
                  <span>What to expect:</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• You'll receive a call from our support team</li>
                  <li>• Agent will help resolve your issue quickly</li>
                  <li>• Keep your phone nearby and available</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('problems')}
                  className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'problems' 
                      ? 'border-blue-500 text-blue-600 bg-blue-50' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Common Issues
                </button>
                <button
                  onClick={() => setActiveTab('complaint')}
                  className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'complaint' 
                      ? 'border-blue-500 text-blue-600 bg-blue-50' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Raise Complaint
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {activeTab === 'problems' && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4">
                      Select a common problem to see the solution, or raise a complaint for immediate assistance.
                    </p>
                    
                    {commonProblems.map((problem) => {
                      const IconComponent = problem.icon
                      return (
                        <button
                          key={problem.id}
                          onClick={() => handleProblemSelect(problem.id)}
                          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <IconComponent className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 group-hover:text-blue-900">
                                {problem.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {problem.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {activeTab === 'solution' && selectedProblemData && (
                  <div className="space-y-4">
                    <button
                      onClick={() => setActiveTab('problems')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ← Back to problems
                    </button>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <selectedProblemData.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900 mb-2">
                            {selectedProblemData.title}
                          </h3>
                          <p className="text-sm text-blue-800">
                            {selectedProblemData.description}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 mb-3">
                        <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Quick Solution:
                        </h4>
                        <p className="text-sm text-green-700">
                          {selectedProblemData.solution}
                        </p>
                      </div>

                      {selectedProblemData.detailedSteps && (
                        <div className="bg-white rounded-lg p-3 mb-3">
                          <h4 className="font-medium text-indigo-800 mb-2">Detailed Steps:</h4>
                          <div className="space-y-1">
                            {selectedProblemData.detailedSteps.map((step, index) => (
                              <p key={index} className="text-sm text-indigo-700 leading-relaxed">
                                {step}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedProblemData.tips && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <h4 className="font-medium text-yellow-800 mb-2">💡 Pro Tips:</h4>
                          <div className="space-y-1">
                            {selectedProblemData.tips.map((tip, index) => (
                              <p key={index} className="text-sm text-yellow-700">
                                • {tip}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab('complaint')}
                        className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Still Need Help? Contact Support
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'complaint' && (
                  <div className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-900 mb-1">Quick Response Guarantee</h4>
                          <p className="text-sm text-orange-700">
                            Our support agent will contact you within <strong>10 minutes</strong> of submitting your complaint.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe your issue:
                      </label>
                      <textarea
                        value={customComplaint}
                        onChange={(e) => setCustomComplaint(e.target.value)}
                        placeholder="Please describe the problem you're facing in detail..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Screenshot Attachment */}
                    <CameraCapture
                      label="Attach Screenshots (Optional)"
                      description="Add screenshots to help us understand your issue better"
                      required={false}
                      multiple={true}
                      maxImages={3}
                      onImageCaptured={handleImageCaptured}
                      onImageUploaded={handleImageUploaded}
                      className="border border-gray-200 rounded-lg p-4"
                    />

                    {currentOrderId && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Order ID:</span> {currentOrderId}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          This will be shared with our support team
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleSubmitComplaint}
                      disabled={submittingComplaint || (!customComplaint.trim() && !selectedProblem)}
                      className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {submittingComplaint ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Complaint
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      By submitting, you agree that our support team can contact you regarding this issue.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
