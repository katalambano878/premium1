# Design system (v3)

The look chosen by the owner on 2026-11-11. Reference implementation: `src/components/home-v3/*` (homepage) plus the shared pieces listed below. Every public page should look like it belongs to that homepage.

## Character

A light grey page carrying large rounded panels: photo panels, navy panels and white cards. Frosted-glass pills and cards sit on photos. Type is DM Sans at medium weight, never bold display or serif. Navy and teal are the only brand colours. Copy is short and plain, written for importing companies.

## Tokens

| Thing | Value |
|---|---|
| Page background | `#f4f4f5` (set by `.site-v3` wrapper; sections are transparent on it) |
| Navy (text, dark panels, dark buttons) | `var(--navy)` `#0b1f3a` |
| Accent teal (highlights, active state) | `var(--accent)` `#2ec4b6`; text-safe on light: `var(--accent-ink)` `#0f6f67` |
| Body text on light | `text-slate-600`; secondary `text-slate-500`; faint numerals `text-slate-400` |
| Text on dark | `text-white`, `text-white/85`, `text-white/75` (never below /70 for body) |
| Hairlines | `border-slate-200` on light, `border-white/15`–`/25` on dark |
| Font | DM Sans (`font-sans`). No `font-editorial`, `font-display`, serif or italics |
| Heading weight | `font-medium` with `tracking-[-0.02em]` (hero: `-0.025em`). Never `font-bold` for headings |

## Type scale

- Page hero h1: handled by `PageHero`.
- Section h2: `text-3xl sm:text-[2.5rem] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--navy)] text-balance`
- Card / item h3: `text-xl sm:text-2xl font-medium tracking-[-0.01em]`
- Lead paragraph: `text-base sm:text-lg leading-7 text-slate-600`
- Small text: `text-sm leading-6 text-slate-500`
- Section label: a pill, not uppercase tracked text: `inline-flex rounded-full border border-slate-300 px-4 py-1.5 text-[13px] text-slate-600` (on dark: `border-white/30 text-white/85`). Use at most one per section, and only where a section needs naming.

## Layout

- Content width: `mx-auto max-w-[1320px] px-6` for sections on the grey page.
- Panels (photo, navy): wrapper `px-3 sm:px-5`, inner `mx-auto max-w-[1480px] rounded-[1.75rem] sm:rounded-[2rem]`, inner padding `px-5 py-10 sm:px-10 sm:py-14 lg:px-14`.
- Section spacing: `py-12 sm:py-16` (up to `lg:py-20`). Do not use larger paddings.
- Two-column sections: `grid gap-10 lg:grid-cols-2 lg:gap-16`.

## Components

- **White card**: `rounded-3xl border border-slate-200 bg-white p-6 sm:p-8`. Hover (if clickable): `hover:shadow-[0_24px_48px_-32px_rgba(11,31,58,0.35)]`. No coloured side borders, no glow shadows, no gradient text, no cards nested inside cards.
- **Icon tile**: `inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--navy)]`, icon `h-5 w-5 strokeWidth={1.6}`. On navy: `bg-white/10 border-white/20 text-white`.
- **Navy panel**: see Layout. Cards inside it: `rounded-3xl border border-white/15 bg-white/5 p-6`.
- **Photo card**: `relative isolate overflow-hidden rounded-3xl`, `next/image` fill, bottom gradient `bg-[linear-gradient(180deg,rgba(8,20,40,0.25)_0%,rgba(8,20,40,0.1)_35%,rgba(8,20,40,0.9)_100%)]`, white text on top.
- **Glass pill / card on a photo**: `rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-[13px] font-medium backdrop-blur-md`; cards `rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-xl`.
- **Buttons**: always pills. Use `CTAButton` (`primary` teal, `secondary` navy for light backgrounds, `outline` white bordered, `light` glass for dark/photo). Hand-built primary on light: `inline-flex items-center gap-2 rounded-full bg-[var(--navy)] py-3 pl-6 pr-5 text-sm font-medium text-white hover:bg-[var(--accent)] hover:text-[var(--navy)] active:scale-[0.97]` with a trailing `ArrowUpRight`.
- **Round arrow button**: `inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--navy)] text-white` (active/first: `bg-[var(--accent)] text-[var(--navy)]`).
- **Numbered list rows**: number `text-lg tabular-nums text-slate-400` as `01`, title `text-lg sm:text-xl font-medium`, body `text-sm leading-6 text-slate-500`, rows separated by `border-slate-200`.
- **Form fields**: `w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-[var(--navy)] placeholder:text-slate-400 focus:border-[var(--navy)] focus:outline-none`; labels `text-sm font-medium text-[var(--navy)]`; form container is a white card.
- **Tables**: inside a white card, header `text-sm text-slate-500`, rows `border-t border-slate-200`.

## Shared pieces (already restyled; reuse, do not restyle per page)

- `components/layout/Header.tsx`, `Footer.tsx`, `PublicShell.tsx`
- `components/page/PageHero.tsx`: rounded panel hero with breadcrumb pill, optional `eyebrow` pill, `backgroundImage`
- `components/design-system/`: `CTAButton`, `Section` (`background="navy"|"dark"` renders the inset navy panel; all light backgrounds are transparent), `Heading`, `Container`
- `components/layout/SiteCTA.tsx` and `components/sections/CTABanner.tsx`: the closing "Tell us what you are shipping" photo panel. Each page ends with exactly one of these.

## Motion

Framer Motion `whileInView` fade-up (`opacity 0→1, y 24→0`, `duration 0.6–0.8`, ease `[0.22, 1, 0.36, 1]`, `viewport={{ once: true }}`), honouring `useReducedMotion`. Hover transitions 200–300ms on colour/transform only. No parallax, no pulsing, no bouncing.

## Do not

- Serif or italic headlines, `font-bold` headlines, uppercase letter-spaced micro-labels, gradient text.
- Paper/mint backgrounds (`bg-paper*`, `bg-[var(--surface-warm)]`, `bg-slate-50` section bands), mesh/grid hero textures, glow or coloured shadows.
- Square or `rounded-lg`/`rounded-xl` buttons; buttons are `rounded-full`.
- Insider wording in headings ("the file", "the desk", "field notes", "operator"). Use plain words.
- Inventing proof. Testimonials, stats, team names, licences and phone numbers in the content files are placeholders (see PRODUCT.md): keep rendering what a page already renders, but add no new claims.
