import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import AppShell from './components/layout/AppShell'

import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import MaterialManagement from './pages/MaterialManagement'
import StockIn from './pages/StockIn'
import StockOut from './pages/StockOut'
import TransactionHistory from './pages/TransactionHistory'
import Analytics from './pages/Analytics'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/materials" element={<MaterialManagement />} />
                <Route path="/stock-in" element={<StockIn />} />
                <Route path="/stock-out" element={<StockOut />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />

                <Route element={<AdminRoute />}>
                  <Route path="/history" element={<TransactionHistory />} />
                  <Route path="/notifications" element={<Notifications />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  )
}
