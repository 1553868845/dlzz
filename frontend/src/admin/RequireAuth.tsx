import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function RequireAuth() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/admin/login" replace />
  return <Outlet />
}
