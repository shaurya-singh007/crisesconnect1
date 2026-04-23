import { useEffect, useState } from 'react'
import { Bell, AlertTriangle, Info, Volume2, Users, Send, MapPin, Clock, Filter, Plus, X } from 'lucide-react'

const severityIcons = { critical: <AlertTriangle size={20} />, high: <Volume2 size={20} />, moderate: <Info size={20} />, low: <Info size={20} /> }
const typeLabels = { evacuation: '🚨 Evacuation', warning: '⚠️ Warning', update: '📢 Update', info: 'ℹ️ Info', volunteer_call: '🙋 Volunteer Call', sos: '🆘 SOS' }

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [filterSeverity, setFilterSeverity] = useState('')
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', severity: 'high', type: 'warning', targetArea: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/alerts').then(r => r.json()).then(d => { setAlerts(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = filterSeverity ? alerts.filter(a => a.severity === filterSeverity) : alerts

  const handleBroadcast = async () => {
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...broadcastForm, issuedBy: 'Admin', issuedByRole: 'admin' })
    })
    const newAlert = await res.json()
    setAlerts(prev => [newAlert, ...prev])
    window.dispatchEvent(new CustomEvent('new_alert', { detail: { title: newAlert.title, message: newAlert.message, severity: newAlert.severity } }))
    setShowBroadcast(false)
    setBroadcastForm({ title: '', message: '', severity: 'high', type: 'warning', targetArea: '' })
  }

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>🔔 Alerts & Communication</h1>
            <p>Real-time crisis alerts and emergency broadcasts</p>
          </div>
          <button className="btn btn-danger" onClick={() => setShowBroadcast(!showBroadcast)}>
            <Plus size={18} /> Broadcast Alert
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <div className="stat-card red"><div className="stat-card-icon"><AlertTriangle size={22} /></div><div className="stat-card-value">{alerts.filter(a => a.severity === 'critical').length}</div><div className="stat-card-label">Critical</div></div>
          <div className="stat-card orange"><div className="stat-card-icon"><Volume2 size={22} /></div><div className="stat-card-value">{alerts.filter(a => a.severity === 'high').length}</div><div className="stat-card-label">High Priority</div></div>
          <div className="stat-card blue"><div className="stat-card-icon"><Bell size={22} /></div><div className="stat-card-value">{alerts.length}</div><div className="stat-card-label">Total Alerts</div></div>
          <div className="stat-card green"><div className="stat-card-icon"><MapPin size={22} /></div><div className="stat-card-value">{new Set(alerts.map(a => a.targetArea)).size}</div><div className="stat-card-label">Areas Covered</div></div>
        </div>

        {/* Broadcast Form */}
        {showBroadcast && (
          <div className="glass-card animate-in" style={{ marginBottom: 24 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <h3>📡 Broadcast New Alert</h3>
              <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }} onClick={() => setShowBroadcast(false)}><X size={20} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Alert Title</label>
              <input className="form-input" placeholder="e.g., URGENT: Evacuation Notice" value={broadcastForm.title} onChange={e => setBroadcastForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-textarea" placeholder="Detailed alert message..." rows={3} value={broadcastForm.message} onChange={e => setBroadcastForm(p => ({ ...p, message: e.target.value }))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select className="form-select" value={broadcastForm.severity} onChange={e => setBroadcastForm(p => ({ ...p, severity: e.target.value }))}>
                  <option value="critical">🔴 Critical</option>
                  <option value="high">🟠 High</option>
                  <option value="moderate">🟡 Moderate</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={broadcastForm.type} onChange={e => setBroadcastForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="evacuation">Evacuation</option>
                  <option value="warning">Warning</option>
                  <option value="update">Update</option>
                  <option value="info">Information</option>
                  <option value="volunteer_call">Volunteer Call</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Target Area</label>
              <input className="form-input" placeholder="e.g., Puri, Odisha" value={broadcastForm.targetArea} onChange={e => setBroadcastForm(p => ({ ...p, targetArea: e.target.value }))} />
            </div>
            <button className="btn btn-danger" onClick={handleBroadcast} disabled={!broadcastForm.title || !broadcastForm.message}>
              <Send size={18} /> Send Broadcast
            </button>
          </div>
        )}

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <Filter size={16} style={{ alignSelf: 'center', color: '#64748b' }} />
          {['', 'critical', 'high', 'moderate', 'low'].map(s => (
            <button key={s} className={`filter-chip ${filterSeverity === s ? 'active' : ''}`} onClick={() => setFilterSeverity(s)}>
              {s === '' ? 'All' : s === 'critical' ? '🔴 Critical' : s === 'high' ? '🟠 High' : s === 'moderate' ? '🟡 Moderate' : '🟢 Low'}
            </button>
          ))}
        </div>

        {/* Alert Feed */}
        {loading ? <div className="loading-spinner" /> : (
          <div className="alert-feed">
            {filtered.map((alert, i) => (
              <div key={alert.id} className={`alert-item ${alert.severity} animate-in`} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="alert-icon-box">{severityIcons[alert.severity]}</div>
                <div className="alert-content">
                  <h4>{alert.title}</h4>
                  <p>{alert.message}</p>
                  <div className="alert-meta">
                    <span>{typeLabels[alert.type] || alert.type}</span>
                    <span><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {alert.targetArea}</span>
                    <span>By: {alert.issuedBy}</span>
                    <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {timeAgo(alert.createdAt)}</span>
                  </div>
                </div>
                <span className={`badge badge-${alert.severity}`}>{alert.severity}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
