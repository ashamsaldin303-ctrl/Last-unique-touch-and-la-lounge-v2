'use client'

/**
 * BrandVeil (Superlative Plan A1) — the opening ceremony.
 *
 * Once per session, the very first paint is a full-screen veil in the
 * incoming brand's night color: the brand monogram draws itself in a
 * single SVG stroke, a gold hairline grows beneath it, then the veil
 * lifts with a clip-path wipe to reveal the site. Luxury is decided in
 * the first 900ms — this makes them count.
 *
 * Skipped entirely under prefers-reduced-motion and on every subsequent
 * visit within the session (sessionStorage flag).
 */

import { useEffect, useState } from 'react'
import { useRouter } from '@/lib/router'
import { resolveBrandFromPath } from '@/lib/brand'
import { BrandMark } from '@/components/brand/brand-logo'

const VEIL_KEY = 'lut_veil_shown'

export function BrandVeil() {
  const { path } = useRouter()
  const brand = resolveBrandFromPath(path)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (window.sessionStorage.getItem(VEIL_KEY)) return
    window.sessionStorage.setItem(VEIL_KEY, '1')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // One-shot entrance flag synced from session storage (external store).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(true)
    const t = setTimeout(() => setActive(false), 1200)
    return () => clearTimeout(t)
  }, [])

  if (!active) return null

  return (
    <div className="brand-veil" data-brand={brand} aria-hidden="true">
      <BrandMark brand={brand} className="brand-veil-mark size-16" />
      <span className="brand-veil-line" />
    </div>
  )
}
