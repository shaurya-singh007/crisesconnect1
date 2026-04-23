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
  const isCritical = severity === 'critical'
  const isHigh = severity === 'high'
  const pulseSpeed = isCritical ? '1.2s' : isHigh ? '2s' : '2.8s'
  return L.divIcon({
    className: 'crisis-marker-wrapper',
    html: `
    <div class="crisis-marker-root" style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
      <div class="crisis-marker-ring" style="
        position:absolute;width:100%;height:100%;border-radius:50%;
        border:2px solid ${color};
        animation:radarPing ${pulseSpeed} cubic-bezier(0,0,0.2,1) infinite;
        opacity:0;
      "></div>
      ${isCritical ? `<div class="crisis-marker-ring" style="
        position:absolute;width:100%;height:100%;border-radius:50%;
        border:2px solid ${color};
        animation:radarPing ${pulseSpeed} cubic-bezier(0,0,0.2,1) infinite 0.6s;
        opacity:0;
      "></div>` : ''}
      <div style="
        width:36px;height:36px;border-radius:50%;
        background:radial-gradient(circle at 35% 35%, ${color}ee, ${color}aa);
        border:2px solid ${color};
        display:flex;align-items:center;justify-content:center;
        font-size:15px;
        box-shadow:0 0 18px ${color}90, inset 0 -2px 6px rgba(0,0,0,0.3);
        position:relative;z-index:2;
      ">
        ${emoji}
      </div>
      <div style="
        position:absolute;width:10px;height:10px;border-radius:50%;
        background:${color};filter:blur(4px);
        bottom:-2px;opacity:0.5;z-index:1;
      "></div>
    </div>
    <style>
      @keyframes radarPing{
        0%{transform:scale(1);opacity:0.8;border-width:2px;}
        100%{transform:scale(2.8);opacity:0;border-width:0.5px;}
      }
      .crisis-marker-wrapper{background:none !important;border:none !important;}
    </style>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
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
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
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
