import { useState, useEffect, useRef } from 'react'
import { classifyAddress } from '../utils.js'

export default function DonationModal({ lightning, onClose }) {
  const [copied,     setCopied]     = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  const copy = async () => {
    const finish = (ok) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (ok) { setCopied(true);     timeoutRef.current = setTimeout(() => setCopied(false),     2000) }
      else    { setCopyFailed(true); timeoutRef.current = setTimeout(() => setCopyFailed(false), 3000) }
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(lightning)
      } else {
        const el = document.createElement('textarea')
        el.value = lightning
        el.style.cssText = 'position:fixed;opacity:0'
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      finish(true)
    } catch {
      finish(false)
    }
  }

  const type      = classifyAddress(lightning)
  const typeLabel = type === 'lightning'   ? 'Lightning Address'
                  : type === 'bolt12offer' ? 'BOLT12 Offer'
                  : null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d0d1a',
          border: '1px solid #2a2a3a',
          borderRadius: 18,
          padding: '32px 28px',
          maxWidth: 460,
          width: '100%',
          boxShadow: '0 0 60px rgba(129,140,248,0.12)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: '#818cf8', marginBottom: 4 }}>
              ⚡ Support this Dashboard
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Lightning donations accepted</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: '#1a1a2e', border: 'none', color: '#6b7280',
              cursor: 'pointer', width: 32, height: 32, borderRadius: 8,
              fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>

        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg,#818cf822,#4f46e522)',
            border: '2px solid #818cf844',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32,
          }}>⚡</div>
        </div>

        {/* Address block */}
        <div style={{
          background: '#070712',
          border: '1px solid #818cf833',
          borderRadius: 12,
          padding: 16,
          marginBottom: 14,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 600, letterSpacing: '0.05em' }}>
              ⚡ Lightning / BOLT12
            </span>
            {typeLabel && (
              <span style={{
                fontSize: 9,
                background: '#818cf822', border: '1px solid #818cf844',
                borderRadius: 99, padding: '2px 7px', color: '#818cf8',
              }}>{typeLabel}</span>
            )}
          </div>

          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            color: '#c4b5fd',
            wordBreak: 'break-all',
            lineHeight: 1.8,
            marginBottom: 12,
            userSelect: 'text',
          }}>
            {lightning}
          </div>

          <button
            onClick={copy}
            style={{
              width: '100%', padding: '10px',
              background:  copied ? '#10b98122' : copyFailed ? '#ef444422' : '#818cf822',
              border: `1px solid ${copied ? '#10b981' : copyFailed ? '#ef4444' : '#818cf855'}`,
              borderRadius: 8,
              color: copied ? '#10b981' : copyFailed ? '#ef4444' : '#818cf8',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600, fontSize: 12,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {copied ? '✓ Copied' : copyFailed ? '⚠ Copy failed — select manually above' : 'Copy Address'}
          </button>
        </div>

        <p style={{ fontSize: 11, color: '#374151', textAlign: 'center' }}>
          Compatible with Phoenix, Mutiny, Zeus, and any BOLT12 wallet
        </p>
      </div>
    </div>
  )
}
