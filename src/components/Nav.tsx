import { Link, useNavigate } from 'react-router-dom'
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
      <Link to="/" className="font-bold">
        QSO Logger
      </Link>

      <Link to="/about" className="hover:underline">
        About
      </Link>

      <Link to="/contact" className="hover:underline">
        Contact
      </Link>

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