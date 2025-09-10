"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowLeft, Send, Paperclip, MoreVertical, 
  Phone, Video, User, Circle
} from "lucide-react"

export default function LiveChat() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "received",
      content: "Hello! I'm Sarah from Partner Support. How can I help you today?",
      timestamp: new Date(Date.now() - 300000),
      agent: {
        name: "Sarah",
        avatar: "S",
        status: "online"
      }
    },
    {
      id: 2,
      type: "sent",
      content: "Hi, I have a question about my payment dues. Can you help me understand the daily charges?",
      timestamp: new Date(Date.now() - 240000)
    },
    {
      id: 3,
      type: "received",
      content: "Of course! I'd be happy to explain the daily charges. Our platform charges ₹30 per active day. This helps cover the technology, support, and services we provide to our partners.",
      timestamp: new Date(Date.now() - 180000),
      agent: {
        name: "Sarah",
        avatar: "S",
        status: "online"
      }
    },
    {
      id: 4,
      type: "received",
      content: "You can pay these charges weekly or settle them anytime within 30 days. Would you like me to show you how to make a payment?",
      timestamp: new Date(Date.now() - 120000),
      agent: {
        name: "Sarah",
        avatar: "S",
        status: "online"
      }
    },
    {
      id: 5,
      type: "sent",
      content: "Yes, that would be helpful. Also, can you tell me about the weekend bonuses?",
      timestamp: new Date(Date.now() - 60000)
    }
  ])
  
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = () => {
    if (message.trim() === "") return
    
    const newMessage = {
      id: messages.length + 1,
      type: "sent",
      content: message,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    setMessage("")
    setIsTyping(true)
    
    // Simulate agent response
    setTimeout(() => {
      setIsTyping(false)
      const agentResponse = {
        id: messages.length + 2,
        type: "received",
        content: getAgentResponse(message),
        timestamp: new Date(),
        agent: {
          name: "Sarah",
          avatar: "S",
          status: "online"
        }
      }
      setMessages(prev => [...prev, agentResponse])
    }, 2000)
  }

  const getAgentResponse = (userMessage) => {
    const responses = [
      "Great question! Let me help you with that. Weekend bonuses are special incentives for partners who work during weekends. You can earn up to ₹500 extra by completing 15 deliveries over the weekend.",
      "I understand your concern. Let me look into your account and provide you with specific details.",
      "That's a common question among our partners. I'll send you a detailed explanation right after this chat.",
      "Thank you for asking! I'm here to help you maximize your earnings and make the most of our platform.",
      "Is there anything else I can help you with today? I'm here to ensure you have the best experience as our partner."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/support" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">S</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Sarah</h3>
                <div className="flex items-center space-x-1">
                  <Circle className="w-2 h-2 text-success-500 fill-current" />
                  <span className="text-xs text-success-600">Online • Support Agent</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${msg.type === 'sent' ? 'order-2' : 'order-1'}`}>
              {msg.type === 'received' && (
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">{msg.agent.avatar}</span>
                  </div>
                  <span className="text-xs text-slate-500">{msg.agent.name}</span>
                </div>
              )}
              
              <div
                className={`px-4 py-3 rounded-2xl ${
                  msg.type === 'sent'
                    ? 'bg-brand-500 text-white ml-auto'
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
              
              <div className={`mt-1 text-xs text-slate-500 ${
                msg.type === 'sent' ? 'text-right' : 'text-left'
              }`}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-xs">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">S</span>
                </div>
                <span className="text-xs text-slate-500">Sarah</span>
              </div>
              
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="flex items-end space-x-3">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              style={{
                minHeight: '48px',
                maxHeight: '120px',
                overflowY: 'auto'
              }}
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={message.trim() === ""}
            className="p-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span>Press Enter to send</span>
          <span>Sarah is online</span>
        </div>
      </div>
    </div>
  )
}
