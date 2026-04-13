import type { Operator } from './operator.interface'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  callsign: string
  email: string
  password: string
  locator: string
}

export interface AuthResponse {
  token: string
  user: Operator
}