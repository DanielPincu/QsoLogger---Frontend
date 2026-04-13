import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { SessionProvider } from './auth/Session'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <SessionProvider>
      <App />
    </SessionProvider>
  </React.StrictMode>
)