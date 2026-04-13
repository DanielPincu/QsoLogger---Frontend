import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/Session'

export default function Nav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="p-4 border-b flex gap-6 items-center">
      <NavLink to="/" className={({ isActive }) => isActive ? 'font-bold underline' : 'font-bold'}>
        Home
      </NavLink>

      <NavLink to="/dx" className={({ isActive }) => isActive ? 'underline font-semibold' : 'hover:underline'}>
        DX Summary
      </NavLink>

      <NavLink to="/about" className={({ isActive }) => isActive ? 'underline font-semibold' : 'hover:underline'}>
        Grid Locator Info
      </NavLink>

      <div className="ml-auto">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm">
              {user.callsign || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="hover:underline"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}