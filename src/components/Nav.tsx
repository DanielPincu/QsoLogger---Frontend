import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Nav() {
  const [isLogged, setIsLogged] = useState(() => !!localStorage.getItem('token'))
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLogged(false)
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
        {isLogged ? (
          <button
            onClick={handleLogout}
            className="hover:underline"
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="hover:underline">
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}