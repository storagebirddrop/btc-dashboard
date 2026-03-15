// ─── Layout atoms ─────────────────────────────────────────────────────────────

export const CARD = {
  background: '#0d0d1a',
  border: '1px solid #1a1a2e',
  borderRadius: 14,
}

// ─── Typography atoms ─────────────────────────────────────────────────────────

export const LABEL = {
  fontSize: 11,
  color: '#6b7280',
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  display: 'block',
  // No marginBottom — callers control their own spacing
}

export const TICK = { fill: '#4b5563', fontSize: 10 }

// ─── Tooltip wrapper ──────────────────────────────────────────────────────────

export const TT_WRAP = {
  background: 'rgba(6,6,16,0.98)',
  border: '1px solid #1e1e30',
  borderRadius: 10,
  padding: '12px 14px',
  fontSize: 12,
  minWidth: 180,
  boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
}

// ─── Form elements ────────────────────────────────────────────────────────────

// No margin baked in — callers add spacing via wrappers
export const INPUT_BASE = {
  boxSizing: 'border-box',
  width: '100%',
  background: '#070712',
  border: '1px solid #2a2a3a',
  borderRadius: 8,
  padding: '9px 11px',
  color: '#e5e7eb',
  fontFamily: "'DM Mono', monospace",
  fontSize: 12,
  outline: 'none',
  display: 'block',
}

export const ERR_TEXT = {
  color: '#ef4444',
  fontSize: 11,
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

// Used inside flex containers — no width override
export const BTN_PRIMARY = {
  flex: 1,
  padding: '9px',
  background: '#f59e0b',
  border: 'none',
  borderRadius: 8,
  color: '#000',
  fontWeight: 700,
  fontSize: 12,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
}

// Used inside flex containers — no width override
export const BTN_SECONDARY = {
  flex: 1,
  padding: '9px',
  background: 'transparent',
  border: '1px solid #2a2a3a',
  borderRadius: 8,
  color: '#6b7280',
  fontSize: 12,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
}

// Full-width standalone variant
export const BTN_SECONDARY_FULL = {
  ...BTN_SECONDARY,
  flex: 'unset',
  width: '100%',
}

// ─── Range slider labels ──────────────────────────────────────────────────────

export const RANGE_LABELS = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 10,
  color: '#374151',
  marginTop: 4,
}
