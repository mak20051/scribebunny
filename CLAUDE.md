# scribebunny

Marketing site for Scribebunny (explainer, demo, onboarding and white-label
video production), live at https://scribebunny.com.

This source was rebuilt on 2026-10-23 from the compiled production deployment
(the original source folder was lost). Rendered HTML matched the live site
page for page at the time of the rebuild.

## Stack
- Next.js 16.1.6 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4; hand-written styles in `src/app/globals.css`
- nodemailer for lead emails
- Hosted on Vercel (project `scribebunny`), deployed from this repo's `main`

## Commands
- `npm run dev`: local dev server
- `npm run build`: production build
- `npm run lint`: ESLint

## Key files
- `src/app/*/page.tsx`: pages (home, work, contact, thank-you, three service pages)
- `src/components/site-shell.tsx`: header, nav and footer
- `src/components/service-page-template.tsx`: shared layout for service pages
- `src/components/marketing.tsx`: hero, section, FAQ and CTA blocks
- `src/lib/portfolio.ts`: portfolio videos (YouTube IDs)
- `src/lib/site.ts`: site URL, Calendly link, contact details, parent company
- `src/lib/packages.ts`: video package prices and inclusions (the only place they live)
- `src/components/pricing-section.tsx`: home page `#pricing` section
- `src/lib/payments.ts`: Stripe Checkout, idempotent order fulfilment
- `src/lib/email.ts`, `src/lib/email-layout.ts`: SMTP sending and the branded email layouts
- `src/app/api/checkout/route.ts`: starts checkout; `src/app/api/stripe/webhook/route.ts`: fulfils paid orders
- `src/app/order-confirmed/page.tsx`: order summary (fulfils the order when no webhook is set)
- `src/lib/portal.ts`, `src/app/portal/`: client portal (messages, video status, delivery
  links, mark complete) with signed links; `src/lib/store.ts`: Upstash Redis (REST)

## Client portal
Every paid order opens a portal. The confirmation email carries the client link,
the team alert carries the team link and the "All orders" dashboard link. Links
are HMAC-signed with `PORTAL_SECRET` (falls back to a key derived from
`STRIPE_SECRET_KEY`); rotating it revokes every link. Production needs Redis
(`KV_REST_API_URL`/`KV_REST_API_TOKEN` from Vercel → Upstash); without it the
store is per-instance memory and portal data is lost.
- `src/app/api/leads/route.ts`: emails form leads and forwards them to the aimviz CRM

## Business details
Scribebunny is a small animation studio that loves to draw and tell stories;
write copy in that voice. Scribebunny is a brand of Infinisys LLC. All invoices are issued by Infinisys
LLC, so the Stripe account behind `STRIPE_SECRET_KEY` must be Infinisys LLC's.

## Environment
Vercel env vars: `STRIPE_SECRET_KEY`, optional `STRIPE_WEBHOOK_SECRET`
(endpoint `/api/stripe/webhook`, event `checkout.session.completed`), plus
SMTP settings: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`,
`SMTP_PASS`, `LEAD_FROM_EMAIL`. Lead and order alerts go to `TEAM_EMAILS` in
`src/lib/site.ts`. Locally, without SMTP, emails are logged and written to
`EMAIL_PREVIEW_DIR` if set. Never commit `.env*` files.

## Deploys
Pushing to `main` deploys to production. Use a branch for changes you want to
preview first.
