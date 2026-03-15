import { useState, useEffect, useRef } from 'react'
import { CURRENCIES } from '../hooks/useLiveBTC.js'

export default function CurrencySelector({ selected, setSelected }) {
  const [open, setOpen]   = useState(false)
  const containerRef      = useRef(null)
  const cur               = CURRENCIES.find(c => c.code === selected)

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    const handleEsc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown',   handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown',   handleEsc)
    }
  }, [open])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          background: '#0d0d1a',
          border: '1px solid #2a2a3a',
          borderRadius: 9,
          padding: '8px 12px',
          color: '#e5e7eb',
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
        }}
      >
        <span>{cur?.flag}</span>
        <span style={{ fontFamily: "'DM Mono', monospace" }}>{cur?.label}</span>
        <span style={{ color: '#4b5563', fontSize: 10 }}>{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: '#0d0d1a',
            border: '1px solid #2a2a3a',
            borderRadius: 10,
            padding: '6px',
            zIndex: 50,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            minWidth: 220,
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
          }}
        >
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              role="option"
              aria-selected={c.code === selected}
              onClick={() => { setSelected(c.code); setOpen(false) }}
              style={{
                background: c.code === selected ? '#f59e0b18' : 'transparent',
                border: `1px solid ${c.code === selected ? '#f59e0b44' : 'transparent'}`,
                borderRadius: 7,
                padding: '7px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                color: c.code === selected ? '#f59e0b' : '#9ca3af',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                textAlign: 'left',
              }}
            >
              <span>{c.flag}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{c.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
