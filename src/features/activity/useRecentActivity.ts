import { useEffect, useState } from 'react'
import { getRecentActivity, RECENT_ACTIVITY_EVENT, type RecentActivity } from './recentActivity'

export function useRecentActivity(): readonly RecentActivity[] {
  const [items, setItems] = useState<readonly RecentActivity[]>(() => getRecentActivity())

  useEffect(() => {
    const update = () => setItems([...getRecentActivity()])
    window.addEventListener(RECENT_ACTIVITY_EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(RECENT_ACTIVITY_EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [])

  return items
}

