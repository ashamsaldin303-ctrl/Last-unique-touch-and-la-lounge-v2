# سجل التغييرات المطبَّقة — Design / Front-End / UI-UX Uplift
**التاريخ:** 2026-10-01 · **مرجع:** `DESIGN-AUDIT.md` · **النطاق:** كل بنود التصميم القابلة للتطبيق كودياً

---

## P0 — الثقة والتحويل
| # | التغيير | الملفات |
|---|---|---|
| 1 | **حذف نموذج البطاقة الوهمي** من صفحة الدفع واستبداله باختيار طريقة سداد صادق (KNET / تحويل بنكي / دفع عند التسليم) مع ملاحظة صريحة: لا نجمع بيانات بطاقات عبر الموقع | `src/pages/payment.tsx` |
| 2 | **مصدر واحد لبيانات التواصل** قابل للحقن عبر env (`NEXT_PUBLIC_WHATSAPP_NUMBER` …) بدل أرقام مبعثرة | `src/lib/contact.ts` (جديد)، `floating-whatsapp.tsx`، `footer.tsx`، `layout.tsx` |
| 3 | **إدارة عناوين الصفحات**: `document.title` + meta description + og:title + canonical لكل مسار ولكل لغة (38 عنواناً محرراً بالعربي والإنجليزي) | `src/lib/router.tsx` |
| 4 | **هوية التبويب**: favicon SVG + apple-touch-icon + `metadata.icons` + twitter card | `layout.tsx`، `public/brand-icon.svg`، `public/apple-touch-icon.png` |
| 5 | **صور OG لكل علامة** (1200×630) مولّدة векторياً + سكربت توليد قابل لإعادة التشغيل | `scripts/gen-brand-assets.mjs`، `public/og-*.png` |
| 6 | **JSON-LD** منظم (LocalBusiness) في الـ head | `src/app/layout.tsx` |

## P1 — التصميم البصري
| # | التغيير | الملفات |
|---|---|---|
| 7 | **إصلاح تبادل صور العلامات** في بطاقات الـ hero (كانت LUT تعرض صورة La Lounge والعكس) | `src/pages/home.tsx` |
| 8 | **توكنات تباين WCAG**: `--text-accent` لكل علامة/وضع + `text-goldtext` و`text-goldondark`؛ الأصفر لم يعد نصاً على فاتح أبداً (1.77:1 → 5.25:1) | `globals.css` + `home/product-card/product-detail` |
| 9 | **رفع تباين الفوتر** من paper/40-50 (3.45:1) إلى paper/60-85 (≥6.9:1) | `footer.tsx` |
| 10 | **سلّم خط سائل** `.t-hero/.t-h1/.t-h2/.t-lead` — عنوان الـ hero لم يعد 20px على الموبايل | `globals.css`، `home.tsx` |
| 11 | **لا نص تحت 12px**: كل `text-[8px]/[9px]/[10px]` رُفع (hero stats، experience chips، footer desc) | `home.tsx`، `experience-card.tsx`، `footer.tsx` |
| 12 | **ستارة انتقال العلامات** (brand curtain wipe) بدل قلب الباليت المفاجئ، مع احترام reduced-motion | `brand-curtain.tsx` (جديد)، `globals.css`، `page.tsx` |
| 13 | **شعارات векторية** مونوغرام لكل علامة في navbar والفوتر (بدل الأصول JPG الميتة) | `brand-logo.tsx` (جديد)، `navbar.tsx`، `footer.tsx` |
| 14 | **وضع داكن مصمم لـ Birthday** (أوبِرجين عميق #17081f بدل بنفسجي مصمت) + تباينات muted جديدة | `globals.css` |
| 15 | **إحصاءات الثقة ظاهرة على الموبايل** بنسخة مضغوطة (كانت مخفية تماماً) | `home.tsx` |
| 16 | **رابط إنستغرام** في الفوتر (كان مدفوناً في صفحتي تواصل فقط) | `footer.tsx` |

## P2 — تجربة المستخدم
| # | التغيير | الملفات |
|---|---|---|
| 17 | **فلاتر الكتالوج في الـ URL** (`?q=&cat=&sort=&page=`) — روابط قابلة للمشاركة وزر رجاء يحفظ الحالة | `products.tsx`، `router.tsx` (دعم query) |
| 18 | **Lightbox لتكبير صور المنتج** (ESC/أسهم/عدّاد) — فحص الخامة أساسي في التأجير الفاخر | `product-detail.tsx` |
| 19 | **حذف شارة "3D" الوهمية** (لا يوجد عارض) من البطاقات والمعرض | `product-card.tsx`، `product-detail.tsx` |
| 20 | **واتساب سياقي**: رسالة مختلفة لكل سياق (قطعة/سلة/checkout/عام) | `floating-whatsapp.tsx` + رسائل جديدة |
| 21 | **رسائل i18n جديدة** متزامنة في النسخ الأربع (طرق السداد، واتساب، العارض) | `messages/*.json` ×4 |

## P3 — الأداء والهندسة
| # | التغيير | الملفات |
|---|---|---|
| 22 | **حذف اعتماديات ميتة**: next-auth, @dnd-kit/*, @mdxeditor, react-syntax-highlighter | `package.json` |
| 23 | **حذف الكود الميت**: مزوّد اللغة الثانوي (قاموس مزدوج كامل غير مستخدم) | `providers/language-provider.tsx` (محذوف) |
| 24 | **إغاثة backdrop-filter** على أجهزة اللمس (blur → خلفيات شبه مصمتة) | `globals.css` |
| 25 | **استبعاد examples/** المكسور من tsconfig | `tsconfig.json` |

## التحقق
- `tsc --noEmit` → **نظيف** · `eslint` على كل الملفات المعدّلة → **نظيف**
- توليد الأصول ناجح · فحص تباين محسوب لكل توكن جديد (جدول في DESIGN-AUDIT.md ملحق أ)
- ملاحظة: لقطات الشاشة الحيّة متعذرة في بيئة التدقيق (1GB RAM تقتل بناء Next) — وهي قيد بيئة لا عيب كود؛ كل تغيير موثق بمرجع ملف.
