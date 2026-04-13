import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register as registerApi } from '../api/auth.api'
import type { RegisterPayload } from '../interfaces/auth.interface'
import { useAuth } from '../auth/Session'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState<RegisterPayload>({
    callsign: '',
    email: '',
    password: '',
    locator: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const data = await registerApi(form)
      await login(data.token)
      navigate('/')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const backend = err?.response?.data

      let message = 'Registration failed'

      // handle different backend shapes
      if (typeof backend === 'string') {
        message = backend
      } else if (Array.isArray(backend?.errors)) {
        // prioritize detailed validation errors
        if (typeof backend.errors[0] === 'string') {
          message = backend.errors.join(', ')
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          message = backend.errors.map((e: any) => e.message).join(', ')
        }
      } else if (backend?.data?.message) {
        message = backend.data.message
      } else if (backend?.message) {
        message = backend.message
      } else if (backend?.error) {
        message = backend.error
      }

      console.log('REGISTER ERROR:', backend)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-4">
      <h1 className="text-2xl mb-6">Register</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="callsign"
          type="text"
          placeholder="Callsign"
          value={form.callsign}
          onChange={handleChange}
          className="border p-2"
          required
        />

        <input
          name="locator"
          type="text"
          placeholder="Locator"
          value={form.locator}
          onChange={handleChange}
          className="border p-2"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2"
          required
        />

      <div className="flex gap-2 items-center">
        <input
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border p-2 flex-1"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="text-sm underline"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>

      <input
        type={showPassword ? 'text' : 'password'}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="border p-2"
        required
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white p-2 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}