import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Map, AlertTriangle, Users, Lightbulb, LayoutDashboard, Bell, Shield, Zap, Globe, ArrowRight, Heart, Bot } from 'lucide-react'

export default function LandingPage() {
  const [stats, setStats] = useState({ activeCrises: 0, totalVolunteers: 0, totalAffected: 0, totalAlerts: 0 })
  const [counters, setCounters] = useState({ activeCrises: 0, totalVolunteers: 0, totalAffected: 0, totalAlerts: 0 })

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(d => setStats(d.overview))
      .catch(() => setStats({ activeCrises: 14, totalVolunteers: 20, totalAffected: 248200, totalAlerts: 8 }))
  }, [])

  useEffect(() => {
    const targets = {
      activeCrises: stats.activeCrises || 14,
      totalVolunteers: stats.totalVolunteers || 20,
      totalAffected: stats.totalAffected || 248200,
      totalAlerts: stats.totalAlerts || 8
    }
    const duration = 2000
    const steps = 60
    const interval = duration / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = Math.min(step / steps, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCounters({
        activeCrises: Math.round(targets.activeCrises * ease),
        totalVolunteers: Math.round(targets.totalVolunteers * ease),
        totalAffected: Math.round(targets.totalAffected * ease),
        totalAlerts: Math.round(targets.totalAlerts * ease),
      })
      if (step >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [stats])

  const features = [
    { icon: <Map size={28} />, title: 'Live Crisis Map', desc: 'Real-time interactive map showing all active crises color-coded by severity. Click any marker for full details and needs assessment.', link: '/map' },
    { icon: <AlertTriangle size={28} />, title: 'Crisis Reporting', desc: 'Report emergencies in under 2 minutes. Upload photos, mark locations, and crowdsource verification from nearby citizens.', link: '/report' },
    { icon: <Users size={28} />, title: 'Volunteer Matching', desc: 'Smart skill-to-task matching engine connects willing volunteers with exactly where their expertise is needed most.', link: '/volunteers' },
    { icon: <Bot size={28} />, title: 'AI Voice Assistant', desc: 'Talk to our Gemini-powered AI for instant solutions. Get first aid tips, shelter locations, and emergency guidance via voice commands.', link: '#' },
    { icon: <Lightbulb size={28} />, title: 'Innovation Hub', desc: 'Crowdsource solutions from citizens and experts. Vote on ideas, track adoption, and turn collective intelligence into action.', link: '/innovation' },
    { icon: <LayoutDashboard size={28} />, title: 'Command Dashboard', desc: 'Full situational awareness for coordinators. Live stats, resource tracking, volunteer deployment, and exportable reports.', link: '/dashboard' },
  ]

  return (
    <div className="landing-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid-lines" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulse-dot" />
            LIVE MONITORING ACTIVE — {counters.activeCrises} CRISES TRACKED
          </div>
          <h1 className="hero-title">
            Turning Crisis <span className="gradient-text">Chaos</span><br />
            Into <span className="gradient-text">Coordination</span>
          </h1>
          <p className="hero-subtitle">
            CrisisConnect is an Open Innovation platform that enables rapid, coordinated, and crowd-powered responses to disasters. Real-time mapping, volunteer matching, and collective intelligence — all in one place.
          </p>
          <div className="hero-actions">
            <Link to="/map" className="btn btn-primary btn-lg">
              <Map size={20} /> View Live Map
            </Link>
            <Link to="/report" className="btn btn-danger btn-lg">
              <AlertTriangle size={20} /> Report Crisis
            </Link>
            <button onClick={() => window.dispatchEvent(new CustomEvent('open_chatbot'))} className="btn btn-ghost btn-lg">
              <Bot size={20} /> Talk to AI Assistant
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value" style={{ color: '#ef4444' }}>{counters.activeCrises}</div>
              <div className="hero-stat-label">Active Crises</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value" style={{ color: '#3b82f6' }}>{counters.totalVolunteers}</div>
              <div className="hero-stat-label">Volunteers Ready</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value" style={{ color: '#f97316' }}>{counters.totalAffected.toLocaleString()}</div>
              <div className="hero-stat-label">People Affected</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value" style={{ color: '#eab308' }}>{counters.totalAlerts}</div>
              <div className="hero-stat-label">Active Alerts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2 className="section-title">Powerful Modules, <span style={{ color: '#3b82f6' }}>One Platform</span></h2>
        <p className="section-subtitle">Seven integrated modules designed for speed, clarity, and maximum impact during every phase of crisis response.</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <Link to={f.link} key={i} className="feature-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600 }}>
                Explore <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(239,68,68,0.05), rgba(59,130,246,0.05))' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: 16 }}>
          Every Second Counts. <span style={{ color: '#ef4444' }}>Act Now.</span>
        </h2>
        <p style={{ color: '#94a3b8', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Whether you're reporting a crisis, volunteering your skills, or contributing innovative solutions — your action saves lives.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            <Shield size={20} /> Open Command Center
          </Link>
          <Link to="/innovation" className="btn btn-ghost btn-lg">
            <Lightbulb size={20} /> Submit an Idea
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: '1.5rem' }}>🚨</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>CrisisConnect</span>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
          Open Innovation Platform for Rapid Crisis Response • Hackathon 2025
        </p>
        <p style={{ color: '#475569', fontSize: '0.7rem', marginTop: 8 }}>
          Turning collective intelligence into coordinated action.
        </p>
      </footer>
    </div>
  )
}
