import { CARD } from '../styles.js'

export default function DonationSettings({ lightning }) {
  if (!lightning) return null

  return (
    <div style={{ ...CARD, padding: '20px 22px' }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: '#e5e7eb', marginBottom: 14 }}>
        ⚡ Lightning Donation
      </div>
      <div style={{ fontSize: 10, color: '#818cf8', fontWeight: 600, marginBottom: 6 }}>⚡ Address</div>
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#6b7280',
        wordBreak: 'break-all', background: '#070712',
        padding: '8px 10px', borderRadius: 7, border: '1px solid #1a1a2e',
      }}>
        {lightning}
      </div>
    </div>
  )
}
