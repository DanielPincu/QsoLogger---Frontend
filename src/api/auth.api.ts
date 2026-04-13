import http from './http.api'

export const login = async (payload: {
  email: string
  password: string
}) => {
  const { data } = await http.post('/auth/login', payload)
  return data
}

export const register = async (payload: {
  email: string
  password: string
  callsign: string
}) => {
  const { data } = await http.post('/auth/register', payload)
  return data
}

export const getMe = async () => {
  const { data } = await http.get('/auth/me')
  return data
}