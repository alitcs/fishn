# fishn

A React + TypeScript website for private guided shoreline and ice fishing in Ontario. The homepage has three native snap sections: a clear service headline, four-step booking, and brief practical answers. A small optional journal drawer contains 23 selected photographs. It uses the supplied photography and five visual references, with geographic artwork based on existing OpenStreetMap data.

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

- `/` — guided fishing hero, inline four-step booking/confirmation, and three optional practical answers.
- `/experiences` — both experiences.
- `/experiences/shoreline-fishing` and `/experiences/ice-fishing` — advertising-ready landing pages with photo journals, FAQs, and preselected booking links.
- `/explore` — interactive field atlas with accessible text selection.
- `/explore/lake-simcoe`, `/explore/holland-river`, `/explore/nottawasaga-river` — editorial location details, sourced facts, outline, Maps link, and location-preserving booking link.
- `/about`, `/book`, `/privacy`, and a real not-found page.

Eleven routes are pre-rendered into complete HTML, with route-specific titles, descriptions, canonical URLs, Open Graph tags, sitemap, and robots.txt. React hydrates those pages for navigation and interactivity. The 404 page is returned with an actual 404 status by both production servers.

## Netlify deployment and forms

The project is ready for Netlify using netlify.toml: Node 24, npm run build:netlify, and dist/client. This build selects Netlify Forms, includes a complete static form blueprint, and submits the four-step session as URL-encoded data. Instagram remains an optional alternative alongside Submit.

Enable form detection, deploy, and set the temporary email recipient in Forms > Submission notifications. The actual email address stays out of frontend code and this public repository. See [NETLIFY_SETUP.md](NETLIFY_SETUP.md) for the exact setup and inbox-change steps. The project is not deployed yet, so no live form delivery is claimed.

## Existing API email configuration

Copy `.env.example` to `.env` and set **server-only** variables:

| Variable                     | Purpose                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `RESEND_API_KEY`             | Transactional email API key from the business’s Resend account             |
| `BOOKING_NOTIFICATION_EMAIL` | Actual business inbox that receives requests                               |
| `BOOKING_FROM_EMAIL`         | Sender address on a domain verified in Resend                              |
| `SITE_URL`                   | Public website origin for canonical/share metadata; set at build time      |
| `VITE_META_PIXEL_ID`         | Optional authorized Meta Pixel ID; public build variable, blank by default |
| `PORT`                       | Optional local/Node server port                                            |

For the existing API adapter, all three email variables are required. Without them the API returns HTTP 503 and never a false success. The final contact form remains available and retains answers on an error; the Instagram alternative can copy the session plan. The Netlify production build uses Netlify Forms instead of this API.

When configured, `POST /api/bookings` validates the body with the shared schema, enforces same-origin JSON requests and a 16 KiB limit, checks experience/location/date combinations, and sends a plain-text notification through [Resend’s email API](https://resend.com/docs/api-reference/emails/send-email). The message includes all requested trip/contact fields, licence acknowledgement, optional trip preferences, fishing familiarity, destination-help requests, optional customer notes, request ID, a validated client submission timestamp, and consented campaign attribution. The delivery provider’s receipt headers record trusted server receipt time. Reply-to is the customer’s address.

The UI retains the same request ID and timestamp when retrying an unchanged form. The server supplies a matching [Resend idempotency key](https://resend.com/docs/dashboard/emails/idempotency-keys); Resend protects identical retries for 24 hours. Double-clicks are also blocked in the UI. Changing the form creates a new request. Delivery failures, missing receipts, timeouts, and validation failures leave the form intact and never show confirmation. The successful state means the provider accepted a **pending request**, not a reserved or confirmed trip. No live email has been sent or tested without credentials.

Verified provider delivery is the durable notification mechanism; there is deliberately no pretend CRM database. `BookingRecord` defines the future CRM model, including status and submission time. `src/booking/service.ts` is the frontend integration boundary; `server/booking.ts` is the server delivery adapter. Replace or extend that adapter with durable CRM persistence and provider delivery webhooks when the CRM is ready. Retain provider idempotency when doing so. The process-level rate limit is a backstop; configure host/WAF rate limits for distributed production abuse protection. No full admin system was added.

## Availability and business content

Edit `src/data/config.ts` to configure durations and the independent shoreline/ice request policies:

- Enable or disable requests.
- Set lead time, maximum request horizon, weekdays, blocked dates, and optional reviewed request windows.
- Defaults permit preferred dates 1–365 days ahead, clearly labelled **request-only**, without asserting operating hours or seasonal availability.
- The same function checks request eligibility in the calendar and on the server using the America/Toronto calendar date. The opening month and today indicator follow the visitor's browser date, with refreshes on tab focus, visibility changes, and every minute while the calendar is mounted. Stale saved dates are cleared; an eligible saved selection opens to its month. Calendar markup is rendered when the date step opens, so static builds never freeze its month.
- Ice fishing is Lake Simcoe only. Season, ice conditions, permissions, regulations, and Nikita’s approval always apply.

Owner-supplied rates are in `src/data/pricing.ts`: shoreline fishing is $50/hour for the first person; ice fishing is $75/hour for the first person. Each additional person adds $20/hour for shoreline or $25/hour for ice fishing. Trips last exactly 2, 4, 6, or 8 hours. Group sizes accept positive whole numbers, including groups larger than 12. The booking flow shows a compact live CAD total and session summary on every step and in the confirmation; Netlify submissions and API emails include the computed rate and total. All fishing gear and equipment is provided; visitors should dress for the conditions. Nikita confirms availability, meeting points, and the final plan directly; no payment is taken online. No catch guarantees, credentials, reviews, booking slots, or precise access points have been invented.

Before opening requests publicly, supply the actual business email/sender, review availability policies, confirm rights to the supplied location images, and approve the privacy/data-retention wording for business operations. The portraits in the winter journal are presented only as supplied trip photography: the brief does not identify which person is Nikita, so no portrait has been labelled as him.

## Images and design

See [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md) for the visual analysis and [ASSET_INVENTORY.md](ASSET_INVENTORY.md) for every supplied image, its dimensions, role, and editorial selection.

- `lake-simcoe.jpg` — high-resolution arrival, Simcoe shoreline scene, and shoreline booking backdrop.
- `HollandRiver.jpg` — river transition, Holland scene and booking backdrop, and the floating experience journal.
- `closeupreelandmug.jpg` — shoreline inset, overview, and guide focus study.
- `Lake-simcoe-ice.jpg` — ice feature/hero and winter location context.
- `lake-simcoe.jpg`, `HollandRiver.jpg`, `Nottawasaga-River.jpg` — their respective atlas/details.
- `waterlandscape.jpg` — philosophy; `winterpath.jpg` — about hero.
- Fish, lure, ice, and catch photographs — curated experience journals, listed individually in the inventory.
- `UIinspo.jpg`, `UIinspo1.jpg`, `UIinspo2.jpg`, `UIinspo3.jpg`, `mapUIinspo.jpg` — design references only, never served as website assets.

`scripts/prepare-assets.mjs` generates WebP variants up to 2560px without upscaling, records actual dimensions and source widths in `src/data/photography.json`, and copies the local Manrope font. Full-screen source sizes account for portrait cover cropping. The hero is preloaded; upcoming water exposures are warmed progressively. Originals remain untouched. No remote font, map SDK, or animation dependency is loaded.

src/data/scenes.ts shares the destination/experience/photo mapping. Each session retains its full destination photograph and real outline. The four steps are Session, Date, Group & time, and Your details. People have quick choices for 1-4 plus a number field for any larger group; duration choices are 2, 4, 6, and 8 hours. Contact details and optional notes stay in memory. Submit uses the configured host adapter; an optional Instagram disclosure provides a copyable plan. The quiet Journal action opens a compact horizontal filmstrip without leaving the page or losing session choices. The journal interleaves 23 catch and landscape photographs; original entries 1, 3, 16, and 17 were removed from the journal only. Display crops are defined in src/gallery/catches.ts; originals are untouched. Clear square panes use a light neutral fill and localized background blur. The three main sections snap natively, while longer details scroll inside the booking panel with the total and navigation always visible. The booking chapter fits one viewport, and a fresh session starts with one person for two hours of shoreline fishing.

The outlines use detailed OpenStreetMap geometry: the Lake Simcoe shoreline plus 20 island contours, named main/East/West Holland branches, and the Nottawasaga main-channel relation. Raw WGS84 source data and provenance are retained in `data/geography-source.json`, outside the public bundle. `node scripts/build-geography.mjs` projects and regenerates the SVG paths offline with a 0.12px distance tolerance. `node scripts/fetch-geography.mjs` deliberately refreshes the native OSM/Nominatim sources; it is not required for an application build. Paths join only at actual matching endpoints, river lines remain open, and source coverage is documented. Reference coordinates are not access points. Visible attribution and the [ODbL source terms](https://www.openstreetmap.org/copyright) remain. See [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md) for sources and scope.

## Analytics and privacy

No tracking ID is installed by default. Optional analytics require an explicit choice in “Analytics choices” in the footer. Without consent, Meta does not load and campaign attribution is not stored or submitted. With consent, bounded UTM fields and `fbclid` can be kept in session storage and included with the request. A `Lead` conversion is fired only after the server returns a successful pending request. Contact information is never put in analytics events.

Local storage keeps only non-contact trip selections and preferences; contact details and optional free-text requests stay in React memory. External licence/regulation links open in new tabs so selections remain intact. No document uploads, licence sales, accounts, or payments are collected.

Consented funnel events distinguish viewing the form from actually starting it, record categorical preferences and destination choices, and measure reaching the contact step. Lead remains tied to successful request delivery. No name, email address, phone number, preferred date, or free-text note is included in the new funnel event payloads. No conversion uplift is claimed without live data.

## Deploy

### Sites private preview / Worker

`.openai/hosting.json` contains the registered Site ID. `npm run build` emits a self-contained Cloudflare Worker at `dist/server/index.js`, including pre-rendered HTML, React/CSS, fonts, and image bytes. Embedding avoids dependence on a proprietary asset binding and keeps the real `/api/bookings` endpoint available on the same origin. Assets receive ETags and cache headers. The Worker is approximately 9 MiB gzip, mostly photography; the images are served as image responses, never downloaded as frontend JavaScript. Check the current [Workers platform limits](https://developers.cloudflare.com/workers/platform/limits/) when deploying to another account.

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
npm run verify:visuals
```

Browser tests expect the dev server at `127.0.0.1:5173`; `PLAYWRIGHT_BASE_URL` can point to a production preview. Install a browser with `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an installed Chromium executable. No browser binary is hardcoded into the project configuration.

The tests cover Ontario date policies, invalid ice locations, licence acknowledgement, consent, provider errors, idempotency, all four booking backdrops and outlines, conversational validation and back navigation, explicit final submission, inline homepage completion, existing routes and Maps links, mobile image loading/overflow, keyboard calendar access, and reduced motion. Browser success uses an explicitly mocked API; it is not evidence of real email delivery.

Desktop, phone, portrait, narrow layouts, gallery crops, and all four booking backdrops are checked with npm run verify:visuals. The final captures are in .work/visual/minimal-final/. All POSTs are intercepted. Additional overflow checks cover 320, 768, and 1024px. See VERIFICATION.md for actual results and limits. A separate Netlify-mode browser test verifies the URL-encoded request and failure handling. Live email delivery is tested only after deploying and enabling notifications.

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
