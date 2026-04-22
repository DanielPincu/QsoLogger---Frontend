import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginApi } from '../api/auth.api'
import type { LoginPayload } from '../interfaces/auth.interface'
import { useAuth } from '../auth/Session'
import AuthShell from '../components/AuthShell'
import { Button, FieldLabel, Input } from '../components/ui'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState<LoginPayload>({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginApi(form)
      localStorage.setItem('token', data.token)
      await login(data.token)
      navigate('/')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Operator Login"
      subtitle="Authenticate into your station console and continue exactly where your logbook left off."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <FieldLabel>Email</FieldLabel>
          <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        </div>

        <div>
          <FieldLabel>Password</FieldLabel>
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <div className="text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-emerald-300 transition hover:text-emerald-200">
            Register
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}
