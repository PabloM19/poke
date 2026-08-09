import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getManualReadingProgress, recordReadingPosition } from './readingProgress'

interface RestoreReadingState {
  restoreReading?: boolean
}

function pageProgress(): number {
  const maximum = document.documentElement.scrollHeight - window.innerHeight
  return maximum <= 0 ? 1 : Math.max(0, Math.min(1, window.scrollY / maximum))
}

export function ManualReadingTracker() {
  const location = useLocation()
  const [contentRevision, setContentRevision] = useState(0)

  useEffect(() => {
    const article = document.querySelector('main article')
    if (!article) {
      const main = document.querySelector('main')
      if (!main || typeof MutationObserver === 'undefined') return
      const observer = new MutationObserver(() => {
        if (document.querySelector('main article')) {
          observer.disconnect()
          setContentRevision((value) => value + 1)
        }
      })
      observer.observe(main, { childList: true, subtree: true })
      return () => observer.disconnect()
    }
    const headings = [...article.querySelectorAll<HTMLElement>('h2, h3')]
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `lectura-${index + 1}`
      heading.classList.add('scroll-mt-24')
    })

    let activeHeading: HTMLElement | null = headings[0] ?? null
    let writeTimer: number | null = null
    const write = () => {
      writeTimer = null
      recordReadingPosition(location.pathname, {
        sectionId: activeHeading?.id ?? null,
        sectionTitle: activeHeading?.textContent?.trim().slice(0, 120) || null,
        progress: pageProgress(),
      })
    }
    const scheduleWrite = () => {
      if (writeTimer != null) return
      writeTimer = window.setTimeout(write, 800)
    }

    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]?.target instanceof HTMLElement) {
        activeHeading = visible[0].target
        scheduleWrite()
      }
    }, { rootMargin: '-18% 0px -68% 0px', threshold: 0 })
    headings.forEach((heading) => observer?.observe(heading))

    const handleScroll = () => scheduleWrite()
    const flushIfHidden = () => {
      if (document.visibilityState === 'hidden') write()
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('pagehide', write)
    document.addEventListener('visibilitychange', flushIfHidden)

    const state = location.state as RestoreReadingState | null
    if (state?.restoreReading) {
      const saved = getManualReadingProgress().entries.find((entry) => entry.path === location.pathname)
      window.setTimeout(() => {
        const anchor = location.hash ? document.getElementById(location.hash.slice(1)) : null
        if (anchor) anchor.scrollIntoView({ block: 'start' })
        else if (saved) {
          const maximum = document.documentElement.scrollHeight - window.innerHeight
          window.scrollTo({ top: Math.max(0, maximum * saved.progress) })
        }
      }, 80)
    }
    scheduleWrite()

    return () => {
      if (writeTimer != null) window.clearTimeout(writeTimer)
      write()
      observer?.disconnect()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('pagehide', write)
      document.removeEventListener('visibilitychange', flushIfHidden)
    }
  }, [contentRevision, location.hash, location.pathname, location.state])

  return null
}
