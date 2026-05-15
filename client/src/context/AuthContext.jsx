import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('crisisconnect_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch(e) {}
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (data.token) {
        const userData = { ...data.user, token: data.token }
        setUser(userData)
        localStorage.setItem('crisisconnect_user', JSON.stringify(userData))
        return { success: true }
      }
      return { success: false, error: data.error || 'Login failed' }
    } catch (err) {
      console.error('Login fetch error:', err)
      return { success: false, error: 'Cannot reach server. Make sure the backend is running on port 5000.' }
    }
  }

  const register = async (name, email, password, role = 'volunteer') => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      })
      const data = await res.json()
      if (data.token) {
        const userData = { ...data.user, token: data.token }
        setUser(userData)
        localStorage.setItem('crisisconnect_user', JSON.stringify(userData))
        return { success: true }
      }
      return { success: false, error: data.error || 'Registration failed' }
    } catch (err) {
      console.error('Register fetch error:', err)
      return { success: false, error: 'Cannot reach server. Make sure the backend is running on port 5000.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('crisisconnect_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
