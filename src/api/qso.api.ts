import http from './http.api'

export const getQsos = async () => {
  const { data } = await http.get('/qso')
  return data
}

export const createQso = async (payload: {
  remoteCallsign: string
  band: string
  mode: string
  rstSent?: string
  rstReceived?: string
  qsoDate: string
}) => {
  const { data } = await http.post('/qso', payload)
  return data
}

export const deleteQso = async (id: string) => {
  const { data } = await http.delete(`/qso/${id}`)
  return data
}