import { Outlet } from 'react-router-dom'
import { ManualBreadcrumbs } from './ManualBreadcrumbs'
import { ManualIndex } from './ManualIndex'

export function ManualsLayout() {
  return (
    <div className="md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:gap-8">
      <ManualIndex />
      <div className="min-w-0">
        <ManualBreadcrumbs />
        <Outlet />
      </div>
    </div>
  )
}
