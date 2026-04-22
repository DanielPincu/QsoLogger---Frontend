import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/Session'
import { Button, cn } from './ui'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/dx', label: 'DX Summary' },
  { to: '/about', label: 'Grid Map' },
]

export default function Nav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="radio-panel panel-padding">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 text-lg font-bold text-emerald-200 shadow-[0_0_22px_rgba(52,211,153,0.15)]">
              RF
            </div>
            <div>
              <div className="label-caps mb-2">QSO Logger</div>
              <div className="text-xl font-semibold text-white">Operator Console</div>
              <p className="mt-1 text-sm text-slate-400">Live logging, confirmations, and DX tracking in one panel.</p>
            </div>
          </div>

          {user ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/profile"
                className="rounded-2xl border border-amber-400/25 bg-amber-400/8 px-4 py-3 transition hover:border-amber-300/40 hover:bg-amber-400/12"
              >
                <div className="label-caps text-amber-100">Active Operator</div>
                <div className="mt-1 text-xl font-semibold text-white text-radio">{user.callsign || user.email}</div>
                <div className="mt-1 text-sm text-amber-100/80">Grid Locator: {user.locator}</div>
              </Link>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.12)]'
                    : 'border border-slate-600/40 bg-slate-900/45 text-slate-300 hover:border-amber-400/30 hover:text-white',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
