import Nav from '../components/Nav'
import { useEffect, useState } from 'react'
import { createQso, getQsos, deleteQso } from '../api/qso.api'
import type { Qso } from '../interfaces/qso.interface'
import { MapContainer as RLMapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Map = RLMapContainer as unknown as React.FC<any>

function LeafletMap({ from, to }: { from: { lat: number; lon: number }; to: { lat: number; lon: number } }) {
  const center: [number, number] = [
    (from.lat + to.lat) / 2,
    (from.lon + to.lon) / 2
  ]

  return (
    <Map center={center} zoom={2} style={{ height: '100%', width: '100%' }}>
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
  const [qsos, setQsos] = useState<Qso[]>([])
  const [form, setForm] = useState({
    remoteCallsign: '',
    band: '',
    mode: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createQso(form)
    setForm({
      remoteCallsign: '',
      band: '',
      mode: '',
      rstSent: '',
      rstReceived: '',
      qsoDate: ''
    })
    // Refetch after submit
    const data = await getQsos()
    setQsos(data)
  }

  const handleDelete = async (id: string) => {
    await deleteQso(id)
    // Refetch after delete
    const data = await getQsos()
    setQsos(data)
  }

  return (
    <div className="p-4">
      <Nav />

      <h1 className="text-xl mb-4">Log QSO</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-sm">
        <input name="remoteCallsign" placeholder="Remote Callsign" value={form.remoteCallsign} onChange={handleChange} />
        <input name="band" placeholder="Band" value={form.band} onChange={handleChange} />
        <input name="mode" placeholder="Mode" value={form.mode} onChange={handleChange} />
        <input name="rstSent" placeholder="RST Sent" value={form.rstSent} onChange={handleChange} />
        <input name="rstReceived" placeholder="RST Received" value={form.rstReceived} onChange={handleChange} />
        <input name="qsoDate" type="datetime-local" value={form.qsoDate} onChange={handleChange} />

        <button type="submit" className="bg-green-600 text-white p-2">Save QSO</button>
      </form>

      <h2 className="text-lg mt-6 mb-2">Your QSOs</h2>

      <ul className="space-y-2">
        {qsos.map((qso) => (
          <li key={qso._id} className="border p-3 flex flex-col gap-1">
            <div className="flex justify-between">
              <div>
                <strong>{qso.remoteCallsign}</strong> - {qso.band} - {qso.mode}
              </div>
              <div className={qso.confirmed ? 'text-green-500' : 'text-yellow-500'}>
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
                  <div className="h-48 w-full rounded border overflow-hidden">
                    {/* Leaflet Map */}
                    <LeafletMap from={qso.from} to={qso.to} />
                  </div>
                )}
              </div>
            )}

            {!qso.confirmed && (
              <button
                onClick={() => handleDelete(qso._id)}
                className="text-red-500 self-end"
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}