import http from './http.api'
import type { LoginPayload, RegisterPayload } from '../interfaces/auth.interface'

export const login = async (payload: LoginPayload) => {
  const { data } = await http.post('/auth/login', payload)
  return data
}

export const register = async (payload: RegisterPayload) => {
  const { data } = await http.post('/auth/register', payload)
  return data
}

export const getMe = async () => {
  const { data } = await http.get('/auth/me')
  return data
}