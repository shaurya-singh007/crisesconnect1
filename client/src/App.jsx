import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { Map, AlertTriangle, Users, Lightbulb, LayoutDashboard, Bell, FileText, Home, Menu, X, Shield, LogOut } from 'lucide-react'
import LandingPage from './pages/LandingPage'
import CrisisMap from './pages/CrisisMap'
import ReportCrisis from './pages/ReportCrisis'
import VolunteerHub from './pages/VolunteerHub'
import InnovationHub from './pages/InnovationHub'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import LoginPage from './pages/LoginPage'
import Chatbot from './components/Chatbot'
import SOSButton from './components/SOSButton'
import LiveTicker from './components/LiveTicker'
import { useAuth } from './context/AuthContext'

function ToastListener() {
  useEffect(() => {
    const handler = (e) => {
      const { title, message, severity } = e.detail
      if (severity === 'critical') {
        toast.error(`${title}\n${message}`, { duration: 6000, style: { background: '#ef4444', color: '#fff' } })
      } else if (severity === 'high') {
        toast(`${title}\n${message}`, { icon: '🟠', duration: 5000, style: { background: '#f97316', color: '#fff' } })
      } else {
        toast.success(`${title}\n${message}`, { duration: 4000, style: { background: '#3b82f6', color: '#fff' } })
      }
    }
    const successHandler = (e) => {
      toast.success(e.detail.message, { style: { background: '#10b981', color: '#fff' } })
    }
    window.addEventListener('new_alert', handler)
    window.addEventListener('toast_success', successHandler)
    return () => {
      window.removeEventListener('new_alert', handler)
      window.removeEventListener('toast_success', successHandler)
    }
  }, [])
  return <Toaster position="top-right" toastOptions={{ className: 'custom-toast' }} />
}

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">🚨</div>
          <div>
            <div className="sidebar-title">CrisisConnect</div>
            <div className="sidebar-subtitle">Rapid Response</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose} end>
            <Home size={19} /> Home
          </NavLink>
          <NavLink to="/map" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Map size={19} /> Live Crisis Map
          </NavLink>
          <NavLink to="/report" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <AlertTriangle size={19} /> Report Crisis
          </NavLink>

          <div className="nav-section-label">Community</div>
          <NavLink to="/volunteers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Users size={19} /> Volunteer Hub
            <span className="nav-badge">20</span>
          </NavLink>
          <NavLink to="/innovation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Lightbulb size={19} /> Innovation Hub
          </NavLink>

          <div className="nav-section-label">Command Center</div>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <LayoutDashboard size={19} /> Dashboard
          </NavLink>
          <NavLink to="/alerts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Bell size={19} /> Alerts
            <span className="nav-badge">8</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-link logout-btn" onClick={logout}>
            <LogOut size={19} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

function Topbar({ user, onMenuClick }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="sidebar-toggle" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
      </div>
      <div className="topbar-right">
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role}</span>
          </div>
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading } = useAuth()
  const location = useLocation()
  const isLanding = location.pathname === '/'

  if (loading) return <div className="full-loader"><div className="login-spinner" /></div>
  
  if (!user) {
    return <LoginPage />
  }

  if (isLanding) {
    return (
      <div className="app-layout">
        <Topbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="ticker-container">
          <LiveTicker />
        </div>
        <main className="main-content landing-main">
          <LandingPage />
        </main>
        <SOSButton />
        <Chatbot />
        <ToastListener />
      </div>
    )
  }

  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -15 }
  }

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.25
  }

  const AnimatedRoute = ({ children }) => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  )

  return (
    <div className="app-layout">
      <Topbar user={user} onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="ticker-container">
        <LiveTicker />
      </div>
      <main className="main-content">
        <div className="content-padder">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/map" element={<AnimatedRoute><CrisisMap /></AnimatedRoute>} />
              <Route path="/report" element={<AnimatedRoute><ReportCrisis /></AnimatedRoute>} />
              <Route path="/volunteers" element={<AnimatedRoute><VolunteerHub /></AnimatedRoute>} />
              <Route path="/innovation" element={<AnimatedRoute><InnovationHub /></AnimatedRoute>} />
              <Route path="/dashboard" element={<AnimatedRoute><Dashboard /></AnimatedRoute>} />
              <Route path="/alerts" element={<AnimatedRoute><Alerts /></AnimatedRoute>} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
      <SOSButton />
      <Chatbot />
      <ToastListener />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  )
}
