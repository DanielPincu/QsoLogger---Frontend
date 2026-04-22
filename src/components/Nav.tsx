import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/Session'
import { Button, cn } from './ui'

const navItems = [
  { to: '/', label: 'Dashboard', freq: 'Main Log' },
  { to: '/dx', label: 'DX Summary', freq: 'Distance' },
  { to: '/about', label: 'Grid Map', freq: 'Locator' },
]

function RadioLogo() {
  return (
    <div className="relative flex h-14 w-16 items-center justify-center">
      <svg viewBox="0 0 88 72" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="beam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="55%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
        </defs>
        <path d="M11 57h66" stroke="rgba(148,163,184,0.45)" strokeWidth="4" strokeLinecap="round" />
        <path d="M44 16v41" stroke="url(#beam)" strokeWidth="6" strokeLinecap="round" />
        <path d="M24 50 44 16 64 50" fill="none" stroke="url(#beam)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M56 24c8 2 14 8 17 16" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
        <path d="M63 13c10 3 18 12 22 22" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      </svg>
      <div className="absolute -bottom-1 left-1/2 h-2 w-10 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-md" />
    </div>
  )
}

export default function Nav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isProfileActive = location.pathname === '/profile'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="radio-panel panel-padding">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-[24px] border border-emerald-400/15 bg-slate-950/35 px-2 py-1 shadow-[0_0_28px_rgba(52,211,153,0.12)]">
              <RadioLogo />
            </div>
            <div>
              <div className="label-caps mb-2">QSO Logger</div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-xl font-semibold text-white sm:text-2xl">Operator Console</div>
                <span className="rounded-full border border-amber-400/20 bg-amber-400/8 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-amber-100">
                  Station Live
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">Instrument-style control deck for logging, matching, and locator workflows.</p>
            </div>
          </div>

          {user ? (
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <Link
                to="/profile"
                className={cn(
                  'rounded-[24px] border px-4 py-3 transition duration-200 cursor-pointer',
                  isProfileActive
                    ? 'border-emerald-400/30 bg-emerald-400/12 shadow-[0_0_22px_rgba(52,211,153,0.14)]'
                    : 'border-amber-400/20 bg-amber-400/8 hover:border-amber-300/40 hover:bg-amber-400/12',
                )}
              >
                <div className={cn('label-caps', isProfileActive ? 'text-emerald-100' : 'text-amber-100')}>
                  Active Operator
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <div className="text-xl font-semibold uppercase text-white text-radio">{user.callsign || user.email}</div>
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em]',
                      isProfileActive
                        ? 'border-emerald-300/35 bg-emerald-300/12 text-emerald-100'
                        : 'border-slate-400/20 bg-slate-200/5 text-slate-300',
                    )}
                  >
                    {isProfileActive ? 'Open' : 'Profile'}
                  </span>
                </div>
                <div className={cn('mt-1 text-sm', isProfileActive ? 'text-emerald-100/80' : 'text-amber-100/80')}>
                  Grid Locator: {user.locator}
                </div>
              </Link>
              <Button variant="secondary" onClick={handleLogout} className="h-full min-w-[120px]">
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

        <div className="grid gap-2 md:grid-cols-3">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {({ isActive }) => (
                <div className="nav-chip" data-active={isActive ? 'true' : 'false'}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="label-caps mb-0">{item.freq}</div>
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em]',
                        isActive
                          ? 'border-emerald-300/35 bg-emerald-300/12 text-emerald-100'
                          : 'border-amber-200/15 bg-white/3 text-slate-300',
                      )}
                    >
                      {isActive ? 'Current' : 'Open'}
                    </span>
                  </div>
                  <div className={cn('mt-2 text-base font-semibold', isActive ? 'text-emerald-200' : 'text-slate-100')}>
                    {item.label}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">Tap to open this view</div>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
