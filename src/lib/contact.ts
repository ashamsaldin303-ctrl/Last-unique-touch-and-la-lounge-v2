/**
 * Single source of truth for business contact channels (audit P0.2).
 *
 * Every component (floating WhatsApp, footer, contact pages, JSON-LD)
 * reads from here. Real values are injected via env vars in production:
 *
 *   NEXT_PUBLIC_WHATSAPP_NUMBER  e.g. "9655xxxxxx" (digits only, no +)
 *   NEXT_PUBLIC_PHONE_DISPLAY    e.g. "+965 2xxx xxxx"
 *   NEXT_PUBLIC_EMAIL            e.g. "hello@lastuniquetouch.com"
 *   NEXT_PUBLIC_ADDRESS          e.g. "Kuwait City, Block 3, ... "
 *   NEXT_PUBLIC_INSTAGRAM_URL    e.g. "https://instagram.com/last.unique.touch"
 *
 * The fallbacks below are clearly-marked placeholders so a dev clone can
 * never ship silently as if they were real business data.
 */

const env = (key: string, fallback: string): string =>
  process.env[key] ?? fallback

export const CONTACT = {
  /** Digits-only international format for wa.me links. */
  whatsappNumber: env('NEXT_PUBLIC_WHATSAPP_NUMBER', '96550000000'),
  phoneDisplay: env('NEXT_PUBLIC_PHONE_DISPLAY', '+965 9XXX XXXX'),
  email: env('NEXT_PUBLIC_EMAIL', 'info@lastuniquetouch.com'),
  address: env('NEXT_PUBLIC_ADDRESS', 'الكويت'),
  instagramUrl: env(
    'NEXT_PUBLIC_INSTAGRAM_URL',
    'https://instagram.com/last.unique.touch'
  ),
} as const

export const whatsappLink = (message: string): string =>
  `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`
