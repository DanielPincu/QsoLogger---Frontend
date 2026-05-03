import { useEffect, useState } from 'react'
import { getOperator, updateMe } from '../api/operator.api'
import AppShell from '../components/AppShell'
import { Badge, Button, Card, FieldLabel, Input, SpinnerCard, StatTile } from '../components/ui'

export default function Profile() {
  const [form, setForm] = useState({
    callsign: '',
    email: '',
    locator: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOperator().then((data) => {
      setForm({
        callsign: data.callsign || '',
        email: data.email || '',
        locator: data.locator || '',
      })
      setLoading(false)
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    for (const [key, value] of Object.entries(form)) {
      if (value.trim() === '') {
        alert(`${key} cannot be empty`)
        return
      }

      if (key === 'locator') {
        const locatorRegex = /^[A-Za-z]{2}[0-9]{2}$/
        if (!locatorRegex.test(value)) {
          alert('Locator must be 2 letters followed by 2 numbers (e.g. JO45)')
          return
        }
      }
    }

    await updateMe(form)
    alert('Profile updated')
    window.location.reload()
  }

  if (loading) return <SpinnerCard label="Loading operator profile..." />

  return (
    <AppShell
      title="Operator Profile"
      eyebrow="Station Identity"
      description="Update your operator data, including callsign, email, and grid locator. This information is used for account management and station identification across the app."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Card>
            <div className="label-caps mb-3">Primary Callsign</div>
            <div className="text-4xl font-semibold uppercase tracking-[0.1em] text-emerald-200 text-radio">
              {form.callsign}
            </div>
            <p className="mt-4 text-sm text-slate-400">Presented as the active station identity across navigation and logging views.</p>
            <div className="mt-5">
              <Badge tone="amber" className="text-sm normal-case tracking-[0.14em]">
                Grid Locator: {form.locator}
              </Badge>
            </div>
          </Card>

          <StatTile label="Grid Locator" value={form.locator} hint="Format: Grid Locator: XX00" />
          <StatTile label="Operator Email" value={form.email} hint="Used for account access and station ownership." />
        </div>

        <Card>
          <div className="label-caps mb-2">Edit Details</div>
          <h2 className="text-2xl font-semibold text-white">Update Station Data</h2>
          <p className="mt-2 text-sm text-slate-400">All fields remain required, and the locator validation still expects two letters followed by two digits.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <FieldLabel>Callsign</FieldLabel>
              <Input name="callsign" value={form.callsign} onChange={handleChange} placeholder="Callsign" />
            </div>

            <div>
              <FieldLabel>Email</FieldLabel>
              <Input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
            </div>

            <div>
              <FieldLabel>Locator</FieldLabel>
              <Input name="locator" value={form.locator} onChange={handleChange} placeholder="Locator (e.g. JO45)" />
            </div>

            <Button type="submit">Save Profile</Button>
          </form>
        </Card>
      </div>
    </AppShell>
  )
}
