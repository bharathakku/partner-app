"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowLeft, Send, Paperclip, MoreVertical, 
  Phone, Video, User, Circle
} from "lucide-react"
import { connectSocket, joinChatThread, onChatMessage, emitChatMessage } from "@/lib/socket"

export default function LiveChat() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [threadId, setThreadId] = useState(null)
  const messagesEndRef = useRef(null)

  // Init: connect socket, resolve user id and threadId, load history, subscribe
  useEffect(() => {
    const sock = connectSocket()
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null
    let uid = null
    try { uid = raw ? (JSON.parse(raw)?.id || JSON.parse(raw)?._id) : null } catch {}
    if (!uid) return
    const tid = `admin:${uid}`
    setThreadId(tid)
    joinChatThread(tid)

    // Load history
    const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001/api'
    const apiBase = rawBase.endsWith('/api') ? rawBase : rawBase.replace(/\/$/, '') + '/api'
    const token = (typeof window !== 'undefined') ? localStorage.getItem('auth_token') : null
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {}
    fetch(`${apiBase}/chat/threads/${tid}/messages`, { credentials: 'include', headers: { ...authHeader } })
      .then(r => r.json())
      .then(items => {
        const mapped = (items || []).map(m => ({
          id: m._id,
          type: m.fromUserId === uid ? 'sent' : 'received',
          content: m.text,
          timestamp: new Date(m.createdAt),
        }))
        setMessages(mapped)
        scrollToBottom()
      }).catch(() => {})

    // Subscribe
    const off = onChatMessage((msg) => {
      if (msg.threadId !== tid) return
      setMessages(prev => {
        const exists = prev.some(m => (m._id || m.id) === (msg._id || msg.id))
        if (exists) return prev
        return [
          ...prev,
          {
            _id: msg._id,
            id: msg._id || `${Date.now()}`,
            type: msg.fromUserId === uid ? 'sent' : 'received',
            content: msg.text,
            timestamp: new Date(msg.createdAt || Date.now()),
          }
        ]
      })
      scrollToBottom()
    })
    return () => { off && off() }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => { scrollToBottom() }, [messages])

  const sendMessage = async () => {
    if (!message.trim() || !threadId) return
    const text = message
    setMessage("")
    // Persist
    try {
      const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001/api'
      const apiBase = rawBase.endsWith('/api') ? rawBase : rawBase.replace(/\/$/, '') + '/api'
      const token = (typeof window !== 'undefined') ? localStorage.getItem('auth_token') : null
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`${apiBase}/chat/threads/${threadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        credentials: 'include',
        body: JSON.stringify({ text })
      })
      // Rely on backend socket broadcast; no local append
      await res.json()
    } catch {}
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
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
        {messages.map((msg, idx) => (
          <div
            key={(msg._id || msg.id || idx) + '-' + (msg.timestamp?.toString?.() || '')}
            className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${msg.type === 'sent' ? 'order-2' : 'order-1'}`}>
              {msg.type === 'received' && (
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">S</span>
                  </div>
                  <span className="text-xs text-slate-500">Support</span>
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
          <span>Support is online</span>
        </div>
      </div>
    </div>
  )
}
