import { useEffect, useState } from 'react'
import { LayoutDashboard, AlertTriangle, Users, Heart, Lightbulb, TrendingUp, Download, Activity, Shield, Zap, Clock, BarChart3 } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = () => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const handleExport = async () => {
    const res = await fetch('/api/dashboard/export')
    const data = await res.json()
    const csv = [
      ['ID', 'Title', 'Type', 'Severity', 'Status', 'Location', 'Affected', 'Volunteers Needed', 'Volunteers Assigned', 'Created'].join(','),
      ...data.crises.map(c => [c.id, `"${c.title}"`, c.type, c.severity, c.status, `"${c.location}"`, c.affectedPeople, c.volunteersNeeded, c.volunteersAssigned, c.createdAt].join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'crisisconnect-report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div>
      <div className="page-header">
        <h1>📊 Command Dashboard</h1>
        <p>Real-time situational awareness • Auto-refreshing every 30s</p>
      </div>
      <div className="page-body">
        <div className="stats-grid">
          {[1,2,3,4,5,6].map(n => <div key={n} className="stat-card skeleton" style={{ height: 110 }}></div>)}
        </div>
        <div className="dashboard-grid mt-24">
          <div className="chart-card skeleton" style={{ height: 300 }}></div>
          <div className="chart-card skeleton" style={{ height: 300 }}></div>
        </div>
      </div>
    </div>
  )
  const o = stats?.overview || {}
  const bt = stats?.crisisByType || {}
  const bs = stats?.crisisBySeverity || {}
  const maxType = Math.max(...Object.values(bt), 1)

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>📊 Command Dashboard</h1>
            <p>Real-time situational awareness • Auto-refreshing every 30s</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={fetchStats}><Activity size={16} /> Refresh</button>
            <button className="btn btn-primary btn-sm" onClick={handleExport}><Download size={16} /> Export CSV</button>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Top Stats */}
        <div className="stats-grid">
          <div className="stat-card red">
            <div className="stat-card-icon"><AlertTriangle size={24} /></div>
            <div className="stat-card-value">{o.activeCrises || 0}</div>
            <div className="stat-card-label">Active Crises</div>
          </div>
          <div className="stat-card green">
            <div className="stat-card-icon"><Shield size={24} /></div>
            <div className="stat-card-value">{o.resolvedCrises || 0}</div>
            <div className="stat-card-label">Resolved</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-card-icon"><Users size={24} /></div>
            <div className="stat-card-value">{o.totalVolunteers || 0}</div>
            <div className="stat-card-label">Total Volunteers</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-card-icon"><Zap size={24} /></div>
            <div className="stat-card-value">{o.deployedVolunteers || 0}</div>
            <div className="stat-card-label">Deployed Now</div>
          </div>
          <div className="stat-card cyan">
            <div className="stat-card-icon"><Heart size={24} /></div>
            <div className="stat-card-value">{(o.totalAffected || 0).toLocaleString()}</div>
            <div className="stat-card-label">People Affected</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-card-icon"><Lightbulb size={24} /></div>
            <div className="stat-card-value">{stats?.ideaStats?.total || 0}</div>
            <div className="stat-card-label">Innovation Ideas</div>
          </div>
        </div>

        {/* Charts */}
        <div className="dashboard-grid">
          {/* Crisis by Type Bar Chart */}
          <div className="chart-card">
            <h3><BarChart3 size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />Crises by Type</h3>
            <div className="bar-chart">
              {Object.entries(bt).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                <div className="bar-row" key={type}>
                  <span className="bar-label">{type}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{
                      width: `${(count / maxType) * 100}%`,
                      background: type === 'Flood' ? 'linear-gradient(90deg, #3b82f6, #06b6d4)' :
                        type === 'Earthquake' ? 'linear-gradient(90deg, #f97316, #ea580c)' :
                        type === 'Cyclone' ? 'linear-gradient(90deg, #8b5cf6, #7c3aed)' :
                        type === 'Fire' ? 'linear-gradient(90deg, #ef4444, #dc2626)' :
                        type === 'Pandemic' ? 'linear-gradient(90deg, #22c55e, #16a34a)' :
                        'linear-gradient(90deg, #64748b, #475569)'
                    }}>{count}</div>
                  </div>
                  <span className="bar-value">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Donut */}
          <div className="chart-card">
            <h3><Activity size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />Severity Breakdown</h3>
            <div className="donut-chart">
              <div className="donut-visual" style={{
                background: `conic-gradient(
                  #ef4444 0deg ${(bs.critical / (o.activeCrises || 1)) * 360}deg,
                  #f97316 ${(bs.critical / (o.activeCrises || 1)) * 360}deg ${((bs.critical + bs.high) / (o.activeCrises || 1)) * 360}deg,
                  #eab308 ${((bs.critical + bs.high) / (o.activeCrises || 1)) * 360}deg ${((bs.critical + bs.high + bs.moderate) / (o.activeCrises || 1)) * 360}deg,
                  #22c55e ${((bs.critical + bs.high + bs.moderate) / (o.activeCrises || 1)) * 360}deg 360deg
                )`
              }}>
                <div className="donut-center">
                  <div className="big-num">{o.activeCrises || 0}</div>
                  <div className="small-text">Active</div>
                </div>
              </div>
              <div className="donut-legend">
                <div className="legend-item"><div className="legend-dot" style={{ background: '#ef4444' }} />Critical ({bs.critical || 0})</div>
                <div className="legend-item"><div className="legend-dot" style={{ background: '#f97316' }} />High ({bs.high || 0})</div>
                <div className="legend-item"><div className="legend-dot" style={{ background: '#eab308' }} />Moderate ({bs.moderate || 0})</div>
                <div className="legend-item"><div className="legend-dot" style={{ background: '#22c55e' }} />Low ({bs.low || 0})</div>
              </div>
            </div>
          </div>
        </div>

        {/* Innovation Stats */}
        <div className="glass-card mt-24">
          <h3 style={{ marginBottom: 16 }}>💡 Innovation Pipeline</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
            {[
              { label: 'Submitted', value: stats?.ideaStats?.submitted || 0, color: '#3b82f6' },
              { label: 'Under Review', value: stats?.ideaStats?.underReview || 0, color: '#eab308' },
              { label: 'Adopted', value: stats?.ideaStats?.adopted || 0, color: '#8b5cf6' },
              { label: 'Implemented', value: stats?.ideaStats?.implemented || 0, color: '#22c55e' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Gaps */}
        <div className="glass-card mt-24">
          <h3 style={{ marginBottom: 16 }}>🚨 Volunteer Deployment Gaps</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats?.recentCrises?.map(c => {
              const pct = Math.round(((c.volunteersAssigned || 0) / (c.volunteersNeeded || 1)) * 100)
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ width: 200, fontSize: '0.85rem', flex: 'none' }}>{c.title.substring(0, 28)}...</span>
                  <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct > 70 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : pct > 40 ? 'linear-gradient(90deg, #eab308, #ca8a04)' : 'linear-gradient(90deg, #ef4444, #dc2626)', borderRadius: 5, transition: 'width 1s' }} />
                  </div>
                  <span style={{ width: 80, fontSize: '0.8rem', color: pct > 70 ? '#22c55e' : pct > 40 ? '#eab308' : '#ef4444', fontWeight: 600, textAlign: 'right', flex: 'none' }}>{c.volunteersAssigned}/{c.volunteersNeeded} ({pct}%)</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Last updated */}
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: '0.75rem', color: '#64748b' }}>
          <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          Last updated: {stats?.timestamp ? new Date(stats.timestamp).toLocaleString() : 'N/A'} • Auto-refreshes every 30 seconds
        </div>
      </div>
    </div>
  )
}
