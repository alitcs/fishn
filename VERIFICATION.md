# Netlify-only cleanup verification

Verified locally on 25 November 2026 using Node 24 and Chromium on Windows. No deployment, live enquiry, or email was sent.

## Scope

Removed the custom email API, Worker bundling, Node production wrapper, provider switching, unused booking models, and backend-only tests. Development and production now use the existing Netlify Forms submission path. The normal build creates the same static Netlify output; the old Netlify command names remain aliases. Local development uses Vite directly, and the built preview lives in scripts/preview.mjs.

Page components, routes, CSS, photographs, crops, business configuration, pricing, calendar logic, consent behavior, and the Netlify form blueprint were not edited. The existing Sites identity was retained and its preview metadata now points to the static output rather than an obsolete Worker.

## Results

| Check | Result |
| --- | --- |
| Production build | Passed; all 11 public routes pre-rendered |
| TypeScript | Passed |
| ESLint | Passed |
| Unit tests | 15 passed; date policies, pricing, validation, geography, and Netlify payload |
| Browser tests | 20 passed against the production static build |
| Screenshot comparison | All 94 before/after pairs identical at every pixel |
| Static assets | 84 files byte-identical, including CSS, photos, fonts, sitemap, and robots.txt |
| HTML comparison | All 13 files identical after normalizing the JavaScript bundle filename: 11 pages, 404, and form blueprint |
| Browser runtime errors | None in either visual run |
| Horizontal overflow | None in the checked 320, 390, 768, 1024, and 1440px layouts |
| Direct Vite development | Started successfully; local submission kept answers, rejected unprocessed form HTML, showed no false confirmation, and made no legacy API requests |

Browser checks cover all four destination backdrops, route navigation, booking validation and back navigation, retained notes, failure/retry/success, stable request references, URL-encoded form fields, pricing, licence keyboard controls, gallery focus and navigation, consented analytics, mobile viewport sizing, section snapping, and calendar refresh across future month boundaries.

## Visual comparison method

The original Netlify build was saved under .work/cleanup-baseline/client before edits. Both that saved build and the cleaned production build were served locally and exercised with the same updated scripts/verify-visuals.mjs. The checker was corrected to use the current people input and 8-hour option, scroll the real mobile scroll container, wait for the active section indicator, and generate a fixed request UUID in the browser test only. The application still generates real random request IDs.

The 94 images cover desktop, phone, portrait, narrower booking layouts, every journal frame, all booking stages, failure and confirmation states, and all destination backgrounds. Raw decoded RGBA pixels were compared with zero tolerance; every pair matched.

Local evidence:

- .work/visual/cleanup-before/: original build screenshots and runtime/overflow report.
- .work/visual/cleanup-after/: cleaned build screenshots and runtime/overflow report.
- .work/cleanup-comparison.json: asset, HTML, and per-image pixel counts.
- .work/compare-cleanup.mjs: comparison used for this cleanup.

These generated verification artifacts are ignored by Git. To take new screenshots, build, start npm run preview, and run npm run verify:visuals -- capture-name. Use PLAYWRIGHT_BASE_URL to target another local build.

## Delivery limits

All automated submission tests use intercepted responses. Local Vite/static servers cannot process Netlify Forms or deliver email; an unprocessed local HTML response is rejected even when its HTTP status is 200. Live delivery still requires Netlify deployment, form detection, and a recipient configured in the dashboard. See NETLIFY_SETUP.md. The cleanup does not change deployed settings or claim a live email test.
