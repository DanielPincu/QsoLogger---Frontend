import http from './http.api'

export const getOperator = async () => {
  const { data } = await http.get('/operator/me')
  return data
}

export const updateOperator = async (payload: {
  callsign?: string
  qth?: string
  locator?: string
}) => {
  const { data } = await http.patch('/operator/me', payload)
  return data
}