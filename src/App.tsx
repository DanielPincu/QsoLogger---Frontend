import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useAuth } from './auth/Session'

import HomePage from './routes/HomePage'
import About from './routes/Maidenhead'
import DX_Summary from './routes/DX_Summary'
import Login from './routes/Login'
import Register from './routes/Register'
import Profile from './routes/Profile'
import { SpinnerCard } from './components/ui'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <SpinnerCard label="Syncing operator session..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <HomePage />
      </RequireAuth>
    ),
  },
  {
    path: '/about',
    element: (
      <RequireAuth>
        <About />
      </RequireAuth>
    ),
  },
  {
    path: '/dx',
    element: (
      <RequireAuth>
        <DX_Summary />
      </RequireAuth>
    ),
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/profile',
    element: (
      <RequireAuth>
        <Profile />
      </RequireAuth>
    ),
  },



])

export default function App() {
  return <RouterProvider router={router} />
}
