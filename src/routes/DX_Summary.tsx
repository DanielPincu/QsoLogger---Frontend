import { useEffect, useState } from 'react'
import { getDxSummary, getLongestQso, getWorkedDxcc, getWorkedGrids } from '../api/dx.api'
import AppShell from '../components/AppShell'
import { Badge, Card, EmptyState, SpinnerCard, StatTile } from '../components/ui'

type SummaryShape = {
  totalDistanceWorked?: number
  averageDistance?: number
  confirmedQsos?: number
}

type LongestShape = {
  remoteCallsign?: string
  distanceKm?: number
}

export default function DX_Summary() {
  const [summary, setSummary] = useState<SummaryShape | null>(null)
  const [longest, setLongest] = useState<LongestShape | null>(null)
  const [grids, setGrids] = useState<string[]>([])
  const [dxcc, setDxcc] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const s = await getDxSummary()
        const l = await getLongestQso()
        const g = await getWorkedGrids()
        const d = await getWorkedDxcc()

        setSummary(s)
        setLongest(l)
        setGrids(Array.isArray(g) ? g : [])

        if (Array.isArray(d)) {
          setDxcc(d)
        } else if (Array.isArray((d as { items?: string[] } | undefined)?.items)) {
          setDxcc((d as { items: string[] }).items)
        } else if (Array.isArray((d as { countries?: string[] } | undefined)?.countries)) {
          setDxcc((d as { countries: string[] }).countries)
        } else {
          console.warn('DXCC not array', d)
          setDxcc([])
        }
      } catch (err) {
        console.error('DX fetch error', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <SpinnerCard label="Collecting DX summary..." />

  return (
    <AppShell
      title="DX Summary"
      eyebrow="Propagation Overview"
      description="Review distance totals, longest contact, worked grids, and DXCC coverage from the same backend summary endpoints."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total Distance" value={`${summary?.totalDistanceWorked?.toFixed?.(0) ?? 0} km`} />
        <StatTile label="Average Distance" value={`${summary?.averageDistance?.toFixed?.(0) ?? 0} km`} />
        <StatTile label="Confirmed QSOs" value={summary?.confirmedQsos ?? 0} />
        <StatTile label="Longest Contact" value={`${longest?.distanceKm?.toFixed?.(0) ?? 0} km`} hint={longest?.remoteCallsign || 'No confirmed contact yet'} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="label-caps mb-2">Longest QSO</div>
          <h2 className="text-2xl font-semibold text-white">Distance Record</h2>
          {longest ? (
            <div className="mt-6 rounded-[24px] border border-emerald-400/20 bg-emerald-400/8 p-5">
              <div className="label-caps text-emerald-100">Remote Callsign</div>
              <div className="mt-2 text-4xl font-semibold uppercase tracking-[0.08em] text-white text-radio">
                {longest.remoteCallsign || 'N/A'}
              </div>
              <div className="mt-4 text-sm text-emerald-100/80">
                Distance {longest.distanceKm?.toFixed?.(0) ?? '0'} km
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState title="No longest QSO available yet." description="Once the backend returns distance data, the leading contact will appear here automatically." />
            </div>
          )}
        </Card>

        <div className="grid gap-6">
          <Card>
            <div className="label-caps mb-2">Worked Grids</div>
            <h2 className="text-2xl font-semibold text-white">Locator Coverage</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {grids.length > 0 ? grids.map((grid) => <Badge key={grid} tone="amber">{grid}</Badge>) : <span className="text-sm text-slate-400">No grids reported yet.</span>}
            </div>
          </Card>

          <Card>
            <div className="label-caps mb-2">Worked DXCC</div>
            <h2 className="text-2xl font-semibold text-white">Country Footprint</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {dxcc.length > 0 ? dxcc.map((country) => <Badge key={country} tone="signal">{country}</Badge>) : <span className="text-sm text-slate-400">No DXCC entities reported yet.</span>}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
