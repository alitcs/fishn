# fishn — delivery verification

Verified on 21 November 2026 (America/Toronto), using Node 24 on Windows.

| Check | Result |
|---|---|
| TypeScript strict type checking | Passed |
| ESLint including React hooks | Passed, no errors or warnings |
| Booking/schema/server tests | 10 passed |
| Development browser suite | 5 passed |
| Final production Worker browser suite | 5 passed |
| Production build | Passed; 11 pre-rendered routes |
| Worker artifact verification | Passed: pages, images, cache/ETag, status endpoint, 404, reference exclusion, server-only email configuration |
| npm dependency audit | 0 vulnerabilities |
| Desktop and mobile visual review | Inspected at 1440×1000 and 390×844; refined text sizing, hero motion, booking notice placement, and request reset |

The browser suite covers navigation, experience preselection, ice location filtering, calendar selection and keyboard navigation, 4+ group entry, licence acknowledgement, contact validation, failed-delivery retry, simulated successful pending request, inaccessible delivery state, mobile navigation, reduced motion, and image loading / horizontal overflow across ten routes. Success responses in browser tests are deliberately mocked; no real customer or business email was contacted.

The production Worker includes 84 assets and is approximately 8.26 MiB gzip. Frontend JavaScript is approximately 139 KiB gzip and CSS approximately 8.8 KiB gzip. Worker source bytes are never sent as frontend JavaScript. The principal hero is eagerly loaded; secondary photography loads lazily in normal browsing. Screenshots explicitly loaded secondary images before final visual inspection.

No live Resend delivery could be verified because the business inbox, verified sender, and API key were not supplied. The deployed endpoint returns an honest unavailable status until configured. Requests never imply a reserved date or confirmed trip. No physical access point, live availability, seasonal operating schedule, or ice safety claim was verified or invented.

The existing repository’s Git history and original photographs were preserved. Private Site source synchronization uses an isolated checkout under the ignored `.work/` directory.
