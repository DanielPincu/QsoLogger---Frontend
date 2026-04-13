import http from './http.api'

export const getDxSummary = async () => {
  const { data } = await http.get('/dx/summary')
  return data
}

export const getLongestQso = async () => {
  const { data } = await http.get('/dx/longest')
  return data
}

export const getLongestByBand = async (band: string) => {
  const { data } = await http.get(`/dx/longest-by-band/${band}`)
  return data
}

export const getWorkedGrids = async () => {
  const { data } = await http.get('/dx/grids')
  return data
}

export const getWorkedDxcc = async () => {
  const { data } = await http.get('/dx/dxcc')
  return data
}