// src/api/operator.api.ts

import  http  from './http.api'
import type { Operator }  from '../interfaces/operator.interface'

export const getOperator = async () => {
  const { data } = await http.get('/operator/me')
  return data
}

export const updateMe = async (payload: Partial<Operator>) => {
  const { data } = await http.put('/operator/me', payload)
  return data
}