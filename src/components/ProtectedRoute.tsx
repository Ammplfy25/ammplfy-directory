import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

interface Props {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { session, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <Navigate to="/signin" replace />
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
