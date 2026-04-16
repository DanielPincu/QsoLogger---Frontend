// src/routes/Profile.tsx

import { useEffect, useState } from 'react'
import { getOperator, updateMe } from '../api/operator.api'
import Nav from '../components/Nav'

export default function Profile() {
  const [form, setForm] = useState({
    callsign: '',
    email: '',
    locator: ''
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOperator().then(data => {
      setForm({
        callsign: data.callsign || '',
        email: data.email || '',
        locator: data.locator || ''
      })
      setLoading(false)
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // simple validation
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

  if (loading) return <div>Loading...</div>

  return (
    <div className='p-4'>
      <Nav />
      <div className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-xl font-bold">My Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="callsign"
          value={form.callsign}
          onChange={handleChange}
          placeholder="Callsign"
          className="w-full p-2 border"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border"
        />

        <input
          name="locator"
          value={form.locator}
          onChange={handleChange}
          placeholder="Locator (e.g. JO45)"
          className="w-full p-2 border"
        />


        <button className="bg-black text-white px-4 py-2">
          Save
        </button>
      </form>
      </div>
    </div>
  )
}