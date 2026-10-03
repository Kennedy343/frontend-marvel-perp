import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'

function ProtectedRoute() {
  const accessToken = useAuthStore((state) => state.accessToken)

  if (!accessToken) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute