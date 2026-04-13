import http from './http.api'
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse
} from '../interfaces/auth.interface'
import type { Operator } from '../interfaces/operator.interface'
import { getOperator } from './operator.api'

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await http.post('/auth/login', payload)
  return data
}

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await http.post('/auth/register', payload)
  return data
}

export const getMe = async (): Promise<Operator> => {
  const data = await getOperator()
  return data
}