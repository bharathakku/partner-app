'use client'

import { useEffect, useRef } from 'react'

export default function OTPInput({ length = 6, onComplete = () => {}, disabled = false }) {
  const inputsRef = useRef([])

  useEffect(() => {
    if (inputsRef.current[0]) inputsRef.current[0].focus()
  }, [])

  const handleChange = (idx, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 1)
    e.target.value = val
    if (val && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus()
    }
    const code = inputsRef.current.map((el) => el?.value || '').join('')
    if (code.length === length) onComplete(code)
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !e.target.value && idx > 0) {
      inputsRef.current[idx - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputsRef.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < length - 1) inputsRef.current[idx + 1]?.focus()
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          ref={(el) => (inputsRef.current[i] = el)}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          style={{ width: 40, height: 48, textAlign: 'center', fontSize: 18, border: '1px solid #ccc', borderRadius: 6 }}
        />
      ))}
    </div>
  )
}
