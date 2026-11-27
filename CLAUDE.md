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
- `npm run typecheck`: route types (`next typegen`) and `tsc --noEmit`
- `npm test`: Vitest (`src/**/*.test.ts`, Node, in-memory store; shared test
  records in `src/test/fixtures.ts`)
- `npm run check`: typecheck, lint and tests; GitHub Actions runs it on every
  push to `main` and every pull request (`.github/workflows/check.yml`)

## Code principles
1. Constraints first: follow the existing structure, types and lint rules.
   Read how the app already solves a similar problem and do it the same way.
2. Prove it works: every change to business logic (prices, channels, follow-up
   timing, access, growth numbers) ships with tests next to the file
   (`foo.ts` -> `foo.test.ts`). Run `npm run check` and show the output before
   pushing. When a bug can be prevented by a type, a lint rule or a better API,
   do that instead of a comment.
3. No slop: no explanatory comments, no timers or temporary workarounds that
   bypass the architecture. Keep code clean and consistent.
4. Bugs found along the way get their own branch and pull request, with the fix
   and a test that fails without it, apart from the work in progress.

Tests never touch real services: they run without `BLOB_READ_WRITE_TOKEN`
(the store is in memory; `growth.test.ts` asserts this), without SMTP (emails
are logged) and outside production (the CRM is skipped).

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
  links, mark complete) with signed links; `src/lib/store.ts`: private Vercel Blob store
- `src/app/api/leads/route.ts`: emails form leads, stores them (`src/lib/leads.ts`) and
  forwards them to the aimviz CRM
- `src/lib/growth.ts`, `src/app/portal/growth/`: growth board (live funnel numbers)
- `src/lib/concepts.ts`, `src/app/free-concepts/`, `src/app/concepts/`: free 3-concept offer
  (website research in `src/lib/research.ts`, DeepSeek drafting, studio review, send)

## Client portal
Every paid order opens a portal. Links carry random keys, unique per person
(`src/lib/access.ts`):
- Client: each order has its own `clientKey`, sent in the confirmation email.
  "Send the client a new link" (studio view) replaces it and emails the client.
- Team: everyone in `OWNER_EMAIL` + `TEAM_EMAILS` has their own key, stored at
  `portal/access/team.json`. Alerts with links go to each person separately, with
  their own key. A key opens the dashboard, every order and concept reviews; the
  owner's also opens the growth board and Team access (`/portal/access`), where
  one person's link can be resent or replaced. "Lost your link?" on `/portal`
  emails a team member their link (once per 5 minutes).
- Orders from before 2026-10-25 have no `clientKey` and keep their HMAC client
  link (`src/lib/signing.ts`, `PORTAL_SECRET`) until it is replaced.

Every studio update emails the client: messages, each video status change, new
video links, and the project being completed or reopened.

Custom-price portals: "New client portal" on the dashboard (`/portal/new`, any
team member) creates an order by hand (`manual`, own price and number of
videos) with its own client link, and can email the client their link. Unless
marked already paid, `payment.status` is "awaiting" and the client's portal shows
a Pay button: a Stripe Checkout for that price (`createPortalCheckout`, metadata
`portal`, invoiced by Infinisys LLC) that returns to `/portal/paid`, which settles
it once (`markPortalPaid`; the webhook can too) and alerts the team. The studio
can also "Mark as paid" for payments made another way. The growth board counts
an order only once it is paid, by payment date.

After delivery (`src/lib/launch.ts`, `src/components/launch-kit.tsx`): once a
video is Complete the portal shows "Launch your video" (`#launch`): a six-step
checklist the client ticks, a review form (`#review`; the team gets an alert,
and `canFeature` records permission to use it on the site), and "Order your
next video". Marking the project complete sets `completedAt`; a daily Vercel
cron (`vercel.json`, `/api/cron/follow-ups`, 16:00 UTC) sends the day 7 email
(checklist and review request) and the day 30 email (results, review, order
next), each once per order and never for the demo. Set `CRON_SECRET` in Vercel
so only the scheduler can call it (it is safe to call either way).

The same cron sends prospect follow-ups (`src/lib/prospect-follow-ups.ts`): day 2
and day 5 after free concepts were sent, and day 2 and day 5 after a
custom-price portal was created but not paid (a quote). Each goes once, only
within 3 days of its due day (old requests never get a late one), and they stop
when the prospect orders or pays, clicks "Stop these reminders"
(`/stop-reminders`, or one-click unsubscribe via `/api/follow-ups/stop`, POST
only), or the team clicks "Stop follow-ups" on the concept review page or the
portal's payment card (the site can't see replies or Calendly bookings).

Messages can carry screenshots and files (`src/lib/attachments.ts`): attach,
paste or drop, up to 10 per message and 50 MB each. Browsers upload straight to
the Blob store at `portal/files/<ref>/` (`/api/portal/upload` only checks the
portal key and issues an upload token); `/portal/<ref>/file` serves them only
to people with a key to that order. Locally, without the token, files go
through the upload route into memory. Portal data lives in the
private Vercel Blob store `scribebunny-portal` (`BLOB_READ_WRITE_TOKEN`, Production
and Preview), one JSON file per order at `portal/orders/<ref>.json`, updated with
ETag compare-and-swap. Without the token the store is in-memory (local runs only).

A demo project shows the portal with sample data: the dashboard's "Demo project"
button opens it as the studio, and its studio view shows its own random client
link. It lives at `portal/demo/SB-DEMO.json`, never sends email, isn't in the
orders list or the growth board, and has a "Reset demo" button.

Private pages (`src/lib/private-paths.ts`: /portal, /concepts, /order-confirmed,
/api/) are blocked for every crawler group in robots.txt, sent with
`X-Robots-Tag: noindex` and `Referrer-Policy: no-referrer` (next.config.ts), and
never load the Facebook Pixel, because their addresses carry private keys.

## Free concepts
Prospects ask for 3 free concepts at `/free-concepts`. The team gets an alert and
the prospect an acknowledgement; in the background the site reads their website
(public hosts only) and DeepSeek (`deepseek-flash`, `DEEPSEEK_API_KEY`, optional
`DEEPSEEK_MODEL`) drafts 3 concepts. The studio reviews and edits them at the
signed `/concepts/<id>` link, then sends the branded concepts email. Concepts are
never sent without a person clicking Send. Without the API key, drafting is
paused (`autoDraftOn()` in `src/lib/concepts.ts`): requests start as "Needs
writing", no draft alert goes out, and the team writes them by hand on the same
page. The prospect's acknowledgement is a plain receipt either way.

## Lead sources
Every form (contact, quote, agency, free concepts) and every package checkout
records where the lead came from (`src/lib/lead-source.ts`). The browser
(`src/components/lead-source-tracker.tsx`, in the root layout, public pages
only) keeps the first visit and the latest visit with a source (utm tags, ad
click IDs, referring site) in localStorage `sb_source` for 90 days and sends
them with the form. The server names the channel (Paid search, Paid social,
Organic search, Organic social, AI assistant, Email, Referral, Other campaign,
Direct) and adds city, region and country from Vercel's geo headers and the
device; the IP is never stored. The source goes in the team alert, the CRM
message, the lead record (`source` on leads, concept requests and portal
orders), Stripe metadata (`src_*`, so paid orders keep it), the studio pages
("Where they came from") and the growth board. Tag outreach links with
`utm_source`, `utm_medium` and `utm_campaign` so they show up by name. The
CRM only receives leads from production (`VERCEL_ENV`), never from local runs
or previews.

## Growth board
`/portal/growth` is the owner's only: it opens with the owner's own key (the
Growth board button on the owner's dashboard). It shows live numbers from the site's own records: enquiries (form leads at
`portal/leads/<id>.json` plus concept requests), concepts sent, paid orders,
revenue (`amountCents` on each order), conversion rates, revenue by package,
enquiries, orders and revenue by channel, enquiries by country, the last 8
weeks and recent activity. An order's channel is its checkout's source, else
the first enquiry with the same email (quotes). Only leads sent after this shipped are counted.

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
`main` is protected: no direct pushes, for anyone. Push a branch (Vercel builds
a preview), open a pull request, and merge it once the `check` job passes.
Merging to `main` deploys to production.
