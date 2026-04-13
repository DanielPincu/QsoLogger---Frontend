import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginApi } from '../api/auth.api'
import type { LoginPayload } from '../interfaces/auth.interface'
import { useAuth } from '../auth/Session'

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-4">
      <h1 className="text-2xl mb-6">Login</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border p-2"
          required
        />

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white p-2"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="text-sm mt-2">
          Don't have an account?{' '}
          <span
            className="text-blue-600 cursor-pointer underline"
            onClick={() => navigate('/register')}
          >
            Register
          </span>
        </div>
      </form>
    </div>
  )
}