import { useEffect, useState } from 'react'
import { createQso, deleteQso, getQsos } from '../api/qso.api'
import type { Qso } from '../interfaces/qso.interface'
import { MapContainer as RLMapContainer, Marker, Polyline, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import AppShell from '../components/AppShell'
import { Badge, Button, Card, EmptyState, FieldLabel, Input, Select, StatTile, StatusBadge } from '../components/ui'

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

const bands: Array<Qso['band']> = ['160m', '80m', '40m', '20m', '15m', '10m', '6m', '2m', '70cm']
const modes: Array<Qso['mode']> = ['SSB', 'CW', 'RTTY', 'AM', 'FM']
const reports = ['59', '58', '57', '56', '55']
const ENTRY_PANEL_STORAGE_KEY = 'dashboard-entry-panel-open'
const GUIDE_PANEL_STORAGE_KEY = 'dashboard-guide-panel-open'
const LOG_PANEL_STORAGE_KEY = 'dashboard-log-panel-open'

function getStoredPanelState(key: string, fallback: boolean) {
  const storedValue = localStorage.getItem(key)
  if (storedValue === null) return fallback
  return storedValue === 'true'
}

function LeafletMap({ from, to }: { from: { lat: number; lon: number }; to: { lat: number; lon: number } }) {
  const center: [number, number] = [(from.lat + to.lat) / 2, (from.lon + to.lon) / 2]
  const toRad = (value: number) => (value * Math.PI) / 180
  const radius = 6371
  const dLat = toRad(to.lat - from.lat)
  const dLon = toRad(to.lon - from.lon)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = radius * c

  let zoom = 2
  if (distance < 200) zoom = 7
  else if (distance < 500) zoom = 6
  else if (distance < 1000) zoom = 5
  else if (distance < 3000) zoom = 4

  return (
    <Map center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[from.lat, from.lon]} />
      <Marker position={[to.lat, to.lon]} />
      <Polyline positions={[[from.lat, from.lon], [to.lat, to.lon]]} pathOptions={{ color: '#34d399', weight: 3 }} />
    </Map>
  )
}

export default function HomePage() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [highlightForm, setHighlightForm] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(() => getStoredPanelState(ENTRY_PANEL_STORAGE_KEY, true))
  const [isLogOpen, setIsLogOpen] = useState(() => getStoredPanelState(LOG_PANEL_STORAGE_KEY, true))
  const [isGuideOpen, setIsGuideOpen] = useState(() => getStoredPanelState(GUIDE_PANEL_STORAGE_KEY, true))
  const [isLoading, setIsLoading] = useState(true)
  const [qsos, setQsos] = useState<Qso[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'unconfirmed'>('all')
  const [dateFilter, setDateFilter] = useState<'recent' | 'older'>('recent')
  const [form, setForm] = useState({
    remoteCallsign: '',
    band: '' as Qso['band'] | '',
    mode: '' as Qso['mode'] | '',
    rstSent: '',
    rstReceived: '',
    qsoDate: '',
  })

  const resetForm = () => {
    setForm({
      remoteCallsign: '',
      band: '' as Qso['band'] | '',
      mode: '' as Qso['mode'] | '',
      rstSent: '',
      rstReceived: '',
      qsoDate: '',
    })
  }

  const loadQsos = async () => {
    const data = await getQsos()
    setQsos(data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadQsos()
  }, [])

  useEffect(() => {
    localStorage.setItem(ENTRY_PANEL_STORAGE_KEY, String(isFormOpen))
  }, [isFormOpen])

  useEffect(() => {
    localStorage.setItem(GUIDE_PANEL_STORAGE_KEY, String(isGuideOpen))
  }, [isGuideOpen])

  useEffect(() => {
    localStorage.setItem(LOG_PANEL_STORAGE_KEY, String(isLogOpen))
  }, [isLogOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
        await deleteQso(editingId)
      }

      await createQso(form)
    } catch {
      alert('Failed to save QSO')
      return
    }

    setEditingId(null)
    resetForm()
    await loadQsos()
  }

  const handleDelete = async (id: string) => {
    const ok = confirm('Are you sure you want to delete this QSO?')
    if (!ok) return

    await deleteQso(id)
    await loadQsos()
  }

  const toggleEntryPanel = () => {
    setIsFormOpen((current) => {
      const next = !current
      if (next) {
        setIsGuideOpen(false)
      }
      return next
    })
  }

  const toggleGuidePanel = () => {
    setIsGuideOpen((current) => {
      const next = !current
      if (next) {
        setIsFormOpen(false)
      }
      return next
    })
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

  const filteredQsos = [...qsos]
    .filter((qso) => {
      if (statusFilter === 'confirmed') return qso.confirmed
      if (statusFilter === 'unconfirmed') return !qso.confirmed
      return true
    })
    .sort((a, b) => {
      if (!a.confirmed && b.confirmed) return -1
      if (a.confirmed && !b.confirmed) return 1

      if (!a.confirmed && !b.confirmed) {
        return dateFilter === 'recent'
          ? new Date(b.qsoDate).getTime() - new Date(a.qsoDate).getTime()
          : new Date(a.qsoDate).getTime() - new Date(b.qsoDate).getTime()
      }

      const dateA = a.confirmedAt ? new Date(a.confirmedAt).getTime() : new Date(a.qsoDate).getTime()
      const dateB = b.confirmedAt ? new Date(b.confirmedAt).getTime() : new Date(b.qsoDate).getTime()

      return dateFilter === 'recent' ? dateB - dateA : dateA - dateB
    })

  const confirmedCount = qsos.filter((qso) => qso.confirmed).length
  const unconfirmedCount = qsos.length - confirmedCount

  return (
    <AppShell
      title="Signal Dashboard"
      eyebrow="Primary Console"
      description="Log new contacts, monitor matching confirmations, and review your most recent traffic."
      actions={
        editingId ? (
          <Button
            variant="secondary"
            onClick={() => {
              setEditingId(null)
              resetForm()
            }}
          >
            Cancel Edit
          </Button>
        ) : null
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total QSOs" value={qsos.length} hint="All logged contacts in this station log." />
        <StatTile label="Confirmed" value={confirmedCount} hint="Matched contacts confirmed by both operators." />
        <StatTile label="Pending" value={unconfirmedCount} hint="Waiting for a matching QSO from the remote station." />
        <StatTile
          label="Current Sort"
          value={dateFilter === 'recent' ? 'Recent First' : 'Older First'}
          hint={statusFilter === 'all' ? 'Showing all confirmation states.' : `Filter: ${statusFilter}`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.5fr)]">
        <div className="space-y-6 xl:sticky xl:top-5 xl:self-start">
          <Card className={highlightForm ? 'ring-2 ring-amber-300/60 shadow-[0_0_28px_rgba(245,158,11,0.18)]' : ''}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="label-caps mb-2">QSO Entry Panel</div>
                <h2 className="text-2xl font-semibold text-white">{editingId ? 'Edit Pending Contact' : 'Log New QSO'}</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Capture the exact contact details.
                </p>
              </div>
              <Button variant="secondary" type="button" onClick={toggleEntryPanel}>
                {isFormOpen ? 'Collapse' : 'Expand'}
              </Button>
            </div>

            {isFormOpen ? (
              <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FieldLabel>Operator Callsign</FieldLabel>
                  <Input
                    name="remoteCallsign"
                    placeholder="e.g. YO8UFO, OZ8UFO, etc"
                    value={form.remoteCallsign}
                    onChange={handleChange}
                    className="text-lg font-semibold uppercase text-radio"
                  />
                </div>

                <div>
                  <FieldLabel>Band</FieldLabel>
                  <Select name="band" value={form.band} onChange={handleChange}>
                    <option value="">Band</option>
                    {bands.map((band) => (
                      <option key={band} value={band}>
                        {band}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <FieldLabel>Mode</FieldLabel>
                  <Select name="mode" value={form.mode} onChange={handleChange}>
                    <option value="">Mode</option>
                    {modes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <FieldLabel>RST Sent</FieldLabel>
                  <Select name="rstSent" value={form.rstSent} onChange={handleChange}>
                    <option value="">Signal Report (RST) Sent</option>
                    {reports.map((report) => (
                      <option key={report} value={report}>
                        {report}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <FieldLabel>RST Received</FieldLabel>
                  <Select name="rstReceived" value={form.rstReceived} onChange={handleChange}>
                    <option value="">Signal Report (RST) Received</option>
                    {reports.map((report) => (
                      <option key={report} value={report}>
                        {report}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel>QSO Timestamp</FieldLabel>
                  <Input
                    name="qsoDate"
                    type="datetime-local"
                    value={form.qsoDate}
                    onChange={handleChange}
                    onFocus={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                    max={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex flex-wrap gap-3 sm:col-span-2">
                  <Button type="submit" className="min-w-[160px]">{editingId ? 'Save Replacement QSO' : 'Save QSO'}</Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-w-[140px]"
                    onClick={() => {
                      setEditingId(null)
                      resetForm()
                    }}
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            ) : null}
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="label-caps mb-2">Logging Guide</div>
                <h3 className="text-xl font-semibold text-white">Operator Notes</h3>
              </div>
              <Button variant="secondary" type="button" onClick={toggleGuidePanel}>
                {isGuideOpen ? 'Collapse' : 'Expand'}
              </Button>
            </div>

            {isGuideOpen ? (
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-slate-700/45 bg-slate-900/45 p-4">
                  <div className="label-caps mb-2">Matching Rule</div>
                  <p className="text-sm leading-6 text-slate-300">
                    A contact stays editable until the remote station logs a matching QSO. Once matched, it becomes confirmed and shows map data automatically.
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-400/18 bg-amber-400/7 p-4">
                  <div className="label-caps mb-2 text-amber-100">Best Practice</div>
                  <p className="text-sm leading-6 text-slate-300">
                    Keep callsigns exact and use the real contact timestamp. Small mismatches are the most common reason a pending QSO does not confirm.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-400/18 bg-emerald-400/7 p-4">
                  <div className="label-caps mb-2 text-emerald-100">Edit Flow</div>
                  <p className="text-sm leading-6 text-slate-300">
                    Selecting <span className="font-semibold text-white">Edit</span> loads the QSO back into the form above, so you can correct band, mode, reports, or time without changing the backend flow.
                  </p>
                </div>
              </div>
            ) : null}
          </Card>
        </div>

        <Card className="min-w-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="label-caps mb-2">Traffic Monitor</div>
              <h2 className="text-2xl font-semibold text-white">Recent Log Activity</h2>
              <p className="mt-2 text-sm text-slate-400">Unconfirmed contacts stay pinned first, then confirmed contacts sort by confirmation or QSO date.</p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[540px]">
              <div className="min-w-0">
                <FieldLabel>Status Filter</FieldLabel>
                <Select
                  name="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'confirmed' | 'unconfirmed')}
                  className="min-h-[52px] w-full min-w-0"
                >
                  <option value="all">All</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="unconfirmed">Unconfirmed</option>
                </Select>
              </div>
              <div className="min-w-0">
                <FieldLabel>Date Filter</FieldLabel>
                <Select
                  name="dateFilter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as 'recent' | 'older')}
                  className="min-h-[52px] w-full min-w-0"
                >
                  <option value="recent">Recent first</option>
                  <option value="older">Older first</option>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone="signal">{confirmedCount} Confirmed</Badge>
              <Badge tone="amber">{unconfirmedCount} Pending</Badge>
              <Badge>{filteredQsos.length} Visible</Badge>
            </div>
            <Button variant="secondary" type="button" onClick={() => setIsLogOpen((value) => !value)}>
              {isLogOpen ? 'Collapse' : 'Expand'}
            </Button>
          </div>

          {isLoading ? (
            <div className="mt-6 grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-3xl border border-slate-700/50 bg-slate-900/45 p-5">
                  <div className="h-4 w-28 rounded bg-slate-700/50" />
                  <div className="mt-4 h-7 w-44 rounded bg-slate-700/40" />
                  <div className="mt-4 h-20 rounded bg-slate-800/55" />
                </div>
              ))}
            </div>
          ) : isLogOpen ? (
            filteredQsos.length > 0 ? (
              <ul className="scrollbar-thin mt-6 grid gap-4">
                {filteredQsos.map((qso) => (
                  <li key={qso._id} className="rounded-[26px] border border-slate-700/50 bg-slate-950/35 p-4 transition hover:border-amber-400/20 hover:bg-slate-900/55">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="label-caps text-slate-500">Remote Station</div>
                          <Badge tone={qso.confirmed ? 'signal' : 'amber'}>{qso.confirmed ? 'Matched' : 'Awaiting Match'}</Badge>
                        </div>
                        <div className="mt-2 text-3xl font-semibold uppercase tracking-[0.08em] text-white text-radio">
                          {qso.remoteCallsign}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge>{qso.band}</Badge>
                          <Badge>{qso.mode}</Badge>
                          {qso.rstSent ? <Badge tone="amber">RST Sent {qso.rstSent}</Badge> : null}
                          {qso.rstReceived ? <Badge tone="amber">RST Rx {qso.rstReceived}</Badge> : null}
                        </div>
                        <div className="mt-4 text-sm text-slate-400">Logged {formatDate(qso.qsoDate)}</div>
                      </div>

                      <div className="flex flex-col gap-3 xl:items-end">
                        <StatusBadge confirmed={qso.confirmed} />
                        {!qso.confirmed ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => {
                                if (editingId === qso._id) {
                                  setHighlightForm(true)
                                  setTimeout(() => setHighlightForm(false), 600)
                                  return
                                }

                                setEditingId(qso._id)
                                setHighlightForm(true)
                                setIsFormOpen(true)
                                setTimeout(() => setHighlightForm(false), 1500)
                                setForm({
                                  remoteCallsign: qso.remoteCallsign,
                                  band: qso.band,
                                  mode: qso.mode,
                                  rstSent: qso.rstSent || '',
                                  rstReceived: qso.rstReceived || '',
                                  qsoDate: qso.qsoDate.slice(0, 16),
                                })
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                            >
                              Edit
                            </Button>
                            <Button type="button" variant="danger" onClick={() => handleDelete(qso._id)}>
                              Delete
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {qso.confirmed ? (
                      <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-emerald-400/18 bg-emerald-400/7 p-4">
                            <div className="label-caps text-emerald-100">Distance</div>
                            <div className="mt-2 text-2xl font-semibold text-white">
                              {qso.distanceKm ? qso.distanceKm.toFixed(1) : 'N/A'} km
                            </div>
                          </div>
                          <div className="rounded-2xl border border-slate-600/35 bg-slate-900/60 p-4">
                            <div className="label-caps">Confirmed At</div>
                            <div className="mt-2 text-sm font-medium text-slate-200">
                              {qso.confirmedAt ? formatDate(qso.confirmedAt) : 'N/A'}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-slate-600/35 bg-slate-900/60 p-4 sm:col-span-2">
                            <div className="label-caps">Path Data</div>
                            <div className="mt-2 text-sm text-slate-300">
                              From: {qso.from?.lat}, {qso.from?.lon}
                            </div>
                            <div className="text-sm text-slate-300">
                              To: {qso.to?.lat}, {qso.to?.lon}
                            </div>
                          </div>
                        </div>

                        {qso.from && qso.to ? (
                          <div className="h-72 overflow-hidden rounded-3xl border border-slate-700/40">
                            <LeafletMap from={qso.from} to={qso.to} />
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6">
                <EmptyState title="No QSOs match the current filters." description="Try a different confirmation filter or log a new contact to populate the dashboard." />
              </div>
            )
          ) : null}
        </Card>
      </div>
    </AppShell>
  )
}
