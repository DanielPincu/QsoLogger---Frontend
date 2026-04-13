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
      await createQso(form)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert('Failed to create QSO')
      return
    }

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
    await deleteQso(id)
    // Refetch after delete
    const data = await getQsos()
    setQsos(data)
  }

    return (
    <div className="w-full p-4">
      <Nav />

      <h1 className="text-xl mb-4">Log QSO</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-2 w-full">
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
          max={new Date().toISOString().slice(0,16)}
          className="border p-2 col-span-2 cursor-pointer"
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 col-span-2">Save</button>
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