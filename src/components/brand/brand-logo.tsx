'use client'

/**
 * Brand monograms (audit P1.6) — vector identities for the three houses.
 *
 * Each mark is a single geometric signature drawn in currentColor plus a
 * brand accent, so it inherits navbar/footer theming automatically and
 * ships zero image payload:
 *
 *  · LUT        — a cut diamond facet (the "last unique touch" stone)
 *  · La Lounge  — a low crescent lounger with a mood-light dot
 *  · Birthday   — a candle flame star over a gift band
 *
 * Usage: <BrandLogo brand="lut" className="size-6" />
 */

import { useRouter } from '@/lib/router'
import { resolveBrandFromPath } from '@/lib/brand'
import { cn } from '@/lib/utils'

export type Brand = 'lut' | 'lalounge' | 'birthday'

const ACCENT: Record<Brand, string> = {
  lut: '#b8915a',
  lalounge: '#ff5ca8',
  birthday: '#ffd147',
}

function LutMark({ accent }: { accent: string }) {
  return (
    <>
      <path
        d="M12 2.6 20 9l-8 12.4L4 9l8-6.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M4 9h16M12 2.6 8.6 9l3.4 12.4L15.4 9 12 2.6Z" fill="none" stroke={accent} strokeWidth="0.9" strokeLinejoin="round" />
    </>
  )
}

function LaLoungeMark({ accent }: { accent: string }) {
  return (
    <>
      <path
        d="M3.4 15.2c0-4.6 3.9-8.4 8.6-8.4s8.6 3.8 8.6 8.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M3.4 18.4h17.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="12" cy="4.6" r="1.7" fill={accent} />
    </>
  )
}

function BirthdayMark({ accent }: { accent: string }) {
  return (
    <>
      <path
        d="M12 3.2c1.9 2.2 2.9 3.9 2.9 5.4a2.9 2.9 0 1 1-5.8 0c0-1.5 1-3.2 2.9-5.4Z"
        fill={accent}
        stroke="none"
      />
      <path d="M6.4 20.8v-6.2h11.2v6.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6.4 17.4h11.2" stroke={accent} strokeWidth="0.9" />
    </>
  )
}

export function BrandMark({ brand, className }: { brand: Brand; className?: string }) {
  const accent = ACCENT[brand]
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn('size-6 shrink-0', className)}
    >
      {brand === 'lut' && <LutMark accent={accent} />}
      {brand === 'lalounge' && <LaLoungeMark accent={accent} />}
      {brand === 'birthday' && <BirthdayMark accent={accent} />}
    </svg>
  )
}

/** Convenience wrapper that resolves the active brand from the route. */
export function BrandLogo({ className }: { className?: string }) {
  const { path } = useRouter()
  const brand = resolveBrandFromPath(path)
  return <BrandMark brand={brand} className={className} />
}
