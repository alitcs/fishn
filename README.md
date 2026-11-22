# fishn

A complete React + TypeScript website for private guided shoreline and ice fishing experiences in Ontario. The site uses the supplied photography and five visual references, a custom SVG field atlas based on OpenStreetMap geometry, and a single-page booking request form.

## Run locally

Use Node 22 or newer (verified with Node 24) and npm. In Windows PowerShell use `npm.cmd` if script execution policy blocks `npm.ps1`.

```sh
npm install
node scripts/prepare-assets.mjs
npm run dev
```

Open **http://127.0.0.1:5173**. The development server includes the real booking API. No credentials are needed to browse, plan a trip, or inspect the unavailable state.

```sh
npm run build
npm start
```

The production server runs at **http://127.0.0.1:4173** by default. Set `PORT` to change it. It runs the same self-contained Worker used in the hosted deployment, serving all pages, images, and the booking endpoint. The process binds to loopback; put a trusted reverse proxy with HTTPS in front of it for a public Node deployment, preserve the incoming Host header, and set `SITE_URL` to the external HTTPS origin. Local testing still uses the local origin even when a public `SITE_URL` is configured. A Node deployment needs `server/start.mjs` and `dist/server/index.js`; the built Worker has no production npm dependencies.

## Pages

- `/` — photographic homepage, experiences, atlas preview, philosophy, guide, invitation.
- `/experiences` — both experiences.
- `/experiences/shoreline-fishing` and `/experiences/ice-fishing` — advertising-ready landing pages with photo journals, FAQs, and preselected booking links.
- `/explore` — interactive field atlas with accessible text selection.
- `/explore/lake-simcoe`, `/explore/holland-river`, `/explore/nottawasaga-river` — editorial location details, sourced facts, outline, Maps link, and location-preserving booking link.
- `/about`, `/book`, `/privacy`, and a real not-found page.

Eleven routes are pre-rendered into complete HTML, with route-specific titles, descriptions, canonical URLs, Open Graph tags, sitemap, and robots.txt. React hydrates those pages for navigation and interactivity. The 404 page is returned with an actual 404 status by both production servers.

## Booking email configuration

Copy `.env.example` to `.env` and set **server-only** variables:

| Variable                     | Purpose                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `RESEND_API_KEY`             | Transactional email API key from the business’s Resend account             |
| `BOOKING_NOTIFICATION_EMAIL` | Actual business inbox that receives requests                               |
| `BOOKING_FROM_EMAIL`         | Sender address on a domain verified in Resend                              |
| `SITE_URL`                   | Public website origin for canonical/share metadata; set at build time      |
| `VITE_META_PIXEL_ID`         | Optional authorized Meta Pixel ID; public build variable, blank by default |
| `PORT`                       | Optional local/Node server port                                            |

The business inbox and sender were not supplied. No email addresses or private keys have been invented or placed in frontend code. Until all three email variables exist, `/api/booking/status` reports `ready: false`, the form explains that online requests are opening soon, and Instagram is available as a contact route. A direct submission receives HTTP 503, never a false success.

When configured, `POST /api/bookings` validates the body with the shared schema, enforces same-origin JSON requests and a 16 KiB limit, checks experience/location/date combinations, and sends a plain-text notification through [Resend’s email API](https://resend.com/docs/api-reference/emails/send-email). The message includes all requested trip/contact fields, licence acknowledgement, request ID, a validated client submission timestamp, and consented campaign attribution. The delivery provider’s receipt headers record trusted server receipt time. Reply-to is the customer’s address.

The UI retains the same request ID and timestamp when retrying an unchanged form. The server supplies a matching [Resend idempotency key](https://resend.com/docs/dashboard/emails/idempotency-keys); Resend protects identical retries for 24 hours. Double-clicks are also blocked in the UI. Changing the form creates a new request. Delivery failures, missing receipts, timeouts, and validation failures leave the form intact and never show confirmation. The successful state means the provider accepted a **pending request**, not a reserved or confirmed trip. No live email has been sent or tested without credentials.

Verified provider delivery is the durable notification mechanism; there is deliberately no pretend CRM database. `BookingRecord` defines the future CRM model, including status and submission time. `src/booking/service.ts` is the frontend integration boundary; `server/booking.ts` is the server delivery adapter. Replace or extend that adapter with durable CRM persistence and provider delivery webhooks when the CRM is ready. Retain provider idempotency when doing so. The process-level rate limit is a backstop; configure host/WAF rate limits for distributed production abuse protection. No full admin system was added.

## Availability and business content

Edit `src/data/config.ts` to configure durations and the independent shoreline/ice request policies:

- Enable or disable requests.
- Set lead time, maximum request horizon, weekdays, blocked dates, and optional reviewed request windows.
- Defaults permit preferred dates 1–365 days ahead, clearly labelled **request-only**, without asserting operating hours or seasonal availability.
- The same function checks dates in the calendar and on the server using the America/Toronto calendar date.
- Ice fishing is Lake Simcoe only. Season, ice conditions, permissions, regulations, and Nikita’s approval always apply.

Prices stay hidden until real pricing is supplied. Nikita confirms equipment, pricing, meeting points, and the final plan directly. No catch guarantees, credentials, reviews, booking slots, or precise access points have been invented.

Before opening requests publicly, supply the actual business email/sender, review availability policies and group/duration choices, agree equipment arrangements and pricing, confirm rights to the supplied location images, and approve the privacy/data-retention wording for business operations. The portraits in the winter journal are presented only as supplied trip photography: the brief does not identify which person is Nikita, so no portrait has been labelled as him.

## Images and design

See [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md) for the visual analysis and [ASSET_INVENTORY.md](ASSET_INVENTORY.md) for every supplied image, its dimensions, role, and editorial selection.

- `waterlandscape1.jpg` — homepage hero.
- `closeupreelandmug.jpg` — shoreline feature/hero and guide detail.
- `Lake-simcoe-ice.jpg` — ice feature/hero and winter location context.
- `lake-simcoe.jpg`, `HollandRiver.jpg`, `Nottawasaga-River.jpg` — their respective atlas/details.
- `waterlandscape.jpg` — philosophy; `winterpath.jpg` — about hero.
- Fish, lure, ice, and catch photographs — curated experience journals, listed individually in the inventory.
- `UIinspo.jpg`, `UIinspo1.jpg`, `UIinspo2.jpg`, `UIinspo3.jpg`, `mapUIinspo.jpg` — design references only, never served as website assets.

`scripts/prepare-assets.mjs` generates three WebP sizes per selected photograph and copies the local Manrope variable font. Originals remain untouched. Images have aspect ratios, descriptions, responsive sources, and lazy loading below the fold. The final bundle loads no remote font or map SDK.

The atlas paths are generated from OSM coordinates, not drawn from memory. `src/data/geography.json` contains retrieval time, bounds, source feature IDs, licence, path data, and actual source coordinate points. Holland River is a mapped main-channel section, not a claim that all branches/access points are shown. `scripts/fetch-geography.mjs` reproduces the source fetch and projection (network access required; Overpass can be temporarily unavailable). This fetch is **not** needed to build the site. Attribution is visible on each atlas map and in the privacy page. Keep attribution and review [OpenStreetMap’s ODbL terms](https://www.openstreetmap.org/copyright) when reusing the data.

## Analytics and privacy

No tracking ID is installed by default. Optional analytics require an explicit choice in “Analytics choices” in the footer. Without consent, Meta does not load and campaign attribution is not stored or submitted. With consent, bounded UTM fields and `fbclid` can be kept in session storage and included with the request. A `Lead` conversion is fired only after the server returns a successful pending request. Contact information is never put in analytics events.

Local storage keeps only non-contact trip selections; contact details stay in React memory. External licence/regulation links open in new tabs so selections remain intact. No document uploads, licence sales, accounts, or payments are collected.

## Deploy

### Sites private preview / Worker

`.openai/hosting.json` contains the registered Site ID. `npm run build` emits a self-contained Cloudflare Worker at `dist/server/index.js`, including pre-rendered HTML, React/CSS, fonts, and image bytes. Embedding avoids dependence on a proprietary asset binding and keeps the real `/api/bookings` endpoint available on the same origin. Assets receive ETags and cache headers. The Worker is 8.26 MiB compressed, mostly photography; the images are served as image responses, never downloaded as frontend JavaScript. Check the current [Workers platform limits](https://developers.cloudflare.com/workers/platform/limits/) when deploying to another account.

Package and publish through the Sites workflow using the project ID in the manifest. Keep the Site private unless the owner requests public access. Set the three email secrets in **Sites runtime environment variables**, not in the hosting manifest. Changing a `VITE_` variable or the canonical origin requires rebuilding. Runtime email secret changes do not require frontend changes.

### Another host

The same React app can run on any Node host with the production server above. Alternatively, deploy `dist/client` as static output and route `/api/bookings` plus `/api/booking/status` to the server adapter on the **same origin**. Static output alone cannot send requests and will show the unavailable state. Set `SITE_URL` to your domain, rebuild, and configure HTTPS and trusted proxy/WAF limits. The Worker can also be deployed to a compatible Cloudflare account with its runtime email secrets.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Browser tests expect the dev server at `127.0.0.1:5173`; `PLAYWRIGHT_BASE_URL` can point to a production preview. Install a browser with `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an installed Chromium executable. No browser binary is hardcoded into the project configuration.

The automated tests cover Ontario date boundaries, unavailable dates, blocked policies, invalid ice locations, licence acknowledgement, consent, cross-origin requests, provider failures/missing receipts, idempotency, form validation/retry/simulated confirmation, preselection, atlas navigation, mobile overflow and images across routes, mobile menu, keyboard calendar navigation, and reduced motion. Browser success is exercised with an explicitly mocked API; it is not evidence of a real email delivery.

Desktop (1440px) and mobile (390px) pages were visually inspected and refined. See [VERIFICATION.md](VERIFICATION.md) for final run results. No real email delivery, physical fishing access, live ice conditions, or business operating schedule has been verified by the software tests.

## Content sources

Reviewed 21 November 2026; recheck legal and operational information before trips:

- [Ontario resident and Canadian resident fishing licences](https://www.ontario.ca/page/fishing-licence-ontario-and-canadian-residents)
- [Ontario fishing regulations](https://www.ontario.ca/document/ontario-fishing-regulations-summary)
- [Licences and non-Canadian resident requirements](https://www.ontario.ca/document/ontario-fishing-regulations-summary/recreational-fishing-licences-and-fees)
- [Ontario: protecting Lake Simcoe](https://www.ontario.ca/page/protecting-lake-simcoe)
- [LSRCA: subwatershed plans](https://lsrca.on.ca/index.php/home/subwatershed-plans/)
- [NVCA: restoring the Nottawasaga River](https://www.nvca.on.ca/lands-stewardship/restoring-the-nottawasaga-river/)
- [OpenStreetMap attribution and data licence](https://www.openstreetmap.org/copyright)

Public location pages link directly to their supporting source. Licensing is a concise summary, with direct official links for residents, visitors, and regulations. The site deliberately avoids species promises, seasonal date claims, or unsupported river lengths.
