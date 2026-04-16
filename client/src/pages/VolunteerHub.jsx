import { useEffect, useState } from 'react'
import { Users, UserPlus, MapPin, CheckCircle, Clock, Star, Search, Briefcase, Zap } from 'lucide-react'

const allSkills = ['Medical', 'First Aid', 'Surgery', 'Nursing', 'Logistics', 'Driving', 'Warehousing', 'Tech', 'Communication', 'Drones', 'Counseling', 'Teaching', 'Engineering', 'Heavy Machinery', 'Construction', 'Cooking', 'Food Distribution', 'Firefighting', 'Rescue', 'Swimming', 'Navigation', 'Boating', 'Translation', 'Social Work', 'Electrical', 'Photography', 'Data Analysis', 'Pharmacy', 'Social Media']
const avatarColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4']

export default function VolunteerHub() {
  const [volunteers, setVolunteers] = useState([])
  const [tab, setTab] = useState('volunteers')
  const [search, setSearch] = useState('')
  const [filterSkill, setFilterSkill] = useState('')
  const [showRegister, setShowRegister] = useState(false)
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', location: '', skills: [] })
  const [crises, setCrises] = useState([])
  const [matchResults, setMatchResults] = useState(null)

  useEffect(() => {
    fetch('/api/volunteers').then(r => r.json()).then(setVolunteers).catch(() => {})
    fetch('/api/crises?status=active').then(r => r.json()).then(setCrises).catch(() => {})
  }, [])

  const filtered = volunteers.filter(v => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.location?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterSkill && !v.skills.some(s => s.toLowerCase().includes(filterSkill.toLowerCase()))) return false
    return true
  })

  const handleRegister = async () => {
    const res = await fetch('/api/volunteers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regForm)
    })
    const newVol = await res.json()
    setVolunteers(prev => [...prev, newVol])
    setShowRegister(false)
    setRegForm({ name: '', email: '', phone: '', location: '', skills: [] })
  }

  const handleMatch = async (crisisId) => {
    const res = await fetch('/api/volunteers/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crisisId })
    })
    const data = await res.json()
    setMatchResults(data)
  }

  const toggleSkill = (skill) => {
    setRegForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>👥 Volunteer & Resource Hub</h1>
            <p>Connect your skills with crisis needs — every hand counts</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowRegister(!showRegister)}>
            <UserPlus size={18} /> Register as Volunteer
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-card-icon"><Users size={24} /></div>
            <div className="stat-card-value">{volunteers.length}</div>
            <div className="stat-card-label">Total Volunteers</div>
          </div>
          <div className="stat-card green">
            <div className="stat-card-icon"><CheckCircle size={24} /></div>
            <div className="stat-card-value">{volunteers.filter(v => v.available && !v.currentTask).length}</div>
            <div className="stat-card-label">Available Now</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-card-icon"><Briefcase size={24} /></div>
            <div className="stat-card-value">{volunteers.filter(v => v.currentTask).length}</div>
            <div className="stat-card-label">On Mission</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-card-icon"><Star size={24} /></div>
            <div className="stat-card-value">{volunteers.reduce((s, v) => s + (v.tasksCompleted || 0), 0)}</div>
            <div className="stat-card-label">Tasks Completed</div>
          </div>
        </div>

        {/* Registration Form */}
        {showRegister && (
          <div className="glass-card animate-in" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 20 }}>🙋 Volunteer Registration</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Your name" value={regForm.name} onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" placeholder="email@example.com" value={regForm.email} onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+91-XXXXXXXXXX" value={regForm.phone} onChange={e => setRegForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" placeholder="City, State" value={regForm.location} onChange={e => setRegForm(p => ({ ...p, location: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Select Your Skills</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allSkills.map(s => (
                  <span key={s} className={`skill-tag ${regForm.skills.includes(s) ? 'selected' : ''}`} onClick={() => toggleSkill(s)}>{s}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={handleRegister} disabled={!regForm.name || !regForm.skills.length}>
                <CheckCircle size={18} /> Register
              </button>
              <button className="btn btn-ghost" onClick={() => setShowRegister(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === 'volunteers' ? 'active' : ''}`} onClick={() => setTab('volunteers')}>👥 Volunteers ({volunteers.length})</button>
          <button className={`tab ${tab === 'matching' ? 'active' : ''}`} onClick={() => setTab('matching')}>⚡ Skill Matching</button>
          <button className={`tab ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>📋 Open Tasks</button>
        </div>

        {tab === 'volunteers' && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
                <input className="form-input" placeholder="Search volunteers..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
              </div>
              <select className="form-select" style={{ width: 180 }} value={filterSkill} onChange={e => setFilterSkill(e.target.value)}>
                <option value="">All Skills</option>
                {allSkills.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="volunteer-grid">
              {filtered.map((v, i) => (
                <div key={v.id} className="volunteer-card animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="vol-header">
                    <div className="vol-avatar" style={{ background: avatarColors[i % avatarColors.length] }}>{v.name.charAt(0)}</div>
                    <div>
                      <div className="vol-name">{v.name}</div>
                      <div className="vol-location"><MapPin size={12} /> {v.location}</div>
                    </div>
                    <span className={`badge ${v.available && !v.currentTask ? 'badge-resolved' : 'badge-high'}`} style={{ marginLeft: 'auto' }}>
                      {v.available && !v.currentTask ? 'Available' : 'On Task'}
                    </span>
                  </div>
                  <div className="vol-skills">
                    {v.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                  </div>
                  <div className="vol-stats">
                    <span><strong>{v.tasksCompleted}</strong> completed</span>
                    {v.currentTask && <span>🎯 Active: {v.currentTask}</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'matching' && (
          <div>
            <div className="glass-card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16 }}>⚡ Smart Skill Matching Engine</h3>
              <p style={{ color: '#94a3b8', marginBottom: 16, fontSize: '0.9rem' }}>Select an active crisis to find the best-matched available volunteers based on their skills.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {crises.filter(c => c.status === 'active').slice(0, 8).map(c => (
                  <button key={c.id} className="btn btn-ghost btn-sm" onClick={() => handleMatch(c.id)}>
                    <Zap size={14} /> {c.title.substring(0, 30)}...
                  </button>
                ))}
              </div>
            </div>
            {matchResults && (
              <div className="animate-in">
                <h3 style={{ marginBottom: 8 }}>Matches for: {matchResults.crisis}</h3>
                <p style={{ color: '#94a3b8', marginBottom: 16, fontSize: '0.85rem' }}>
                  Required skills: {matchResults.requiredSkills?.join(', ')}
                </p>
                <div className="volunteer-grid">
                  {matchResults.matches?.map((v, i) => (
                    <div key={v.id} className="volunteer-card" style={{ borderLeft: `3px solid ${v.matchScore >= 3 ? '#22c55e' : v.matchScore >= 2 ? '#eab308' : '#3b82f6'}` }}>
                      <div className="vol-header">
                        <div className="vol-avatar" style={{ background: avatarColors[i % avatarColors.length] }}>{v.name.charAt(0)}</div>
                        <div>
                          <div className="vol-name">{v.name}</div>
                          <div className="vol-location"><MapPin size={12} /> {v.location}</div>
                        </div>
                        <span className="badge badge-info" style={{ marginLeft: 'auto' }}>Score: {v.matchScore}</span>
                      </div>
                      <div className="vol-skills">{v.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
                    </div>
                  ))}
                  {matchResults.matches?.length === 0 && <p style={{ color: '#64748b' }}>No available matches found.</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'tasks' && (
          <div className="task-board">
            {crises.filter(c => c.status === 'active').map(c => (
              <div key={c.id} className="task-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className={`badge badge-${c.severity}`}>{c.severity}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.volunteersAssigned}/{c.volunteersNeeded} filled</span>
                </div>
                <h4>{c.title}</h4>
                <div className="task-meta"><MapPin size={12} /> {c.location}</div>
                <div className="task-skills-needed">
                  {(c.needs || []).slice(0, 3).map(n => <span key={n} className="skill-tag" style={{ fontSize: '0.7rem' }}>{n}</span>)}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((c.volunteersAssigned / c.volunteersNeeded) * 100, 100)}%`, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', borderRadius: 8, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
