'use client'

/**
 * 404 — a branded moment, not a dead end (Superlative Plan B7).
 * Orbital rings spin around the active brand monogram over the ambient
 * gold backdrop; the numeral uses the fluid hero scale. All strings reuse
 * existing i18n keys (zero new message surface).
 */

import { motion } from 'framer-motion'
import { useRouter } from '@/lib/router'
import { useI18n } from '@/lib/i18n'
import { BrandLogo } from '@/components/brand/brand-logo'

export default function NotFoundPage() {
  const { navigate } = useRouter()
  const { t } = useI18n()
  return (
    <div className="relative flex min-h-[75vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="catalog-ambient" aria-hidden="true" />
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16 }}
          className="relative mb-8 flex size-28 items-center justify-center"
        >
          <span className="absolute inset-0 rounded-full border border-primary/20" aria-hidden="true" />
          <span
            className="absolute inset-2 animate-[spin_24s_linear_infinite] rounded-full border border-dashed border-primary/25"
            aria-hidden="true"
          />
          <span
            className="absolute inset-4 animate-[spin_14s_linear_infinite_reverse] rounded-full border border-double border-primary/15"
            aria-hidden="true"
          />
          <BrandLogo className="size-10 text-primary" />
        </motion.div>
        <p className="t-hero font-display tabular-nums text-primary/90" aria-hidden="true">
          404
        </p>
        <h1 className="t-h1 mt-2 font-display text-foreground">{t('common.notFound')}</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t('products.empty.subtitle')}
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-lux mt-8 min-h-[44px] cursor-pointer rounded-md border-0 px-8 py-3 text-sm font-semibold"
        >
          {t('cart.empty.cta')}
        </button>
      </div>
    </div>
  )
}
