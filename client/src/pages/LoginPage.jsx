import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, Eye, EyeOff, Shield, ArrowRight, Zap, Users, Globe, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'volunteer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

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
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
        <div className="login-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="login-particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }} />
          ))}
        </div>
      </div>

      <div className="login-container">
        {/* Left panel — branding */}
        <div className="login-branding">
          <div className="login-logo-3d">
            <div className="login-logo-face front">🚨</div>
            <div className="login-logo-face back">🛡️</div>
          </div>
          <h1 className="login-brand-title">
            Crisis<span>Connect</span>
          </h1>
          <p className="login-brand-subtitle">Rapid Crisis Response Platform</p>

          <div className="login-features">
            <div className="login-feature">
              <div className="login-feature-icon"><Globe size={20} /></div>
              <div>
                <h4>Real-Time Crisis Map</h4>
                <p>Track 15+ active emergencies across India</p>
              </div>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon"><Users size={20} /></div>
              <div>
                <h4>Volunteer Matching</h4>
                <p>AI-powered skill-to-task matching engine</p>
              </div>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon"><Zap size={20} /></div>
              <div>
                <h4>Instant SOS</h4>
                <p>One-tap emergency signal with GPS location</p>
              </div>
            </div>
          </div>

          <div className="login-stats-row">
            <div className="login-stat"><span>14</span>Active Crises</div>
            <div className="login-stat"><span>20</span>Volunteers</div>
            <div className="login-stat"><span>248K</span>People Helped</div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="login-form-panel">
          <div className="login-form-card">
            <div className="login-tabs">
              <button className={`login-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setError('') }}>Sign In</button>
              <button className={`login-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setError('') }}>Create Account</button>
            </div>

            <h2 className="login-form-title">
              {isLogin ? 'Welcome Back' : 'Join the Mission'}
            </h2>
            <p className="login-form-subtitle">
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
      </div>
    </div>
  )
}
