import { useEffect, useState } from 'react'

const defaultTickerItems = [
  { icon: '🚨', text: 'NEW CRISIS: Severe Flooding in Assam — 150 people affected', type: 'critical' },
  { icon: '🙋', text: '5 new volunteers joined the Gujarat Earthquake response', type: 'volunteer' },
  { icon: '⚠️', text: 'WEATHER ALERT: Cyclone warning issued for coastal Odisha', type: 'warning' },
  { icon: '📢', text: 'UPDATE: Relief supplies dispatched to Mumbai landslide zone', type: 'update' },
  { icon: '🚨', text: 'CRITICAL: Chemical spill reported near Vizag industrial area', type: 'critical' },
  { icon: '🙋', text: '12 medical volunteers deployed to Bihar flood relief camps', type: 'volunteer' },
  { icon: '⚠️', text: 'EVACUATION: 2,000 residents relocated from Uttarakhand landslide zone', type: 'warning' },
  { icon: '📢', text: 'UPDATE: Power restored to 80% of areas hit by Tamil Nadu cyclone', type: 'update' },
  { icon: '🙋', text: '3 NGOs activated rapid response for Delhi structural collapse', type: 'volunteer' },
  { icon: '🚨', text: 'NEW REPORT: Forest fire detected near Jim Corbett National Park', type: 'critical' },
]

export default function LiveTicker() {
  const [items, setItems] = useState(defaultTickerItems)

  // Try fetching live crises to build dynamic ticker items
  useEffect(() => {
    fetch('/api/crises')
      .then(r => r.json())
      .then(crises => {
        if (crises && crises.length > 0) {
          const dynamic = crises.slice(0, 6).map(c => ({
            icon: c.severity === 'critical' ? '🚨' : c.severity === 'high' ? '⚠️' : '📢',
            text: `${c.severity === 'critical' ? 'CRITICAL' : c.severity === 'high' ? 'HIGH ALERT' : 'UPDATE'}: ${c.title} — ${c.location}`,
            type: c.severity === 'critical' ? 'critical' : c.severity === 'high' ? 'warning' : 'update',
          }))
          // Mix dynamic + some defaults
          setItems([...dynamic, ...defaultTickerItems.slice(0, 4)])
        }
      })
      .catch(() => {})
  }, [])

  // Duplicate items for seamless infinite scroll
  const doubled = [...items, ...items]

  return (
    <div className="live-ticker">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <div key={i} className={`ticker-item ${item.type}`}>
            <div className="ticker-dot" />
            <span className="ticker-icon">{item.icon}</span>
            <span className="ticker-label">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
