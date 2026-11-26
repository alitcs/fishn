# fishn

React + TypeScript website for private guided shoreline and ice fishing in Ontario. Hosted as static pages on Netlify; booking enquiries use Netlify Forms and dashboard-managed email notifications.

## Run locally

Use Node 22 or newer and npm. On Windows, use npm.cmd if PowerShell blocks npm.ps1.

```sh
npm install
npm run dev
```

Development runs at http://127.0.0.1:5173. Photos and the local font are included in public/. If rebuilding image assets is necessary, run node scripts/prepare-assets.mjs.

```sh
npm run build
npm run preview
```

The production preview runs at http://127.0.0.1:4176 and serves the actual pre-rendered pages, including a real 404. Netlify Forms processes submissions only on Netlify. Local submissions fail visibly and retain the entered details; they never send an email or pretend to succeed.

## Project structure

| Path | Purpose |
| --- | --- |
| src/App.tsx | React Router routes |
| src/pages.tsx, src/Journey.tsx | Public pages and homepage |
| src/components.tsx | Shared layout and UI |
| src/booking/ | Four-step booking, validation, calendar, pricing UI, Netlify submission |
| src/gallery/ | Photo journal and crops |
| src/data/ | Business configuration, rates, locations, image manifest, map outlines |
| src/services/analytics.tsx | Optional consent-based analytics |
| src/*.css | Existing styles, loaded in order by entry-client.tsx |
| public/ | Served photos, font, favicon, and Netlify form blueprint |
| scripts/ | Asset preparation, pre-rendering, local preview, and verification tools |
| tests/ | Unit and browser checks |

The website's application code is TypeScript (.ts) and React with TypeScript (.tsx). The .mjs files are JavaScript ES modules that Node runs for build and maintenance tasks; they are not another frontend or a second application. eslint.config.js is the lint configuration. Browser JavaScript is generated from TypeScript during the build.

Original JPGs are build inputs and remain in the repository root. The five UI/map reference JPGs are design references only. See [ASSET_INVENTORY.md](ASSET_INVENTORY.md) and [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md). Generated dist/, .work/, and test-results/ are ignored by Git.

## Netlify deployment and email

See [NETLIFY_SETUP.md](NETLIFY_SETUP.md) for form detection and recipient configuration. netlify.toml selects Node 24, npm run build:netlify, and dist/client. build:netlify is an alias of the standard build; preview:netlify is an alias of preview.

The build optimizes assets, bundles React, and pre-renders 11 public routes with titles, descriptions, canonical URLs, share metadata, sitemap.xml, and robots.txt. No application server is deployed.

Booking submits URL-encoded data to /__forms.html. public/__forms.html declares the fishing-session form for Netlify's build-time detection. Email recipients are configured in Netlify, never in frontend code. No email API keys are required.

HTTP errors, network failures, unprocessed form HTML, and app fallbacks remain errors. Successful acceptance means a pending enquiry, not a confirmed reservation. Unchanged retries retain the request reference; Netlify does not guarantee deduplication. Browser tests intercept submissions and do not prove live email delivery.

## Configuration and business content

- src/data/config.ts: request policies, allowed durations, official links, and experience configuration.
- src/data/pricing.ts: owner-supplied CAD rates. Shoreline is $50/hour plus $20/hour per extra person; ice is $75/hour plus $25/hour per extra person. Durations are 2, 4, 6, or 8 hours.
- src/data/locations.ts and src/data/scenes.ts: destinations and booking backgrounds.
- src/gallery/catches.ts: journal order and crops.
- SITE_URL: optional build-environment override for the canonical origin. Netlify supplies URL automatically. For a local build override, set SITE_URL in the shell running the build.
- VITE_META_PIXEL_ID: optional public analytics ID, loaded only after consent. Vite reads this from .env locally; configure it in Netlify for deployment.

The calendar follows the visitor's browser date and rechecks dates on focus and visibility changes. Request eligibility uses the Ontario date policy. Ice requests are Lake Simcoe only. All dates remain request-only and subject to guide confirmation and conditions. No payment is collected.

Contact details and notes remain in React memory. Saved trip selections exclude contact information. Analytics and campaign storage require explicit consent; contact fields never enter analytics events.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Browser tests start the built preview automatically unless PLAYWRIGHT_BASE_URL is supplied. Install Chromium with npx playwright install chromium, or set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to an installed executable. Every test submission is intercepted.

For visual captures, start npm run preview and run npm run verify:visuals -- capture-name. Images and overflow reports are written to .work/visual/capture-name/. See [VERIFICATION.md](VERIFICATION.md) for the cleanup checks and limits.

Map outlines are generated offline from retained OpenStreetMap source data in data/geography-source.json. scripts/build-geography.mjs regenerates geometry; scripts/fetch-geography.mjs deliberately refreshes the external source and is not part of normal builds. Preserve attribution and source data.

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
