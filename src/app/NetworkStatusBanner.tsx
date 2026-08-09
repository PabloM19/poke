import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function NetworkStatusBanner() {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  if (online) return null
  return (
    <div className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm" role="status">
      <div className="mx-auto flex max-w-4xl items-center gap-2"><WifiOff className="size-4 shrink-0" aria-hidden /><span><strong>Sin conexión.</strong> El manual y los datos locales siguen disponibles; los datos de PokeAPI pueden necesitar reintento.</span></div>
    </div>
  )
}
