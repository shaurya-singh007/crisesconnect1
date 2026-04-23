import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, Eye, EyeOff, Shield, ArrowRight, Zap, Users, Globe, Sparkles, Map, AlertTriangle, Heart } from 'lucide-react'

export default function LoginPage() {
  const { login, register } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'volunteer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [counters, setCounters] = useState({ crises: 0, volunteers: 0, affected: 0 })

  // Animated counters
  useEffect(() => {
    const targets = { crises: 18, volunteers: 20, affected: 248200 }
    const duration = 2200
    const steps = 60
    const interval = duration / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = Math.min(step / steps, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCounters({
        crises: Math.round(targets.crises * ease),
        volunteers: Math.round(targets.volunteers * ease),
        affected: Math.round(targets.affected * ease),
      })
      if (step >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    let result
    if (isLogin) {
      result = await login(form.email, form.password)
    } else {
      if (!form.name.trim()) { setError('Please enter your name'); setLoading(false); return }
      result = await register(form.name, form.email, form.password, form.role)
    }

    if (!result.success) {
      setError(result.error)
    }
    setLoading(false)
  }

  const quickLogin = async (email, pass) => {
    setForm(p => ({ ...p, email, password: pass }))
    setLoading(true)
    const result = await login(email, pass)
    if (!result.success) setError(result.error)
    setLoading(false)
  }

  return (
    <div className="public-landing">
      {/* Fixed Nav */}
      <nav className="public-nav">
        <div className="public-nav-logo">
          <span style={{ fontSize: '1.5rem' }}>🚨</span>
          Crisis<span>Connect</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => { setIsLogin(true); setShowAuthModal(true) }}>
            Sign In
          </button>
          <button className="btn btn-primary" onClick={() => { setIsLogin(false); setShowAuthModal(true) }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="public-hero">
        <div className="public-hero-bg" />
        <div className="public-hero-grid" />
        <div className="public-hero-content" style={{ animation: 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
          <div className="hero-badge" style={{ marginBottom: 28 }}>
            <span className="pulse-dot" />
            LIVE MONITORING ACTIVE — {counters.crises} CRISES TRACKED
          </div>
          <h1>
            Turning Crisis <span className="gradient-text">Chaos</span><br />
            Into <span className="gradient-text" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Coordination</span>
          </h1>
          <p>
            An Open Innovation platform for rapid, coordinated, crowd-powered disaster response. Real-time mapping, volunteer matching, and collective intelligence — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => { setIsLogin(true); setShowAuthModal(true) }}>
              <Map size={20} /> Enter Command Center
            </button>
            <button className="btn btn-danger btn-lg" onClick={() => { setIsLogin(false); setShowAuthModal(true) }}>
              <Heart size={20} /> Join as Volunteer
            </button>
          </div>

          <div className="public-stats">
            <div className="public-stat">
              <div className="public-stat-value" style={{ color: '#ef4444' }}>{counters.crises}</div>
              <div className="public-stat-label">Active Crises</div>
            </div>
            <div className="public-stat">
              <div className="public-stat-value" style={{ color: '#3b82f6' }}>{counters.volunteers}</div>
              <div className="public-stat-label">Volunteers Ready</div>
            </div>
            <div className="public-stat">
              <div className="public-stat-value" style={{ color: '#f97316' }}>{counters.affected.toLocaleString()}</div>
              <div className="public-stat-label">People Affected</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="public-how-it-works">
        <h2 className="section-title">How It <span style={{ color: 'var(--primary)' }}>Works</span></h2>
        <p className="section-subtitle">Three simple steps to turn collective intelligence into coordinated action.</p>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-step-number">1</div>
            <h4>Report or Discover</h4>
            <p>Citizens report emergencies in under 2 minutes. Real-time crisis data appears on the live map instantly.</p>
          </div>
          <div className="how-step">
            <div className="how-step-number">2</div>
            <h4>Match & Mobilize</h4>
            <p>Our engine matches volunteers by skill and proximity, deploying the right help to the right place.</p>
          </div>
          <div className="how-step">
            <div className="how-step-number">3</div>
            <h4>Coordinate & Resolve</h4>
            <p>Command dashboard gives coordinators full situational awareness for rapid, data-driven decisions.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: '1.5rem' }}>🚨</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>CrisisConnect</span>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
          Open Innovation Platform for Rapid Crisis Response
        </p>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="sos-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div style={{
            background: 'rgba(10, 14, 28, 0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: '36px',
            width: '100%',
            maxWidth: 440,
            animation: 'modalScaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          }} onClick={e => e.stopPropagation()}>
            <div className="login-tabs" style={{ marginBottom: 24 }}>
              <button className={`login-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setError('') }}>Sign In</button>
              <button className={`login-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setError('') }}>Create Account</button>
            </div>

            <h2 className="login-form-title" style={{ textAlign: 'center' }}>
              {isLogin ? 'Welcome Back' : 'Join the Mission'}
            </h2>
            <p className="login-form-subtitle" style={{ textAlign: 'center', marginBottom: 20 }}>
              {isLogin ? 'Sign in to access the command center' : 'Register to start saving lives'}
            </p>

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="login-input-group">
                  <User size={18} className="login-input-icon" />
                  <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
              )}
              <div className="login-input-group">
                <Mail size={18} className="login-input-icon" />
                <input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="login-input-group">
                <Lock size={18} className="login-input-icon" />
                <input type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" className="login-eye-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {!isLogin && (
                <div className="login-input-group">
                  <Shield size={18} className="login-input-icon" />
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="volunteer">🙋 Volunteer</option>
                    <option value="ngo">🏥 NGO / Organization</option>
                    <option value="government">🏛️ Government Agency</option>
                    <option value="citizen">👤 Citizen Reporter</option>
                  </select>
                </div>
              )}

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? (
                  <div className="login-spinner" />
                ) : (
                  <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            {/* Quick login */}
            {isLogin && (
              <div className="quick-login-section">
                <div className="quick-login-divider"><span>Quick Demo Access</span></div>
                <div className="quick-login-btns">
                  <button onClick={() => quickLogin('admin@crisisconnect.org', 'admin123')} className="quick-login-btn admin">
                    <Shield size={14} /> Admin
                  </button>
                  <button onClick={() => quickLogin('volunteer@example.com', 'volunteer123')} className="quick-login-btn volunteer">
                    <Users size={14} /> Volunteer
                  </button>
                  <button onClick={() => quickLogin('ngo@relief.org', 'ngo123')} className="quick-login-btn ngo">
                    <Globe size={14} /> NGO
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
