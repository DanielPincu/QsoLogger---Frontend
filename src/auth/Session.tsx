import { useState, useEffect, createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { getMe } from '../api/auth.api'
import type { Operator } from '../interfaces/operator.interface'

type AuthContextType = {
  user: Operator | null
  isLoading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
}

const SessionContext = createContext<AuthContextType | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Operator | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false)
      return
    }

    getMe()
      .then((user) => {
        setUser(user)
      })
      .catch(() => {
        localStorage.removeItem('token')
        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const login = async (token: string) => {
    localStorage.setItem('token', token)

    const me = await getMe()
    setUser(me)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <SessionContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </SessionContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside SessionProvider')
  }
  return ctx
}