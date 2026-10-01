'use client'

/**
 * Hash-based multi-page router.
 *
 * Reproduces the ORIGINAL repo's page structure exactly
 * (src/app/[locale]/...) inside the single visible Next.js route:
 *
 *   #/ar                          → home (brand selector)
 *   #/ar/last-unique-touch        → LUT brand page
 *   #/ar/la-lounge                → La Lounge brand page
 *   #/ar/la-lounge/custom-furniture | event-planning | ready-plans
 *   #/ar/your-birthday            → Your Birthday brand page
 *   #/ar/products  #/ar/products/[slug]   (filters live in ?query)
 *   #/ar/cart  #/ar/checkout  #/ar/checkout/payment  #/ar/checkout/success
 *   #/ar/about  #/ar/contact  #/ar/privacy  #/ar/terms  #/ar/refund
 *   (same for /en)
 *
 * Browser back/forward + deep links work via hashchange/popstate.
 *
 * AUDIT UPGRADES (P0.4 / P2.2):
 *  - `query` is now first-class state so catalog filters can live in the
 *    URL (shareable, back-button friendly).
 *  - Per-route `document.title` + meta description + canonical + og:title
 *    management — previously the tab title never changed anywhere.
 *    (Full migration to real App Router routes remains the end goal.)
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_LOCALE, type Locale, useI18n } from '@/lib/i18n'

export interface RouteState {
  locale: Locale
  /** Locale-stripped path, always starts with '/' */
  path: string
  /** Raw query string without '?' (catalog filter state) */
  query: string
}

const LOCALES: Locale[] = ['ar', 'en']

function parseHash(hash: string): RouteState {
  // hash like "#/ar/products/louis-ghost-chair" or "#/en" or "#/ar/products?q=chair"
  const raw = hash.replace(/^#/, '')
  const [rawPath, rawQuery = ''] = raw.split('?')
  if (!rawPath || rawPath === '/') return { locale: DEFAULT_LOCALE, path: '/', query: rawQuery }
  const parts = rawPath.replace(/^\//, '').split('/')
  if (parts.length > 0 && LOCALES.includes(parts[0] as Locale)) {
    const locale = parts[0] as Locale
    const rest = parts.slice(1).join('/')
    return { locale, path: rest ? `/${rest}` : '/', query: rawQuery }
  }
  return { locale: DEFAULT_LOCALE, path: `/${parts.join('/')}`, query: rawQuery }
}

interface RouterContextValue extends RouteState {
  navigate: (path: string, locale?: Locale, query?: string) => void
  /** Build a full hash href for links */
  href: (path: string, locale?: Locale, query?: string) => string
}

const RouterContext = createContext<RouterContextValue | null>(null)

/* ============================================================
   ROUTE META — per-path titles & descriptions (ar/en).
   Keys are locale-stripped paths; '/products/*' falls back to
   '/products/[slug]'; unknown paths fall back to their brand root.
   ============================================================ */

type MetaEntry = { title: string; desc: string }
const META: Record<Locale, Record<string, MetaEntry>> = {
  ar: {
    '/': {
      title: 'Last Unique Touch — اختر تجربتك | تأجير أثاث فاخر للفعاليات في الكويت',
      desc: 'ثلاث علامات فاخرة تحت سقف واحد: أثاث تراثي، لاونجات عصرية، وتجهيزات أعياد ميلاد — للتأجير في الكويت.',
    },
    '/last-unique-touch': {
      title: 'Last Unique Touch — اللمسة الأخيرة الفريدة | أثاث تراثي فاخر',
      desc: 'كراسي شيفاري، طاولات ولائم، ثريات كريستال وقطع تراثية فاخرة لإعارس ومناسبات الكويت.',
    },
    '/last-unique-touch/contact': {
      title: 'تواصل مع Last Unique Touch | استشارة تأجير مجانية',
      desc: 'احجز استشارة تأجير أثاث فاخر — واتساب، هاتف، أو إنستغرام.',
    },
    '/la-lounge': {
      title: 'La Lounge — لاونج عصري وإضاءة مزاجية | تأجير فعاليات الكويت',
      desc: 'جلسات لاونج فاخرة، إضاءة LED مزاجية، وتصنيع أثاث مخصص حسب طلبك.',
    },
    '/la-lounge/custom-furniture': {
      title: 'تصنيع أثاث مخصص — La Lounge | قطع تُصنع لمناسبتك',
      desc: 'نصنع لك قطع اللاونج والأثاث حسب المقاس واللون والهوية التي تريدها.',
    },
    '/la-lounge/event-planning': {
      title: 'تخطيط وتنفيذ فعاليات — La Lounge | من الفكرة إلى الليلة الكبرى',
      desc: 'فريق متكامل لتخطيط وتصميم وتنفيذ فعالياتك الخاصة في الكويت.',
    },
    '/la-lounge/ready-plans': {
      title: 'باقات جاهزة للتنفيذ — La Lounge | خطط مجرّبة وأسعار واضحة',
      desc: 'باقات لاونج وإضاءة جاهزة للتنفيذ الفوري لمناسبتك.',
    },
    '/la-lounge/contact': {
      title: 'تواصل مع La Lounge | عرض سعر لجلسات وإضاءة',
      desc: 'اطلب عرض سعر لجلسات اللاونج والإضاءة المزاجية لفعاليتك.',
    },
    '/your-birthday': {
      title: 'Your Birthday — تجهيزات أعياد ميلاد فاخرة | الكويت',
      desc: 'ديكور، طاولات حلويات، إضاءة ذهبية وباقات احتفال كاملة لأعياد الميلاد.',
    },
    '/your-birthday/features': {
      title: 'مميزات Your Birthday | لماذا نحتفل معك بشكل مختلف',
      desc: 'تفاصيل الاحتفال الفاخر: تنسيق كامل، تسليم وتركيب، والتزام بالموعد.',
    },
    '/your-birthday/products': {
      title: 'قطع الاحتفال — Your Birthday | تأجير ديكور أعياد الميلاد',
      desc: 'تصفّح قطع ديكور وتجهيزات أعياد الميلاد المتاحة للتأجير.',
    },
    '/your-birthday/contact': {
      title: 'تواصل مع Your Birthday | جهّز احتفالك الآن',
      desc: 'احجز باقة احتفال عيد ميلاد كاملة أو اطلب تنسيقاً مخصصاً.',
    },
    '/products': {
      title: 'المقتنيات — كتالوج التأجير | Last Unique Touch الكويت',
      desc: 'كتالوج التأجير الكامل: كراسي، طاولات، ثريات، وإضاءة فاخرة بأسعار يومية بالدينار الكويتي.',
    },
    '/products/[slug]': {
      title: 'تفاصيل القطعة — كتالوج التأجير | Last Unique Touch',
      desc: 'المواصفات، السعر اليومي، التأمين، والتوافر المباشر للقطعة.',
    },
    '/cart': {
      title: 'سلة التأجير | Last Unique Touch',
      desc: 'راجع قطعك المختارة، مدد التأجير، والإجمالي قبل إتمام الطلب.',
    },
    '/checkout': {
      title: 'إتمام الطلب | Last Unique Touch',
      desc: 'أكّد بيانات التوصيل وتفاصيل تأجيرك بأمان — الأسعار تُحتسب في الخادم.',
    },
    '/checkout/payment': {
      title: 'تأكيد الدفع | Last Unique Touch',
      desc: 'اختر طريقة الدفع المناسبة: KNET، تحويل بنكي، أو دفع عند التسليم.',
    },
    '/checkout/success': {
      title: 'تم استلام طلبك | شكراً لثقتك',
      desc: 'وصلنا طلبك وسيتواصل معك فريق الكونسيرج لتأكيد التفاصيل.',
    },
    '/about': {
      title: 'قصتنا — ثلاث علامات ورؤية واحدة | Last Unique Touch',
      desc: 'من الكويت: قصة بيت فاخر لتأجير الأثاث وتجهيز الفعاليات بثلاث علامات.',
    },
    '/contact': {
      title: 'تواصل معنا | Last Unique Touch الكويت',
      desc: 'فريق الكونسيرج جاهز لاستفسارك — واتساب، هاتف، أو بريداً.',
    },
    '/privacy': { title: 'سياسة الخصوصية | Last Unique Touch', desc: 'كيف نحمي بياناتك ونستخدمها.' },
    '/terms': { title: 'الشروط والأحكام | Last Unique Touch', desc: 'شروط التأجير والطلبات والتوصيل.' },
    '/refund': { title: 'سياسة الاسترجاع | Last Unique Touch', desc: 'شروط الإلغاء والاسترجاع للطلبات.' },
  },
  en: {
    '/': {
      title: 'Last Unique Touch — Choose Your Experience | Luxury Event Rental Kuwait',
      desc: 'Three luxury houses under one roof: heritage furniture, modern lounges and birthday setups — for rent in Kuwait.',
    },
    '/last-unique-touch': {
      title: 'Last Unique Touch — Heritage Luxury Furniture Rental',
      desc: 'Chiavari chairs, banquet tables, crystal chandeliers and heritage pieces for Kuwait’s finest weddings.',
    },
    '/last-unique-touch/contact': {
      title: 'Contact Last Unique Touch | Free Rental Consultation',
      desc: 'Book a luxury furniture rental consultation — WhatsApp, phone or Instagram.',
    },
    '/la-lounge': {
      title: 'La Lounge — Modern Lounge Seating & Mood Lighting Rental',
      desc: 'Premium lounge sets, LED mood lighting and bespoke furniture manufacturing.',
    },
    '/la-lounge/custom-furniture': {
      title: 'Custom Furniture Manufacturing — La Lounge',
      desc: 'Pieces built to your measurements, colors and brand identity.',
    },
    '/la-lounge/event-planning': {
      title: 'Event Planning & Execution — La Lounge',
      desc: 'A full team to plan, design and execute your private events in Kuwait.',
    },
    '/la-lounge/ready-plans': {
      title: 'Ready-Made Plans — La Lounge | Proven Setups, Clear Pricing',
      desc: 'Lounge and lighting packages ready for immediate execution.',
    },
    '/la-lounge/contact': {
      title: 'Contact La Lounge | Seating & Lighting Quote',
      desc: 'Request a quote for lounge seating and mood lighting.',
    },
    '/your-birthday': {
      title: 'Your Birthday — Luxury Birthday Setups | Kuwait',
      desc: 'Decor, dessert tables, golden lighting and full celebration packages.',
    },
    '/your-birthday/features': {
      title: 'Your Birthday Features | Why Celebrate Differently',
      desc: 'Full styling, delivery & setup, and on-time commitment.',
    },
    '/your-birthday/products': {
      title: 'Celebration Pieces — Your Birthday | Decor Rental',
      desc: 'Browse birthday decor and setup pieces available for rent.',
    },
    '/your-birthday/contact': {
      title: 'Contact Your Birthday | Plan Your Celebration',
      desc: 'Book a full birthday package or request custom styling.',
    },
    '/products': {
      title: 'The Collection — Rental Catalog | Last Unique Touch Kuwait',
      desc: 'The full rental catalog: chairs, tables, chandeliers and lighting with daily KWD pricing.',
    },
    '/products/[slug]': {
      title: 'Piece Details — Rental Catalog | Last Unique Touch',
      desc: 'Specs, daily rate, deposit and live availability for this piece.',
    },
    '/cart': {
      title: 'Rental Cart | Last Unique Touch',
      desc: 'Review your selected pieces, rental period and totals before checkout.',
    },
    '/checkout': {
      title: 'Checkout | Last Unique Touch',
      desc: 'Confirm delivery details securely — all prices recomputed server-side.',
    },
    '/checkout/payment': {
      title: 'Payment Confirmation | Last Unique Touch',
      desc: 'Choose your payment method: KNET, bank transfer, or cash on delivery.',
    },
    '/checkout/success': {
      title: 'Order Received | Thank You',
      desc: 'Your order is in — our concierge team will confirm the details.',
    },
    '/about': {
      title: 'Our Story — Three Brands, One Vision | Last Unique Touch',
      desc: 'From Kuwait: a luxury house for furniture rental and event styling.',
    },
    '/contact': {
      title: 'Contact Us | Last Unique Touch Kuwait',
      desc: 'Our concierge team is ready — WhatsApp, phone or email.',
    },
    '/privacy': { title: 'Privacy Policy | Last Unique Touch', desc: 'How we protect and use your data.' },
    '/terms': { title: 'Terms & Conditions | Last Unique Touch', desc: 'Rental, ordering and delivery terms.' },
    '/refund': { title: 'Refund Policy | Last Unique Touch', desc: 'Cancellation and refund conditions.' },
  },
}

function routeMeta(path: string, locale: Locale): MetaEntry {
  const table = META[locale] ?? META.ar
  if (table[path]) return table[path]
  if (path.startsWith('/products/')) return table['/products/[slug]']
  // Brand-root fallback for nested unknown paths
  if (path.startsWith('/la-lounge')) return table['/la-lounge']
  if (path.startsWith('/your-birthday')) return table['/your-birthday']
  if (path.startsWith('/last-unique-touch')) return table['/last-unique-touch']
  return table['/']
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLinkTag(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"][data-router-managed]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    el.setAttribute('data-router-managed', 'true')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<RouteState>(() => {
    if (typeof window === 'undefined') return { locale: DEFAULT_LOCALE, path: '/', query: '' }
    return parseHash(window.location.hash)
  })
  const { setLocale: setI18nLocale } = useI18n()

  const applyRoute = useCallback((next: RouteState, push: boolean) => {
    const hash = `#/${next.locale}${next.path === '/' ? '' : next.path}${next.query ? `?${next.query}` : ''}`
    if (push && window.location.hash !== hash) {
      window.history.pushState(null, '', hash)
    }
    setRoute(next)
    window.dispatchEvent(new CustomEvent('lut:navigate', { detail: next }))
  }, [])

  /* Per-route document title / description / canonical / og:title. */
  useEffect(() => {
    const meta = routeMeta(route.path, route.locale)
    document.title = meta.title
    setMetaTag('name', 'description', meta.desc)
    setMetaTag('property', 'og:title', meta.title)
    setMetaTag('property', 'og:description', meta.desc)
    const base = `${window.location.origin}${window.location.pathname}`
    setLinkTag('canonical', `${base}#/${route.locale}${route.path === '/' ? '' : route.path}`)
  }, [route.path, route.locale])

  // Sync initial hash → router (covers deep links — external state sync)
  useEffect(() => {
    const initial = parseHash(window.location.hash)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoute(initial)
    setI18nLocale(initial.locale)
  }, [setI18nLocale])

  // hashchange (user edits URL / follows <a href="#/...">)
  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash(window.location.hash)
      setRoute(next)
      setI18nLocale(next.locale)
      window.dispatchEvent(new CustomEvent('lut:navigate', { detail: next }))
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [setI18nLocale])

  const navigate = useCallback(
    (path: string, locale?: Locale, query?: string) => {
      const target: RouteState = {
        locale: locale ?? route.locale,
        path: path.startsWith('/') ? path : `/${path}`,
        query: query ?? '',
      }
      // Programmatic navigation → pushState so back button works
      applyRoute(target, true)
      if (locale && locale !== route.locale) setI18nLocale(locale)
    },
    [route.locale, applyRoute, setI18nLocale]
  )

  const href = useCallback(
    (path: string, locale?: Locale, query?: string) => {
      const loc = locale ?? route.locale
      const p = path.startsWith('/') ? path : `/${path}`
      return `#/${loc}${p === '/' ? '' : p}${query ? `?${query}` : ''}`
    },
    [route.locale]
  )

  const value = useMemo<RouterContextValue>(
    () => ({ ...route, navigate, href }),
    [route, navigate, href]
  )

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used inside RouterProvider')
  return ctx
}

/** Locale-aware navigate that keeps the current path (for language switching). */
export function useLocaleSwitch() {
  const { path, locale, navigate } = useRouter()
  return useCallback(() => {
    navigate(path, locale === 'ar' ? 'en' : 'ar')
  }, [path, locale, navigate])
}
