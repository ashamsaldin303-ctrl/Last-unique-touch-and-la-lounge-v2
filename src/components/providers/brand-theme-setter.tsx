'use client'

/**
 * Sets data-brand + lang + dir on <html> whenever the route/locale changes,
 * plus scroll-to-top on navigation. Mirrors the original repo's
 * BrandThemeSetter (src/components/providers/brand-theme-setter.tsx).
 */

import { useEffect } from 'react'
import { useRouter } from '@/lib/router'
import { resolveBrandFromPath } from '@/lib/brand'
import { useTheme } from 'next-themes'

export function BrandThemeSetter() {
  const { path, locale } = useRouter()
  const { setTheme, resolvedTheme } = useTheme() as {
    setTheme: (theme: string) => void
    resolvedTheme: string | undefined
  }

  useEffect(() => {
    const brand = resolveBrandFromPath(path)
    const html = document.documentElement
    html.dataset.brand = brand
    html.lang = locale
    html.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [path, locale])

  /* Scroll restoration + focus management (Superlative Plan A2):
     each path remembers its scroll Y within the session — returning via
     back button lands you where you were; first visits start at top.
     Focus moves to #main-content so assistive tech announces the page. */
  useEffect(() => {
    const KEY = 'lut_scroll_map'
    const norm = (loc: string, p: string) => `#/${loc}${p === '/' ? '' : p}`
    const readMap = (): Record<string, number> => {
      try {
        return JSON.parse(window.sessionStorage.getItem(KEY) ?? '{}') as Record<string, number>
      } catch {
        return {}
      }
    }
    const rawHash = window.location.hash.split('?')[0]
    let currentKey = rawHash || '#/ar'
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const map = readMap()
        map[currentKey] = window.scrollY
        window.sessionStorage.setItem(KEY, JSON.stringify(map))
        ticking = false
      })
    }
    const onNavigate = (e: Event) => {
      const detail = (e as CustomEvent).detail as { locale?: string; path?: string } | undefined
      const nextKey = norm(detail?.locale ?? 'ar', detail?.path ?? '/')
      const map = readMap()
      const restore = map[nextKey]
      currentKey = nextKey
      window.scrollTo({ top: restore ?? 0, behavior: 'instant' as ScrollBehavior })
      requestAnimationFrame(() => {
        document.getElementById('main-content')?.focus({ preventScroll: true })
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('lut:navigate', onNavigate)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('lut:navigate', onNavigate)
    }
  }, [])

  // La Lounge + Birthday brand pages are best experienced in their
  // canonical light/dark identity — but we never override an explicit
  // user choice, so only align on first mount.
  useEffect(() => {
    // no-op: theme remains user-controlled via navbar toggle
    void resolvedTheme
    void setTheme
  }, [resolvedTheme, setTheme])

  return null
}
