import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useAuth } from './auth/Session'

import HomePage from './routes/HomePage'
import About from './routes/About'
import Contact from './routes/Contact'
import Login from './routes/Login'
import Register from './routes/Register'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return null
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
    path: '/contact',
    element: (
      <RequireAuth>
        <Contact />
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
])

export default function App() {
  return <RouterProvider router={router} />
}