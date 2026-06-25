import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('authToken'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('authToken')
      if (storedToken) {
        try {
          const { data } = await api.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          })
          setUser(data)
          localStorage.setItem('userRole', data.role)
        } catch (error) {
          console.error("Failed to load user info:", error)
          logout()
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [token])

  const login = async (usernameOrEmail, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', {
        username_or_email: usernameOrEmail,
        password: password
      })
      localStorage.setItem('authToken', data.access_token)
      localStorage.setItem('userRole', data.user.role)
      setToken(data.access_token)
      setUser(data.user)
      return data.user
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const register = async (formData) => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/register', formData)
      localStorage.setItem('authToken', data.access_token)
      localStorage.setItem('userRole', data.user.role)
      setToken(data.access_token)
      setUser(data.user)
      return data.user
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRole')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
