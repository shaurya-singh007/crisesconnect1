import { useState } from 'react'
import { AlertTriangle, MapPin, Camera, Send, CheckCircle, Upload, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const crisisTypes = [
  { value: 'Flood', emoji: '🌊' }, { value: 'Earthquake', emoji: '🏚️' }, { value: 'Cyclone', emoji: '🌀' },
  { value: 'Fire', emoji: '🔥' }, { value: 'Landslide', emoji: '⛰️' }, { value: 'Pandemic', emoji: '🦠' },
  { value: 'Drought', emoji: '☀️' }, { value: 'Structural', emoji: '🏗️' }, { value: 'Chemical', emoji: '☣️' },
  { value: 'Tsunami', emoji: '🌊' }, { value: 'Accident', emoji: '🚗' }, { value: 'Civil', emoji: '⚠️' },
]

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  type: z.string().min(1, 'Please select a crisis type'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(3, 'Location is required'),
  lat: z.string().min(1, 'Latitude is required'),
  lng: z.string().min(1, 'Longitude is required'),
  severity: z.enum(['critical', 'high', 'moderate', 'low'], { errorMap: () => ({ message: 'Please select severity' }) }),
  needs: z.string().optional(),
  anonymous: z.boolean().default(false)
})

export default function ReportCrisis() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: '', type: '', description: '', severity: '', location: '', lat: '', lng: '', needs: '', anonymous: false }
  })

  const formValues = watch()

  const handleLocate = () => {
    if (navigator.geolocation) {
      toast.loading('Detecting location...', { id: 'location' })
      navigator.geolocation.getCurrentPosition(pos => {
        setValue('lat', pos.coords.latitude.toFixed(4), { shouldValidate: true })
        setValue('lng', pos.coords.longitude.toFixed(4), { shouldValidate: true })
        toast.success('Location detected!', { id: 'location' })
      }, () => {
        setValue('lat', '28.6139', { shouldValidate: true })
        setValue('lng', '77.2090', { shouldValidate: true })
        toast.error('Could not get exact location, using default.', { id: 'location' })
      })
    }
  }

  const handleNextStep1 = async () => {
    const isValid = await trigger(['title', 'type', 'description'])
    if (isValid) setStep(2)
  }

  const handleNextStep2 = async () => {
    const isValid = await trigger(['location', 'lat', 'lng', 'severity'])
    if (isValid) setStep(3)
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    const loadToast = toast.loading('Submitting crisis report...')
    try {
      const payload = {
        title: data.title,
        type: data.type,
        description: data.description,
        severity: data.severity,
        location: data.location,
        lat: parseFloat(data.lat) || 28.6139,
        lng: parseFloat(data.lng) || 77.2090,
        needs: data.needs ? data.needs.split(',').map(n => n.trim()).filter(Boolean) : [],
        reportedBy: data.anonymous ? 'anonymous' : 'usr-003',
        reporterName: data.anonymous ? 'Anonymous' : 'Citizen Reporter',
        affectedPeople: 0,
        volunteersNeeded: 10,
      }
      await fetch('/api/crises', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      setSubmitted(true)
      toast.success('Crisis reported successfully!', { id: loadToast })
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit report', { id: loadToast })
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
                <button className="btn btn-primary" onClick={() => { setSubmitted(false); setStep(1); }}>Report Another</button>
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
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? 'linear-gradient(135deg, var(--primary), var(--info))' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
          ))}
        </div>

        <form className="report-form" onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="animate-in">
              <h3 style={{ marginBottom: 24 }}>Step 1: What happened?</h3>
              <div className="form-group">
                <label className="form-label">Crisis Title</label>
                <input className="form-input" placeholder="e.g., Flooding in Guwahati area" {...register('title')} />
                {errors.title && <span className="error-msg">{errors.title.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Crisis Type</label>
                <div className="crisis-type-grid">
                  {crisisTypes.map(t => (
                    <div key={t.value} className={`crisis-type-btn ${formValues.type === t.value ? 'active' : ''}`} onClick={() => setValue('type', t.value, { shouldValidate: true })}>
                      <div className="type-icon">{t.emoji}</div>
                      <div className="type-label">{t.value}</div>
                    </div>
                  ))}
                </div>
                {errors.type && <span className="error-msg">{errors.type.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Describe the situation, scale, and immediate needs..." {...register('description')} rows={4} />
                {errors.description && <span className="error-msg">{errors.description.message}</span>}
              </div>
              <button type="button" className="btn btn-primary" onClick={handleNextStep1}>Next: Location & Severity →</button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in">
              <h3 style={{ marginBottom: 24 }}>Step 2: Location & Severity</h3>
              <div className="form-group">
                <label className="form-label">Location Name</label>
                <input className="form-input" placeholder="e.g., Kamrup District, Assam" {...register('location')} />
                {errors.location && <span className="error-msg">{errors.location.message}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input className="form-input" placeholder="e.g., 26.1445" {...register('lat')} />
                  {errors.lat && <span className="error-msg">{errors.lat.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input className="form-input" placeholder="e.g., 91.7362" {...register('lng')} />
                  {errors.lng && <span className="error-msg">{errors.lng.message}</span>}
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLocate} style={{ marginBottom: 20 }}><MapPin size={16} /> Use My Current Location</button>
              <div className="form-group">
                <label className="form-label">Severity Level</label>
                <div className="severity-selector">
                  {['critical', 'high', 'moderate', 'low'].map(s => (
                    <div key={s} className={`severity-option ${formValues.severity === s ? `selected ${s}` : ''}`} onClick={() => setValue('severity', s, { shouldValidate: true })} style={{ cursor: 'pointer' }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{s === 'critical' ? '🔴' : s === 'high' ? '🟠' : s === 'moderate' ? '🟡' : '🟢'}</div>
                      <div style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>{s}</div>
                    </div>
                  ))}
                </div>
                {errors.severity && <span className="error-msg">{errors.severity.message}</span>}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button type="button" className="btn btn-primary" onClick={handleNextStep2}>Next: Details →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in">
              <h3 style={{ marginBottom: 24 }}>Step 3: Additional Details</h3>
              <div className="form-group">
                <label className="form-label">Immediate Needs (comma separated)</label>
                <input className="form-input" placeholder="e.g., Rescue Boats, Food Packets, Medical Aid" {...register('needs')} />
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
                  <input type="checkbox" {...register('anonymous')} />
                  {formValues.anonymous ? <EyeOff size={16} /> : <Eye size={16} />}
                  Submit anonymously
                </label>
              </div>

              {/* Summary */}
              <div className="glass-card" style={{ marginBottom: 24, padding: 20 }}>
                <h4 style={{ marginBottom: 12, fontSize: '0.9rem', color: '#94a3b8' }}>📋 Report Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: '0.85rem' }}>
                  <div><strong>Title:</strong> {formValues.title}</div>
                  <div><strong>Type:</strong> {formValues.type}</div>
                  <div><strong>Location:</strong> {formValues.location}</div>
                  <div><strong>Severity:</strong> <span style={{ textTransform: 'capitalize' }}>{formValues.severity}</span></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button type="submit" className="btn btn-danger btn-lg" disabled={submitting}>
                  <Send size={18} /> {submitting ? 'Submitting...' : 'Submit Crisis Report'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
