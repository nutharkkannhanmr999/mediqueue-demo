import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/PatientDashboard'
import BookToken from './pages/BookToken'
import MyTokens from './pages/MyTokens'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminPatients from './pages/AdminPatients'
import AdminQueue from './pages/AdminQueue'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950">
          <Navbar />
          <main>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Patient */}
              <Route path="/patient" element={
                <ProtectedRoute roles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/patient/book" element={
                <ProtectedRoute roles={['patient']}>
                  <BookToken />
                </ProtectedRoute>
              } />
              <Route path="/patient/my-tokens" element={
                <ProtectedRoute roles={['patient']}>
                  <MyTokens />
                </ProtectedRoute>
              } />

              {/* Doctor */}
              <Route path="/doctor" element={
                <ProtectedRoute roles={['doctor', 'admin']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />

              {/* Admin */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/patients" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminPatients />
                </ProtectedRoute>
              } />
              <Route path="/admin/queue" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminQueue />
                </ProtectedRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#14b8a6', secondary: '#0a0f1a' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#0a0f1a' },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
