# fishn — guided booking and cartography verification

Verified 22 November 2026 (America/Toronto), with Node 24 and installed Chrome on Windows. The existing cinematic design was retained and improved in the local repository. No hosted Site was published and no conversion-rate uplift is claimed.

| Check                                 | Result                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------ |
| Strict TypeScript                     | Passed in the final build                                                |
| ESLint / React hook checks            | Passed                                                                   |
| Server, schema, and geographic tests  | 15 passed                                                                |
| Development browser suite             | 10 passed                                                                |
| Final production Worker browser suite | 10 passed at `127.0.0.1:4175`                                            |
| Production build                      | Passed; 11 pre-rendered routes and 87 assets                             |
| Visual capture                        | 59 PNGs plus report in `.work/visual/conversion-final/`                  |
| Screenshot runtime errors             | None                                                                     |
| Screenshot overflow checks            | None at 320, 390, 768, 1024, and 1440px                                  |
| Motion-enabled water studies          | Correct exposure for each water/season; sticky stage top measured at 0px |
| Reduced motion / keyboard calendar    | Passed                                                                   |

The final build contains approximately 156.32 kB gzip of frontend JavaScript and 16.53 kB gzip of CSS. The self-contained Worker is approximately 9.00 MiB gzip. Raw geographic source coordinates are stored outside the public bundle. No runtime dependency was added. Existing user changes to `package-lock.json` were retained.

## What the tests cover

The browser tests verify immediate booking access from the fishing-focused hero, the direct shortcut past optional questions, the retained scroll journey, existing routes and Maps links, and query-preselected trips. All four destination/experience choices are checked against the correct entire-background photograph and corresponding outline; unsupported river/ice combinations cannot be selected.

First-time visitors skip the redundant familiarity question. Personalized wording and the changeable destination-help suggestion are verified. The conversation retains selections when moving back, validates preferred dates and required licence acknowledgement, handles larger groups, and includes optional preferences and free-text requests in the actual submission payload. Contact data and notes do not appear in local storage. Visible final summaries explain the request and pricing process.

The final Continue does not trigger an unintended submission. Contact validation occurs only after the explicit request action. Delivery errors retain entered data, and retrying an unchanged request retains its identity. Success remains a pending enquiry. Both immediate `/book` entry and completing the request inline on the homepage are exercised. Missing delivery configuration leaves final submission disabled.

A consented analytics stub verifies the meaningful funnel events through `Lead`. It also checks that names, email addresses, phone numbers, and optional notes are absent from event payloads. The stub is local to the browser tests; no real analytics results are claimed.

Server tests cover the existing date policy, location restrictions, licence requirement, consent, cross-origin rejection, unavailable delivery, provider failures/missing receipts, and idempotency. New tests verify that optional conversation fields remain optional, bounded valid values are accepted, unknown values/oversized notes are rejected, and useful preferences and notes appear in the guide's email.

## Geographic verification

Full source geometry was retrieved from OpenStreetMap's native relation API for Lake Simcoe and Nottawasaga, and from Nominatim geographic results for the main, East, and West Holland channels. Initial Overpass attempts were unavailable; the implementation uses the successfully retrieved primary OSM data rather than fabricated substitutes. `data/geography-source.json` retains coordinates, provenance, scope, source IDs, and ODbL information.

- Lake Simcoe: 7,178 source vertices, a stitched shoreline contour, and 20 island contours.
- Holland: 1,135 source vertices across mapped main/East/West channel features, replacing the previous short two-way drawing. Explicitly historical `(old)` features are excluded.
- Nottawasaga: 2,644 source vertices with mapped meanders retained.
- Projection is north-up Web Mercator. Distance-bounded simplification uses a 0.12px tolerance in the 500×500 viewBox.
- Tests distinguish closed lake rings from open river lines, verify named branch provenance, and ensure nonmatching endpoints are never bridged.

The source is community geographic data with documented coverage, not a guarantee of complete or current navigation information. General locations, reference coordinates, and attribution remain; no meeting points, access points, live ice conditions, or fishing spots were invented. Detailed source links are recorded in `DESIGN_DIRECTION.md`.

## Visual review

Desktop, phone, reference-ratio portrait, and motion-enabled captures were inspected, including contact sheets of the complete desktop/mobile set. The existing photographic language remains: full-bleed scenes, thin white strokes, restrained labels, true water outlines, and selective focus. New fishing imagery, early value/pricing-process copy, and a first-screen action are integrated into that composition.

The first review prompted a visible shortcut above the initial preference choices so visitors ready to plan do not have to complete optional questions. The destination-help state keeps its suggestion explicit and changeable. Later steps retain the selected background and give the current question the mobile screen space. Required contact inputs and the final summary remain readable over the photographic scrim.

Representative captures:

- `.work/visual/conversion-final/desktop-arrival.png`
- `.work/visual/conversion-final/mobile-book-intent.png`
- `.work/visual/conversion-final/mobile-book-help-choosing.png`
- `.work/visual/conversion-final/desktop-book-holland.png`
- `.work/visual/conversion-final/mobile-book-notes-licence.png`
- `.work/visual/conversion-final/mobile-book-contact.png`
- `.work/visual/conversion-final/mobile-book-delivery-error.png`
- `.work/visual/conversion-final/mobile-book-submitted-mock.png`
- `.work/visual/conversion-final/motion-water-1.png` through `motion-water-4.png`

Reproduce with the server running and `npm run verify:visuals`. `PLAYWRIGHT_BASE_URL` selects a production preview and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select an installed Chromium browser. Screenshots and intermediate research downloads are local ignored artifacts. The source snapshot needed for offline map regeneration is retained in `data/`.

## Limits and remaining business information

Every booking POST in the screenshot script and browser delivery tests is intercepted. These checks verify UI and request behavior, not real email delivery; no actual customer or business inbox was contacted. Live enquiries still need the business inbox, verified sender, and delivery API key.

Confirmed prices, exact equipment/bait/transport inclusions, the weather/cancellation policy, credential details, and a definitively identified guide portrait were not available. The site uses the verified existing guidance and transparent pricing-review model. Those missing owner facts are listed in `DESIGN_DIRECTION.md`; no low-price claim, review, credential, catch guarantee, or confirmed reservation was invented.
