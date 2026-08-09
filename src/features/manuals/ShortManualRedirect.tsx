import { Navigate, useParams } from 'react-router-dom'
import { getShortManualDestination } from './shortRoutes'

export function ShortManualRedirect() {
  const { shortCode } = useParams<{ shortCode: string }>()
  const destination = getShortManualDestination(shortCode)
  return <Navigate to={destination ?? '/manuales/enlace-no-encontrado'} replace />
}
