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
- `src/lib/site.ts`: site URL and Calendly link
- `src/app/api/leads/route.ts`: emails form leads and forwards them to the aimviz CRM

## Environment
SMTP settings live in Vercel env vars (Production): `SMTP_HOST`, `SMTP_PORT`,
`SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `LEAD_FROM_EMAIL`, `LEAD_TO_EMAIL`.
Never commit `.env*` files.

## Deploys
Pushing to `main` deploys to production. Use a branch for changes you want to
preview first.
