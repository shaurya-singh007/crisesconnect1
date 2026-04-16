import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { Map, AlertTriangle, Users, Lightbulb, LayoutDashboard, Bell, FileText, Home, Menu, X, Shield } from 'lucide-react'
import LandingPage from './pages/LandingPage'
import CrisisMap from './pages/CrisisMap'
import ReportCrisis from './pages/ReportCrisis'
import VolunteerHub from './pages/VolunteerHub'
import InnovationHub from './pages/InnovationHub'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import Chatbot from './components/Chatbot'
import SOSButton from './components/SOSButton'

function Sidebar({ isOpen, onClose }) {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>A</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Admin User</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>admin@crisisconnect.org</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const isLanding = location.pathname === '/'

  if (isLanding) {
    return (
      <>
        <LandingPage />
        <Chatbot />
      </>
    )
  }

  return (
    <div className="app-layout">
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Routes>
          <Route path="/map" element={<CrisisMap />} />
          <Route path="/report" element={<ReportCrisis />} />
          <Route path="/volunteers" element={<VolunteerHub />} />
          <Route path="/innovation" element={<InnovationHub />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </main>
      <SOSButton />
      <Chatbot />
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
