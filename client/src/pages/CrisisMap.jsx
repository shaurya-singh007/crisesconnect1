import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Search, Filter, MapPin, Users as UsersIcon, AlertTriangle, CheckCircle } from 'lucide-react'

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const severityColors = { critical: '#ef4444', high: '#f97316', moderate: '#eab308', low: '#22c55e', resolved: '#22c55e' }
const typeEmojis = { Flood: '🌊', Earthquake: '🏚️', Cyclone: '🌀', Fire: '🔥', Landslide: '⛰️', Pandemic: '🦠', Drought: '☀️', Structural: '🏗️', Chemical: '☣️', Tsunami: '🌊', Weather: '🌡️', Accident: '🚗', Civil: '⚠️' }

function createCrisisIcon(severity, type) {
  const color = severityColors[severity] || '#3b82f6'
  const emoji = typeEmojis[type] || '⚠️'
  return L.divIcon({
    className: '',
    html: `<div style="
      width:38px;height:38px;border-radius:50%;
      background:${color};border:3px solid ${color};
      display:flex;align-items:center;justify-content:center;
      font-size:16px;box-shadow:0 0 15px ${color}80;
      position:relative;
    ">
      ${emoji}
      ${severity === 'critical' ? `<div style="position:absolute;width:100%;height:100%;border-radius:50%;background:${color}40;animation:markerPulse 2s ease-in-out infinite;"></div>` : ''}
    </div>
    <style>@keyframes markerPulse{0%{transform:scale(1);opacity:1}100%{transform:scale(2.5);opacity:0}}</style>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  })
}

function FlyToCenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 10, { duration: 1.5 })
  }, [center])
  return null
}

const crisisTypes = ['All', 'Flood', 'Earthquake', 'Cyclone', 'Fire', 'Landslide', 'Pandemic', 'Drought', 'Structural', 'Chemical', 'Tsunami', 'Weather', 'Civil', 'Accident']

export default function CrisisMap() {
  const [crises, setCrises] = useState([])
  const [filtered, setFiltered] = useState([])
  const [selectedType, setSelectedType] = useState('All')
  const [search, setSearch] = useState('')
  const [flyTo, setFlyTo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/crises')
      .then(r => r.json())
      .then(d => { setCrises(d); setFiltered(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let f = crises
    if (selectedType !== 'All') f = f.filter(c => c.type === selectedType)
    if (search) f = f.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase()))
    setFiltered(f)
  }, [selectedType, search, crises])

  const handleVerify = (id) => {
    fetch(`/api/crises/${id}/verify`, { method: 'POST' })
      .then(r => r.json())
      .then(updated => {
        setCrises(prev => prev.map(c => c.id === id ? updated : c))
      })
  }

  return (
    <div className="map-page">
      <div className="map-container">
        <MapContainer center={[22.5, 82]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={true} attributionControl={false}>
          <TileLayer
            className="google-map-tiles"
            url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={['mt0','mt1','mt2','mt3']}
          />
          {flyTo && <FlyToCenter center={flyTo} zoom={10} />}
          {filtered.map(crisis => (
            <Marker key={crisis.id} position={[crisis.lat, crisis.lng]} icon={createCrisisIcon(crisis.severity, crisis.type)}>
              <Popup maxWidth={300}>
                <div className="crisis-popup">
                  <h3>{typeEmojis[crisis.type]} {crisis.title}</h3>
                  <div className="popup-meta">
                    <span>📍 {crisis.location}</span> • <span style={{ color: severityColors[crisis.severity], fontWeight: 700, textTransform: 'uppercase' }}>{crisis.severity}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#555', marginBottom: 8 }}>{crisis.description}</p>
                  <div className="popup-needs">
                    {(crisis.needs || []).slice(0, 4).map((n, i) => <span key={i} className="popup-need-tag">{n}</span>)}
                  </div>
                  <div className="popup-stats">
                    <span>👥 {crisis.affectedPeople?.toLocaleString()} affected</span>
                    <span>🙋 {crisis.volunteersAssigned}/{crisis.volunteersNeeded} volunteers</span>
                  </div>
                  <div className="popup-stats" style={{ marginTop: 6 }}>
                    <span>✅ {crisis.verifiedCount} verified</span>
                    <span>❌ {crisis.disputeCount} disputed</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="map-sidebar">
        <h2><Filter size={18} /> Filter Crises</h2>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
          <input className="form-input" placeholder="Search crises..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div className="filter-group">
          {crisisTypes.map(t => (
            <button key={t} className={`filter-chip ${selectedType === t ? 'active' : ''}`} onClick={() => setSelectedType(t)}>
              {t !== 'All' && typeEmojis[t]} {t}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 8 }}>{filtered.length} crises found</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
          {filtered.map(c => (
            <div key={c.id} className="crisis-list-item" onClick={() => setFlyTo([c.lat, c.lng])}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <h4>{typeEmojis[c.type]} {c.title}</h4>
                <span className={`badge badge-${c.severity}`}>{c.severity}</span>
              </div>
              <div className="meta">
                <span><MapPin size={12} /> {c.location}</span>
                <span><UsersIcon size={12} /> {c.volunteersAssigned}/{c.volunteersNeeded}</span>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button className="btn btn-sm btn-success" onClick={e => { e.stopPropagation(); handleVerify(c.id) }}>
                  <CheckCircle size={14} /> Verify ({c.verifiedCount})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
