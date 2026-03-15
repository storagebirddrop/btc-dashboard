import { CARD } from '../styles.js'

export default function Section({ title, sub, children }) {
  return (
    <div style={{ ...CARD, padding: '22px 24px', marginBottom: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 15,
          fontWeight: 700,
          color: '#e5e7eb',
          margin: 0,
        }}>
          {title}
        </h2>
        {sub && (
          <p style={{ fontSize: 11, color: '#4b5563', marginTop: 4 }}>{sub}</p>
        )}
      </div>
      {children}
    </div>
  )
}
