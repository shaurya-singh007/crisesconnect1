import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

import UIUXProProvider from './components/UIUXProProvider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="1029384756-dummy-client-id-for-demo.apps.googleusercontent.com">
      <AuthProvider>
        <SocketProvider>
          <UIUXProProvider>
            <App />
          </UIUXProProvider>
        </SocketProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
