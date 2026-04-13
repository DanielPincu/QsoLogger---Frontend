import type { Band } from '../types/qsoBand'
import type { Mode } from '../types/qsoMode'

export interface Qso {
  _id: string

  remoteCallsign: string

  band: Band
  mode: Mode

  rstSent?: string
  rstReceived?: string

  qsoDate: string

  operatorId: string

  confirmed: boolean
  confirmedAt?: string

  // derived / backend-enriched fields
  distanceKm?: number
  matchedQsoId?: string

  // map-related 
  from?: {
    lat: number
    lon: number
  }

  to?: {
    lat: number
    lon: number
  }
}