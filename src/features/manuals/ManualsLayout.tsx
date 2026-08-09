import { Outlet } from 'react-router-dom'
import { ManualBreadcrumbs } from './ManualBreadcrumbs'
import { ManualIndex } from './ManualIndex'

export function ManualsLayout() {
  return (
    <div className="manual-shell md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8 lg:gap-10">
      <ManualIndex />
      <div className="min-w-0">
        <ManualBreadcrumbs />
        <Outlet />
      </div>
    </div>
  )
}
