import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    const redirect = user.role === 'patient' ? '/patient' : user.role === 'doctor' ? '/doctor' : '/admin'
    return <Navigate to={redirect} replace />
  }

  return children
}
