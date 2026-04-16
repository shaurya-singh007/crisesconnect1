import { useState } from 'react'
import { AlertTriangle, MapPin, Camera, Send, CheckCircle, Upload, Eye, EyeOff } from 'lucide-react'

const crisisTypes = [
  { value: 'Flood', emoji: '🌊' }, { value: 'Earthquake', emoji: '🏚️' }, { value: 'Cyclone', emoji: '🌀' },
  { value: 'Fire', emoji: '🔥' }, { value: 'Landslide', emoji: '⛰️' }, { value: 'Pandemic', emoji: '🦠' },
  { value: 'Drought', emoji: '☀️' }, { value: 'Structural', emoji: '🏗️' }, { value: 'Chemical', emoji: '☣️' },
  { value: 'Tsunami', emoji: '🌊' }, { value: 'Accident', emoji: '🚗' }, { value: 'Civil', emoji: '⚠️' },
]

export default function ReportCrisis() {
  const [form, setForm] = useState({ title: '', type: '', description: '', severity: '', location: '', lat: '', lng: '', needs: '', anonymous: false })
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const updateField = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        updateField('lat', pos.coords.latitude.toFixed(4))
        updateField('lng', pos.coords.longitude.toFixed(4))
      }, () => {
        updateField('lat', '28.6139')
        updateField('lng', '77.2090')
      })
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        title: form.title,
        type: form.type,
        description: form.description,
        severity: form.severity,
        location: form.location,
        lat: parseFloat(form.lat) || 28.6139,
        lng: parseFloat(form.lng) || 77.2090,
        needs: form.needs.split(',').map(n => n.trim()).filter(Boolean),
        reportedBy: form.anonymous ? 'anonymous' : 'usr-003',
        reporterName: form.anonymous ? 'Anonymous' : 'Citizen Reporter',
        affectedPeople: 0,
        volunteersNeeded: 10,
      }
      await fetch('/api/crises', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div>
        <div className="page-header"><h1>📋 Report a Crisis</h1><p>Help us understand and respond to emergencies faster</p></div>
        <div className="page-body report-page">
          <div className="report-form">
            <div className="success-message">
              <div className="success-icon"><CheckCircle size={40} /></div>
              <h2 style={{ marginBottom: 12 }}>Crisis Reported Successfully!</h2>
              <p style={{ color: '#94a3b8', marginBottom: 24 }}>Your report has been submitted and will appear on the live crisis map. Our community will help verify the report.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => { setSubmitted(false); setStep(1); setForm({ title: '', type: '', description: '', severity: '', location: '', lat: '', lng: '', needs: '', anonymous: false }) }}>Report Another</button>
                <a href="/map" className="btn btn-ghost">View on Map</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>📋 Report a Crisis</h1>
        <p>Help us understand and respond to emergencies faster</p>
      </div>
      <div className="page-body report-page">
        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div className="report-form">
          {step === 1 && (
            <div className="animate-in">
              <h3 style={{ marginBottom: 24 }}>Step 1: What happened?</h3>
              <div className="form-group">
                <label className="form-label">Crisis Title</label>
                <input className="form-input" placeholder="e.g., Flooding in Guwahati area" value={form.title} onChange={e => updateField('title', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Crisis Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                  {crisisTypes.map(t => (
                    <div key={t.value} className={`severity-option ${form.type === t.value ? 'selected critical' : ''}`} onClick={() => updateField('type', t.value)} style={{ cursor: 'pointer' }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{t.emoji}</div>
                      <div style={{ fontSize: '0.8rem' }}>{t.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Describe the situation, scale, and immediate needs..." value={form.description} onChange={e => updateField('description', e.target.value)} rows={4} />
              </div>
              <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!form.title || !form.type}>Next: Location & Severity →</button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in">
              <h3 style={{ marginBottom: 24 }}>Step 2: Location & Severity</h3>
              <div className="form-group">
                <label className="form-label">Location Name</label>
                <input className="form-input" placeholder="e.g., Kamrup District, Assam" value={form.location} onChange={e => updateField('location', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input className="form-input" placeholder="e.g., 26.1445" value={form.lat} onChange={e => updateField('lat', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input className="form-input" placeholder="e.g., 91.7362" value={form.lng} onChange={e => updateField('lng', e.target.value)} />
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLocate} style={{ marginBottom: 20 }}><MapPin size={16} /> Use My Current Location</button>
              <div className="form-group">
                <label className="form-label">Severity Level</label>
                <div className="severity-selector">
                  {['critical', 'high', 'moderate', 'low'].map(s => (
                    <div key={s} className={`severity-option ${form.severity === s ? `selected ${s}` : ''}`} onClick={() => updateField('severity', s)} style={{ cursor: 'pointer' }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{s === 'critical' ? '🔴' : s === 'high' ? '🟠' : s === 'moderate' ? '🟡' : '🟢'}</div>
                      <div style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!form.location || !form.severity}>Next: Details →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in">
              <h3 style={{ marginBottom: 24 }}>Step 3: Additional Details</h3>
              <div className="form-group">
                <label className="form-label">Immediate Needs (comma separated)</label>
                <input className="form-input" placeholder="e.g., Rescue Boats, Food Packets, Medical Aid" value={form.needs} onChange={e => updateField('needs', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Upload Photos / Evidence</label>
                <div className="file-upload">
                  <Upload size={32} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: '0.9rem' }}>Drag & drop files or click to browse</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>Supports JPG, PNG, MP4 (max 10MB)</p>
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={form.anonymous} onChange={e => updateField('anonymous', e.target.checked)} />
                  {form.anonymous ? <EyeOff size={16} /> : <Eye size={16} />}
                  Submit anonymously
                </label>
              </div>

              {/* Summary */}
              <div className="glass-card" style={{ marginBottom: 24, padding: 20 }}>
                <h4 style={{ marginBottom: 12, fontSize: '0.9rem', color: '#94a3b8' }}>📋 Report Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: '0.85rem' }}>
                  <div><strong>Title:</strong> {form.title}</div>
                  <div><strong>Type:</strong> {form.type}</div>
                  <div><strong>Location:</strong> {form.location}</div>
                  <div><strong>Severity:</strong> <span style={{ textTransform: 'capitalize' }}>{form.severity}</span></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-danger btn-lg" onClick={handleSubmit} disabled={submitting}>
                  <Send size={18} /> {submitting ? 'Submitting...' : 'Submit Crisis Report'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
