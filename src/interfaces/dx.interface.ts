export interface DxSummary {
  longestQso: {
    distanceKm: number
    remoteCallsign: string
  } | null

  averageDistance: number
  totalDistanceWorked: number

  confirmedQsos: number

  workedGrids: number
  workedDXCC: number
}