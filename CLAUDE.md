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
- `src/lib/store.ts`: private Vercel Blob store (shared with the portal app)
- `src/app/api/leads/route.ts`: emails form leads, stores them (`src/lib/leads.ts`) and
  forwards them to the aimviz CRM
- `src/lib/concepts.ts`, `src/app/free-concepts/`: free 3-concept requests (website
  research in `src/lib/research.ts`, DeepSeek drafting)

## Client portal: a separate app
Client portals, the studio dashboard, concept reviews and the growth board live
in their own app, `scribebunny-portal` (repo `~/Apps/scribebunny-portal`, Vercel
project `scribebunny-portal`, https://portal.scribebunny.com, `PORTAL_URL` in
`src/lib/site.ts`). Both apps share the Blob store `scribebunny-portal`; this site
still writes leads (`portal/leads/`) and concept requests (`portal/concepts/`) and
reads team keys (`portal/access/team.json`) to put each person's own link in
alerts. `/portal/*` and `/concepts/*` redirect to the portal app (next.config.ts).

Every client portal is created by hand in the portal app. A paid package order
does not open one: the buyer is told their portal link arrives within 24 hours,
and each team member's "New order" alert has a "Create their portal" button
(`newPortalLink`) that opens the portal app's New client portal form filled in
from the Stripe session. Payments for custom-price portals are settled by the
portal app; `fulfil()` here ignores them (`metadata.portal`).

Shared word for word with the portal app: `src/lib/store.ts`, `access.ts`,
`site.ts`, `email.ts`, `email-layout.ts`, `concepts.ts`, `research.ts`,
`leads.ts`, `packages.ts`. Change them in both. Locally, run both apps with the
same `LOCAL_STORE_DIR` (and `PORTAL_URL=http://localhost:<portal port>`) to
share one store without the Blob token.

Private pages (`src/lib/private-paths.ts`: /order-confirmed, /api/, and the
redirected /portal and /concepts) are blocked for every crawler group in
robots.txt, sent with `X-Robots-Tag: noindex` and `Referrer-Policy: no-referrer`
(next.config.ts), and never load the Facebook Pixel.

## Free concepts
Prospects ask for 3 free concepts at `/free-concepts`. The team gets an alert and
the prospect an acknowledgement; in the background this site reads their website
(public hosts only) and DeepSeek (`deepseek-flash`, `DEEPSEEK_API_KEY`, optional
`DEEPSEEK_MODEL`) drafts 3 concepts. The studio reviews, edits and sends them in
the portal app (`/concepts/<id>`). Without the API key the team writes them by hand.

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
