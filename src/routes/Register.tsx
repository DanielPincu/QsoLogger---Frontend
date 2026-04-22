import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerApi } from '../api/auth.api'
import type { RegisterPayload } from '../interfaces/auth.interface'
import { useAuth } from '../auth/Session'
import AuthShell from '../components/AuthShell'
import { Button, FieldLabel, Input } from '../components/ui'

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
    } catch (err: unknown) {
      const backend = (err as { response?: { data?: unknown } })?.response?.data
      let message = 'Registration failed'

      if (typeof backend === 'string') {
        message = backend
      } else if (Array.isArray((backend as { errors?: unknown[] } | undefined)?.errors)) {
        const errors = (backend as { errors: unknown[] }).errors
        if (typeof errors[0] === 'string') {
          message = errors.join(', ')
        } else {
          message = errors
            .map((item) => (item && typeof item === 'object' && 'message' in item ? String(item.message) : 'Validation error'))
            .join(', ')
        }
      } else if (backend && typeof backend === 'object' && 'data' in backend && backend.data && typeof backend.data === 'object' && 'message' in backend.data) {
        message = String(backend.data.message)
      } else if (backend && typeof backend === 'object' && 'message' in backend) {
        message = String(backend.message)
      } else if (backend && typeof backend === 'object' && 'error' in backend) {
        message = String(backend.error)
      }

      console.log('REGISTER ERROR:', backend)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Register Station"
      subtitle="Create your operator profile with callsign, locator, and credentials for the same backend flow already in place."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel>Callsign</FieldLabel>
            <Input name="callsign" type="text" placeholder="Callsign" value={form.callsign} onChange={handleChange} required />
          </div>
          <div>
            <FieldLabel>Locator</FieldLabel>
            <Input name="locator" type="text" placeholder="Locator" value={form.locator} onChange={handleChange} required />
          </div>
        </div>

        <div>
          <FieldLabel>Email</FieldLabel>
          <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        </div>

        <div>
          <FieldLabel>Password</FieldLabel>
          <div className="flex gap-2">
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="flex-1"
              required
            />
            <Button type="button" variant="secondary" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>

        <div>
          <FieldLabel>Confirm Password</FieldLabel>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Registering...' : 'Register'}
        </Button>

        <div className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-300 transition hover:text-emerald-200">
            Login
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}
