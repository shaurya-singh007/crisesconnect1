import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

// Notification sound — generates a short alert beep using Web Audio API
function playAlertSound(severity) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)

    if (severity === 'critical') {
      oscillator.frequency.value = 880
      gain.gain.value = 0.3
      oscillator.type = 'square'
    } else if (severity === 'high') {
      oscillator.frequency.value = 660
      gain.gain.value = 0.2
      oscillator.type = 'triangle'
    } else {
      oscillator.frequency.value = 520
      gain.gain.value = 0.15
      oscillator.type = 'sine'
    }

    oscillator.start()
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    oscillator.stop(ctx.currentTime + 0.5)

    // Double beep for critical
    if (severity === 'critical') {
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.frequency.value = 988
      osc2.type = 'square'
      gain2.gain.value = 0.3
      osc2.start(ctx.currentTime + 0.25)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.75)
      osc2.stop(ctx.currentTime + 0.75)
    }
  } catch (e) {
    // Audio not supported
  }
}

// Vibration
function vibrateDevice(severity) {
  if (!navigator.vibrate) return
  if (severity === 'critical') {
    navigator.vibrate([200, 100, 200, 100, 300])
  } else if (severity === 'high') {
    navigator.vibrate([200, 100, 200])
  } else {
    navigator.vibrate([150])
  }
}

// Browser Notification API
function sendBrowserNotification(alert) {
  if (Notification.permission !== 'granted') return

  const severityEmoji = {
    critical: '🔴',
    high: '🟠',
    moderate: '🟡',
    low: '🟢'
  }

  const notification = new Notification(
    `${severityEmoji[alert.severity] || '🔔'} ${alert.title}`,
    {
      body: alert.message || 'New crisis alert received.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: alert.id, // prevents duplicate notifications
      requireInteraction: alert.severity === 'critical',
      vibrate: [200, 100, 200],
    }
  )

  notification.onclick = () => {
    window.focus()
    notification.close()
  }

  // Auto-close non-critical after 8s
  if (alert.severity !== 'critical') {
    setTimeout(() => notification.close(), 8000)
  }
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(0)
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )
  const listenersRef = useRef([])

  // Request notification permission on mount
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      // Small delay so it doesn't fire on initial page load
      const timer = setTimeout(() => {
        Notification.requestPermission().then(perm => {
          setNotifPermission(perm)
        })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Connect to Socket.io server
  useEffect(() => {
    const socketUrl = import.meta.env.DEV
      ? 'http://localhost:5000'
      : window.location.origin

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    newSocket.on('connect', () => {
      console.log('⚡ Socket.io connected:', newSocket.id)
      setIsConnected(true)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected:', reason)
      setIsConnected(false)
    })

    newSocket.on('reconnect', (attempt) => {
      console.log(`🔄 Reconnected after ${attempt} attempts`)
    })

    newSocket.on('users:count', (count) => {
      setOnlineUsers(count)
    })

    // Handle incoming real-time alerts
    newSocket.on('alert:new', (alert) => {
      console.log('🔔 Real-time alert received:', alert.title)

      // Play sound
      playAlertSound(alert.severity)

      // Vibrate
      vibrateDevice(alert.severity)

      // Browser notification (works even if tab is in background)
      if (document.hidden || alert.severity === 'critical') {
        sendBrowserNotification(alert)
      }

      // Dispatch to App-level toast system
      window.dispatchEvent(new CustomEvent('new_alert', {
        detail: {
          title: alert.title,
          message: alert.message,
          severity: alert.severity
        }
      }))

      // Dispatch to any component listeners (e.g., Alerts page)
      window.dispatchEvent(new CustomEvent('socket:alert', { detail: alert }))
    })

    // Handle missed alerts (delivered on reconnect)
    newSocket.on('alerts:missed', (missedAlerts) => {
      console.log(`📬 Received ${missedAlerts.length} missed alerts`)
      missedAlerts.forEach(alert => {
        window.dispatchEvent(new CustomEvent('socket:alert', { detail: alert }))
      })
    })

    // Handle SOS specifically
    newSocket.on('sos:new', (sos) => {
      console.log('🆘 SOS received:', sos)
      window.dispatchEvent(new CustomEvent('socket:sos', { detail: sos }))
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const requestNotifPermission = async () => {
    if (typeof Notification === 'undefined') return 'denied'
    const perm = await Notification.requestPermission()
    setNotifPermission(perm)
    return perm
  }

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      onlineUsers,
      notifPermission,
      requestNotifPermission
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
