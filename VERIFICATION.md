# fishn: pricing and booking verification

Current revision: the booking chapter fits one viewport; the total and navigation remain visible while longer details scroll within the panel. Verified all four steps at 1440x900, 1366x768, 390x844, 390x700, and 320x568, including licence selection. Fresh sessions default to one person, two hours, shoreline fishing ($100 CAD). Booking shows only the total and selected session; Good to know uses compact rate formulas. Ice fishing is now $75/hour for the first person plus $25/hour per extra person; shoreline remains $50 plus $20. The 23-photo journal interleaves landscapes and catches. The Netlify build and TypeScript check pass, along with 21 unit tests and five production browser checks covering form delivery/retry, journal browsing, one-screen booking at all five sizes, live pricing, and minimal pricing copy.

Previous pricing update, 22 November 2026 (America/Toronto): equipment copy states that visitors dress for the conditions and all fishing gear is provided. The Journal has 23 images after removing original entries 1, 3, 16, and 17. Trips are limited to 2, 4, 6, and 8 hours; group sizes accept positive whole numbers without the old 12-person cap. Shared pricing matches every supplied table entry and appears throughout booking, confirmation, copyable plans, and delivery payloads. Water outlines have stronger strokes, more space, an entrance animation triggered in view, and a dark variant over ice.

Validation for this update: 20 unit tests passed, including all 32 supplied prices and larger groups. The development browser suite passed all 17 tests; the Netlify-only case was skipped there and passed separately against the production static build. Three production browser checks passed: Netlify delivery/retry payloads, mobile rate tables/equipment copy, and a browser-clock test for February/March 2027 in Pacific/Kiritimati. The latter verifies stale saved dates are discarded, today follows the browser rather than Toronto, and the month refreshes when returning to a long-lived tab. The Netlify build and TypeScript check passed. Desktop/mobile visual captures are in `.work/visual/pricing-update/`. No publication or real message delivery was performed.

## Earlier interface verification

Verified 22 November 2026 (America/Toronto), using Node 24 and Chrome on Windows. This is local source work and Netlify preparation. No site was published and no real email or Instagram message was sent.

| Check                            | Result                                                   |
| -------------------------------- | -------------------------------------------------------- |
| Strict TypeScript and ESLint     | Passed                                                   |
| Worker build                     | Passed; 11 pre-rendered routes, 98 assets, 9.91 MiB gzip |
| Netlify build                    | Passed; complete static form blueprint                   |
| Unit tests                       | 18 passed                                                |
| Production browser journey suite | 13 passed                                                |
| Netlify-mode integration         | 1 passed                                                 |
| Visual captures                  | 102 PNGs in `.work/visual/minimal-final/`                |
| Runtime errors / overflow        | None at 320, 390, 768, 1024, and 1440px                  |

Netlify frontend JavaScript is approximately 154.70 kB gzip and CSS 19.76 kB gzip. No runtime dependency was added.

## Native section snapping

The homepage has exactly three initial viewport-height chapters at the reviewed desktop and phone sizes. Native CSS snapping is enabled only on the homepage. The footer is inside the final chapter's visual space and does not create a fourth page.

A browser test uses real wheel events to move from the introduction to booking and then Good to know. It verifies the booking link returns to the booking chapter. On a 390x700 screen, the same test fills the longer contact step, scrolls Submit into view, and confirms the viewport remains within booking. Reduced-motion and keyboard-calendar checks still pass.

## Minimal surfaces and copy

Cards, fields, and actions have straight square edges. A 1.8% neutral surface fill and localized 13px blur replace the darker glass. Ice booking uses dark text over its light photograph. Duplicate introductions, pricing paragraphs, coordinates, trip lines, and gallery headlines were removed while required booking and licence information stays available.

## Compact journal

The drawer includes all 27 supplied photographs and excludes the five design references. Browser checks load and decode every journal image. Original files are unchanged; crops remain in code. Portrait crops keep faces outside the selected frames, while hands or clothing may remain behind a fish.

The filmstrip supports native horizontal snapping, touch swiping, arrow controls, keyboard arrows, Home/End, focus wrapping, Escape, and restoration of page position and focus. The test verifies the first, second, and final frames, keeps the chosen date and booking step, and checks that focus remains within the dialog. Five added photos have drawer-sized responsive WebPs to keep the retained Worker within its existing package envelope.

## Retained submission behavior

The existing request, validation, consent, error, retry, and confirmation checks pass. Netlify-mode testing inspects URL-encoded fields, a 12-person/12-hour request, a failed response, rejection of an unprocessed form blueprint, and successful acceptance as a pending enquiry. The API adapter and optional Instagram path remain. Contact details and notes stay out of local storage and analytics payloads.

All browser submission POSTs are intercepted. Live notifications still require Netlify deployment, form detection, and the chosen recipient in the dashboard. The user requested preparation without deployment. See [NETLIFY_SETUP.md](NETLIFY_SETUP.md).

## Visual reproduction

Run npm run build:netlify, then npm run preview:netlify. Set PLAYWRIGHT_BASE_URL=http://127.0.0.1:4176 and run npm run verify:visuals. Captures are stored in .work/visual/minimal-final/ and include every journal frame, all booking states, all four destination backdrops, phone/desktop/portrait layouts, and narrower overflow checks.

Existing sourced geographic outlines, attribution, destination restrictions, request-date policy, and detail routes are unchanged. No price, availability, credential, catch guarantee, or award was invented.

## Licence menu refinement

The licence field now uses a styled square selector and option list rather than the browser's native menu. Desktop and phone captures cover shoreline and ice themes under `.work/visual/licence-select/`. Keyboard selection, Escape, outside dismissal, retained answers, form validation, and Netlify submission were verified. The latest Netlify build and lint checks pass.
