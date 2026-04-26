import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Note: Replace this clientId with your actual Google Cloud Client ID for it to fully work on production */}
    <GoogleOAuthProvider clientId="1029384756-dummy-client-id-for-demo.apps.googleusercontent.com">
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
