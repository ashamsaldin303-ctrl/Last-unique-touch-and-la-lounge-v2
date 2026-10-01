'use client'

/**
 * BrandCurtain (audit P1.4) — a designed wipe between brand worlds.
 *
 * When the route crosses from one brand to another (e.g. LUT ivory →
 * La Lounge night), a full-screen panel in the INCOMING brand's signature
 * color sweeps down, holds for a beat while the theme tokens flip under
 * it, then sweeps away. Without it the palette flip feels like a channel
 * change; with it the transition reads as walking between boutiques.
 *
 * Honors prefers-reduced-motion (the panel simply never animates).
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from '@/lib/router'
import { resolveBrandFromPath, type BrandKey } from '@/lib/brand'

const CURTAIN_COLOR: Record<BrandKey, string> = {
  lut: '#0f0c07',
  lalounge: '#150912',
  birthday: '#17081f',
}

const CURTAIN_ACCENT: Record<BrandKey, string> = {
  lut: '#b8915a',
  lalounge: '#ff5ca8',
  birthday: '#ffd147',
}

export function BrandCurtain() {
  const { path } = useRouter()
  const brand = resolveBrandFromPath(path)
  const prevBrand = useRef<BrandKey>(brand)
  const [wiping, setWiping] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (prevBrand.current === brand) return
    prevBrand.current = brand
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Route-change triggered transition (external event → one-shot flag).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWiping(true)
    timers.current.push(setTimeout(() => setWiping(false), 700))
  }, [brand])

  return (
    <div
      className="brand-curtain"
      data-wiping={wiping ? 'true' : 'false'}
      style={{ backgroundColor: CURTAIN_COLOR[brand] }}
      aria-hidden="true"
    >
      <div className="curtain-mark">
        <span
          className="block size-2 rotate-45"
          style={{
            backgroundColor: CURTAIN_ACCENT[brand],
            boxShadow: `0 0 24px ${CURTAIN_ACCENT[brand]}`,
          }}
        />
      </div>
    </div>
  )
}
