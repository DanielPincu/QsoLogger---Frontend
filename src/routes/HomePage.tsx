import Nav from '../components/Nav'
import { useEffect, useState } from 'react'
import { createQso, getQsos, deleteQso } from '../api/qso.api'
import type { Qso } from '../interfaces/qso.interface'
import { MapContainer as RLMapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix missing marker icons in production (CDN)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Map = RLMapContainer as unknown as React.FC<any>

function LeafletMap({ from, to }: { from: { lat: number; lon: number }; to: { lat: number; lon: number } }) {
  const center: [number, number] = [
    (from.lat + to.lat) / 2,
    (from.lon + to.lon) / 2
  ]

  // Rough distance calculation (Haversine)
  const toRad = (v: number) => (v * Math.PI) / 180
  const R = 6371
  const dLat = toRad(to.lat - from.lat)
  const dLon = toRad(to.lon - from.lon)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  // Dynamic zoom based on distance
  let zoom = 2
  if (distance < 200) zoom = 7
  else if (distance < 500) zoom = 6
  else if (distance < 1000) zoom = 5
  else if (distance < 3000) zoom = 4
  else zoom = 2

  return (
    <Map center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[from.lat, from.lon]} />
      <Marker position={[to.lat, to.lon]} />
      <Polyline
        positions={[[from.lat, from.lon], [to.lat, to.lon]]}
        pathOptions={{ color: 'blue' }}
      />
    </Map>
  )
}

export default function HomePage() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [highlightForm, setHighlightForm] = useState(false)

  const [qsos, setQsos] = useState<Qso[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'unconfirmed'>('all')
  const [dateFilter, setDateFilter] = useState<'recent' | 'older'>('recent')
  const [form, setForm] = useState({
    remoteCallsign: '',
    band: '' as Qso['band'] | '',
    mode: '' as Qso['mode'] | '',
    rstSent: '',
    rstReceived: '',
    qsoDate: ''
  })

  useEffect(() => {
    const load = async () => {
      const data = await getQsos()
      setQsos(data)
    }

    load()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!form.remoteCallsign || !form.band || !form.mode || !form.qsoDate) {
      alert('Please fill all required fields')
      return
    }

    const selectedDate = new Date(form.qsoDate)
    const now = new Date()

    if (selectedDate > now) {
      alert('QSO date cannot be in the future')
      return
    }

    try {
      if (editingId) {
        // simple update via delete + create (since no update endpoint yet)
        await deleteQso(editingId)
      }

      await createQso(form)
    } catch {
      alert('Failed to save QSO')
      return
    }

    setEditingId(null)

    setForm({
      remoteCallsign: '',
      band: '' as Qso['band'] | '',
      mode: '' as Qso['mode'] | '',
      rstSent: '',
      rstReceived: '',
      qsoDate: ''
    })

    const data = await getQsos()
    setQsos(data)
  }

  const handleDelete = async (id: string) => {
    const ok = confirm('Are you sure you want to delete this QSO?')
    if (!ok) return

    await deleteQso(id)
    // Refetch after delete
    const data = await getQsos()
    setQsos(data)
  }

    return (
    <div className="w-full p-4">
      <Nav />

      <h1 className="text-xl mb-4">Log QSO</h1>

      <form
        onSubmit={handleSubmit}
        className={`grid grid-cols-4 gap-2 w-full transition-all duration-300
          ${highlightForm ? 'ring-4 ring-red-300 bg-red-50 animate-pulse' : ''}`}
      >
        <div className="flex flex-col col-span-4">
          <label className="text-sm font-semibold mb-1">Operator Callsign</label>
          <input
            name="remoteCallsign"
            placeholder="e.g. YO8UFO, OZ8UFO, etc"
            value={form.remoteCallsign}
            onChange={handleChange}
            className="border-2 border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 p-3 text-lg font-semibold rounded w-full"
          />
        </div>
        <select name="band" value={form.band} onChange={handleChange} className="border p-2">
          <option value="">Band</option>
          {['160m','80m','40m','20m','15m','10m','6m','2m','70cm'].map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select name="mode" value={form.mode} onChange={handleChange} className="border p-2">
          <option value="">Mode</option>
          {['SSB','CW','RTTY','AM','FM'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select name="rstSent" value={form.rstSent} onChange={handleChange} className="border p-2">
          <option value="">Signal Report (RST) Sent</option>
          {['59','58','57','56','55'].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select name="rstReceived" value={form.rstReceived} onChange={handleChange} className="border p-2">
          <option value="">Signal Report (RST) Received</option>
          {['59','58','57','56','55'].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <input
          name="qsoDate"
          type="datetime-local"
          value={form.qsoDate}
          onChange={handleChange}
          onFocus={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
          // eslint-disable-next-line react-hooks/purity
          max={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16)}
          className="border p-2 col-span-2 cursor-pointer"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 col-span-2 rounded font-semibold
                     transition-all duration-200 ease-in-out
                     hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
        >
          Save
        </button>
      </form>

      <h2 className="text-lg mt-6 mb-2">Your QSOs</h2>

      <div className="flex gap-4 mb-4">
        <select
          name="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'confirmed' | 'unconfirmed')}
          className="border p-2"
        >
          <option value="all">All</option>
          <option value="confirmed">Confirmed</option>
          <option value="unconfirmed">Unconfirmed</option>
        </select>

        <select
          name="dateFilter"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as 'recent' | 'older')}
          className="border p-2"
        >
          <option value="recent">Recent first</option>
          <option value="older">Older first</option>
        </select>
      </div>

      <ul className="space-y-2">
        {[...qsos]
          .filter((qso) => {
            if (statusFilter === 'confirmed') return qso.confirmed
            if (statusFilter === 'unconfirmed') return !qso.confirmed
            return true
          })
          .sort((a, b) => {
            // Explicit: unconfirmed always first
            if (!a.confirmed && b.confirmed) return -1
            if (a.confirmed && !b.confirmed) return 1

            // Within same group
            if (!a.confirmed && !b.confirmed) {
              // Unconfirmed → sort by qsoDate (newest first)
              return dateFilter === 'recent'
                ? new Date(b.qsoDate).getTime() - new Date(a.qsoDate).getTime()
                : new Date(a.qsoDate).getTime() - new Date(b.qsoDate).getTime()
            }

            // Confirmed → sort by confirmedAt if exists, else qsoDate
            const dateA = a.confirmedAt ? new Date(a.confirmedAt).getTime() : new Date(a.qsoDate).getTime()
            const dateB = b.confirmedAt ? new Date(b.confirmedAt).getTime() : new Date(b.qsoDate).getTime()

            return dateFilter === 'recent' ? dateB - dateA : dateA - dateB
          })
          .map((qso) => (
          <li key={qso._id} className="border-4 p-3 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <div>
                <strong>{qso.remoteCallsign}</strong> - {qso.band} - {qso.mode}
              </div>
              <div
                data-testid="qso-status"
                className={`px-3 py-1 rounded-full text-sm font-semibold
                  ${qso.confirmed
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-yellow-100 text-yellow-700 border border-yellow-300'}`}
              >
                {qso.confirmed ? 'Confirmed' : 'Not confirmed'}
              </div>
            </div>

            {/* Extra info if confirmed */}
            {qso.confirmed && (
              <div className="text-sm text-gray-600 space-y-2">
                <div>Distance: {qso.distanceKm ? qso.distanceKm.toFixed(1) : 'N/A'} km</div>
                <div>Confirmed at: {qso.confirmedAt ? new Date(qso.confirmedAt).toLocaleString() : 'N/A'}</div>
                <div>
                  From: {qso.from?.lat}, {qso.from?.lon} → To: {qso.to?.lat}, {qso.to?.lon}
                </div>

                {/* Leaflet Map */}
                {qso.from && qso.to && (
                  <div className="h-96 w-full rounded border overflow-hidden">
                    {/* Leaflet Map */}
                    <LeafletMap from={qso.from} to={qso.to} />
                  </div>
                )}
              </div>
            )}

            {!qso.confirmed && (
            <div className="flex gap-2 self-end">
              <button
                onClick={() => {
                    if (editingId === qso._id) {
                      setHighlightForm(true)
                      setTimeout(() => setHighlightForm(false), 600)
                      return
                    }

                    setEditingId(qso._id)
                    setHighlightForm(true)
                    setTimeout(() => setHighlightForm(false), 1500)
                    setForm({
                      remoteCallsign: qso.remoteCallsign,
                      band: qso.band,
                      mode: qso.mode,
                      rstSent: qso.rstSent || '',
                      rstReceived: qso.rstReceived || '',
                      qsoDate: qso.qsoDate.slice(0,16)
                    })
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                className="text-blue-500"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(qso._id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}