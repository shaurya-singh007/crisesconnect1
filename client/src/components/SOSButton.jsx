import { useState } from 'react'
import { Phone, X, Send, MapPin } from 'lucide-react'

export default function SOSButton() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSOS = async () => {
    setSending(true)
    try {
      let lat = 28.6139, lng = 77.2090
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }))
          lat = pos.coords.latitude
          lng = pos.coords.longitude
        } catch(e) {}
      }
      await fetch('/api/alerts/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lat, lng })
      })
      setSent(true)
    } catch(e) {
      console.error(e)
    }
    setSending(false)
  }

  const handleClose = () => {
    setShowModal(false)
    setSent(false)
    setForm({ name: '', phone: '', message: '' })
  }

  return (
    <>
      <button className="sos-btn" onClick={() => setShowModal(true)} title="SOS Emergency">
        <Phone size={22} />
        SOS
      </button>

      {showModal && (
        <div className="sos-modal-overlay" onClick={handleClose}>
          <div className="sos-modal" onClick={e => e.stopPropagation()}>
            {sent ? (
              <div>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                <h2 style={{ color: '#22c55e' }}>SOS Sent!</h2>
                <p className="sos-sent">Your emergency signal has been sent to nearby responders with your location. Help is on the way!</p>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 20 }}>Emergency services have been notified.</p>
                <button className="btn btn-primary" onClick={handleClose}>Close</button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '3rem', marginBottom: 8 }}>🆘</div>
                <h2>Emergency SOS</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 24 }}>
                  Send an emergency signal with your location to nearby responders immediately.
                </p>
                <input
                  placeholder="Your name (optional)"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
                <input
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                />
                <textarea
                  placeholder="Describe your emergency..."
                  rows={3}
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: '0.8rem', color: '#94a3b8' }}>
                  <MapPin size={14} /> Your GPS location will be shared automatically
                </div>
                <div className="sos-modal-actions">
                  <button className="btn btn-danger btn-lg" onClick={handleSOS} disabled={sending}>
                    <Send size={18} /> {sending ? 'Sending...' : 'SEND SOS NOW'}
                  </button>
                  <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
