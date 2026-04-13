import { useEffect, useState } from 'react'
import { getDxSummary, getLongestQso, getWorkedGrids, getWorkedDxcc } from '../api/dx.api'
import Nav from '../components/Nav'

export default function DX_Summary() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [summary, setSummary] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [longest, setLongest] = useState<any>(null)
  const [grids, setGrids] = useState<string[]>([])
  const [dxcc, setDxcc] = useState<string[]>([])

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

        // ensure dxcc is always an array
        if (Array.isArray(d)) {
          setDxcc(d)
        } else if (Array.isArray(d?.items)) {
          setDxcc(d.items)
        } else if (Array.isArray(d?.countries)) {
          setDxcc(d.countries)
        } else {
          console.warn('DXCC not array', d)
          setDxcc([])
        }
      } catch (err) {
        console.error('DX fetch error', err)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="bg-white text-gray-800 p-4">
      <div className="w-full">
        <Nav />
        <h1 className="text-2xl mb-4 font-bold text-gray-900">DX SUMMARY</h1>

        {/* Summary */}
        {summary && (
          <div className="border border-gray-300 p-4 rounded mb-4 bg-white shadow-sm">
            <div>Total Distance: {summary.totalDistanceWorked?.toFixed?.(0)} km</div>
            <div>Average Distance: {summary.averageDistance?.toFixed?.(0)} km</div>
            <div>Confirmed QSOs: {summary.confirmedQsos}</div>
          </div>
        )}

        {/* Longest QSO */}
        {longest && (
          <div className="border border-gray-300 p-4 rounded mb-4 bg-white shadow-sm">
            <h2 className="text-gray-800 mb-2 font-semibold">Longest QSO</h2>
            <div>{longest.remoteCallsign}</div>
            <div>{longest.distanceKm?.toFixed?.(0)} km</div>
          </div>
        )}

        {/* Worked Grids */}
        <div className="border border-gray-300 p-4 rounded mb-4 bg-white shadow-sm">
          <h2 className="text-gray-800 mb-2 font-semibold">Worked Grids</h2>
          <div className="flex flex-wrap gap-2">
            {grids.map((g) => (
              <span key={g} className="border border-gray-300 px-2 py-1 rounded text-sm bg-gray-100">
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* DXCC */}
        <div className="border border-gray-300 p-4 rounded mb-4 bg-white shadow-sm">
          <h2 className="text-gray-800 mb-2 font-semibold">Worked DXCC</h2>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(dxcc) && dxcc.map((c) => (
              <span key={c} className="border border-gray-300 px-2 py-1 rounded text-sm bg-gray-100">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}