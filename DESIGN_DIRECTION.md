# fishn — guided fishing, with less guesswork

Updated 22 November 2026. This revision preserves the photographic canvases, restrained white typography, quiet native scrolling, selective focus studies, and geographic artwork. It improves service clarity and the route into a booking request. No conversion uplift is claimed without visitor data.

## Friction found and addressed

- The arrival was atmospheric but did not explain the guided service prominently. It now names private guided fishing in Ontario, welcomes first-timers, identifies Nikita, explains that pricing is agreed before commitment, and offers a visible `Plan your fishing trip` action.
- Booking previously required a long smooth scroll through the story. Header and hero actions now open the existing `/book` experience immediately. The same component remains embedded for visitors who prefer to keep scrolling.
- Landscapes outweighed fishing. The hero now pairs the large Simcoe photograph with an authentic catch inset. The early value chapter uses the actual reel, rod, and mug photograph. A supplied catch moment accompanies the guide introduction, without claiming the unidentified person is Nikita.
- The old booking started with geography and logistics. It now starts with the visitor's kind of day, offers optional reassurance, accepts uncertainty about destination, and uses the answers in both the guidance and guide notification.
- Pricing and inclusions were unclear. Early copy now explains the actual model: Nikita discusses pricing, equipment arrangements, and the meeting point before commitment; no payment is taken here. No price, discount, included equipment, bait, or transport promise was invented.

## The visitor journey

Arrival introduces the emotional escape and the practical service together. The next photographic chapter explains the value of local knowledge, personal guidance, a private outing, and a plan arranged directly with Nikita. The existing four-water sequence remains available through native scrolling. The experience and guide chapters make fishing tangible. A short explanation of what happens after a request leads into inline booking.

The first screen, fixed navigation, and guide chapter provide contextual booking entry points. The design keeps one clear primary action at each moment rather than repeating large button groups. Existing experience, atlas, location, about, and privacy routes continue to work.

## Conversational booking

The underlying service, schema, calendar policy, backend adapter, consent rules, failure handling, and provider idempotency are retained. `ConversationStep.tsx` supplies the current question while `BookingPage.tsx` retains the request state and delivery behavior.

1. **Your kind of day:** peaceful escape, first fishing experience, time together, or a focused fishing day. Optional; a visible `Go straight to trip details` shortcut skips both preference questions.
2. **Fishing experience:** new, occasional, or regular. Optional. Choosing a first-ever trip already answers this, so the duplicate question is omitted and the progress count adjusts.
3. **Your water:** four supported destination/experience pairs, described in plain language. `I’m not sure — help me choose` uses Simcoe shoreline as an explicitly changeable starting suggestion and tells Nikita the visitor wants help deciding.
4. **Your people:** 1, 2, 3, or 4+, with the actual larger group entered separately.
5. **Your date:** a preferred request date, never a claim of live availability. Weather, rules, permissions, and appropriate ice conditions remain part of guide review.
6. **Your pace:** the existing 1–4-hour options. Pricing is discussed before commitment.
7. **Anything else:** an optional note, capped at 1,500 characters, alongside the existing required licence acknowledgement and official guidance.
8. **Arrange the trip:** visible trip and pricing-process summary, required contact fields, and an explicit `Request my fishing trip` action.

Straightforward preference, familiarity, small-party, and duration choices advance immediately. Destination and date choices keep an explicit Continue so visitors can inspect the photographic setting or calendar. Back retains every answer. The final action has a distinct identity from Continue, preventing premature submission. Errors remain visible and return the visitor to the relevant question. Success means a pending enquiry accepted by the actual configured delivery service, never a reservation.

Optional preferences affect concise guidance and appear in the real booking email. Special requests also reach the guide. Contact details and notes stay in React memory; only non-contact selections use the existing optional local storage. No unnecessary personal fields were added.

## Photography and reference fidelity

All supplied photography and five references remain the basis of the design. The large full-bleed Simcoe, Holland, Nottawasaga, and winter photographs remain. Responsive WebP sources use actual dimensions, never enlarge originals, and account for portrait cover cropping. The first hero image is preloaded; water exposures load progressively. No new stock imagery, generated photographs, font service, map SDK, or animation dependency was introduced.

- `UIinspo3.jpg`: white metadata distributed over the large photographic canvas, a restrained sans hierarchy, grain, negative space, and fine rules.
- `UIinspo2.jpg`: the offset transparent editorial journal, thin outline, typographic statement, and vertical equipment inset.
- `UIinspo1.jpg`: precise corner handles and a small crosshair over an atmospheric photographic study.
- `UIinspo.jpg`: a sharply resolved equipment band interrupting a softly blurred exposure.
- `mapUIinspo.jpg`: real white geographic artwork and understated coordinates directly over the corresponding landscape.

The new catch inset uses `fishinnet.jpg`; the early guide-value chapter uses `closeupreelandmug.jpg`; the guide's fishing journal uses `monsterfish3.jpg`. The person in that supplied journal image is not named. Full-screen backgrounds continue to prioritize the larger landscape originals.

## More faithful cartography

Geography was researched using OpenStreetMap's full geometry APIs, Nominatim's geographic search output, the Ontario Hydro Network catalogue, and the Lake Simcoe Region Conservation Authority's East/West Holland references. The implemented coordinates come from OpenStreetMap and remain subject to its [ODbL attribution](https://www.openstreetmap.org/copyright).

| Motif             | Recorded source                                                                                                                                          | Result                                                                                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lake Simcoe       | [OSM relation 9984807](https://www.openstreetmap.org/relation/9984807), 7,178 source vertices                                                            | Source ways stitched at matching endpoints into one shoreline contour and 20 island contours, preserving bays and inlets.                                                               |
| Holland River     | Main-channel ways, named East Holland ways, and [West Holland relation 10579849](https://www.openstreetmap.org/relation/10579849), 1,135 source vertices | A river network with the mapped East/West branches, replacing the previous short, sparsely sampled main-channel drawing. Historical features explicitly labelled `(old)` were excluded. |
| Nottawasaga River | [OSM relation 20952468](https://www.openstreetmap.org/relation/20952468), 2,644 source vertices                                                          | Joined mapped channel sections with source meanders retained, rather than skipping two of every three vertices.                                                                         |

`data/geography-source.json` retains the retrieved WGS84 coordinates, source IDs, references, scope, and retrieval provenance outside the public bundle. `scripts/build-geography.mjs` projects to north-up Web Mercator and fits each motif to the same 500×500 drawing space. Distance-bounded simplification uses a 0.12px tolerance in that viewBox. It retains 2,283 display vertices for the lake including islands, 602 for Holland, and 999 for Nottawasaga. This is a common visual frame, not a shared geographic distance scale.

Only actual matching endpoints are stitched. Lake rings close only when their source endpoints meet. River centerlines remain open. Gaps are preserved rather than bridged with invented coordinates. Source coverage is documented and does not claim a complete watershed or guarantee map completeness. Coordinates remain geographic reference points, not access or meeting points.

The same paths are used in story, atlas, location details, and booking. White strokes, rounded joins, understated island opacity, and reduced-motion-aware drawing retain the established aesthetic. Existing OpenStreetMap attribution stays visible. Offline regeneration requires only `node scripts/build-geography.mjs`; `node scripts/fetch-geography.mjs` deliberately refreshes the network sources and respects the search rate limit.

## Full-screen booking backdrop mapping

| Destination       | Experience | Photograph          |
| ----------------- | ---------- | ------------------- |
| Lake Simcoe       | Shoreline  | `lake-simcoe`       |
| Lake Simcoe       | Ice        | `Lake-simcoe-ice`   |
| Holland River     | Shoreline  | `HollandRiver`      |
| Nottawasaga River | Shoreline  | `Nottawasaga-River` |

The four choices are valid pairs rather than independent controls that can create an invalid river/ice combination. The selected photograph, outline, and coordinates remain through the remaining questions and confirmation. The shared backend still independently rejects invalid combinations. Conditions and dates continue to be reviewed manually.

## Measurement and privacy

Existing consent gating applies to all events. Entry actions can emit `BookingEntryClicked`; encountering the form emits `BookingViewed`; the first actual interaction emits `BookingStarted`. Preference, experience-level, and destination choices have bounded categorical events. Valid trip details entering the contact step emit `BookingDetailsCompleted` and `ContactStepReached` once per flow. Existing `Lead` is retained only after successful request delivery.

No names, email addresses, phone numbers, preferred dates, or free-text notes are included in these events. Tracking remains unconfigured/off unless the existing setup and consent permit it. Browser tests inspect a local event stub; no live analytics result or conversion-rate increase is claimed.

## Mobile, motion, and accessibility

The existing passive/native scrolling, short crossfades, selective focus, and visible-only atmospheric transforms remain. Reduced motion uses separate static photographic scenes with no parallax or line animation. Booking works without animation or hover. Semantic fieldsets, labelled controls, a named step indicator, focus management, errors, the keyboard calendar, and the skip link remain.

Mobile keeps the destination photo throughout booking, uses broad selection rows with short explanations, and gives later questions the screen space instead of repeating the introductory heading. The summary stays visible before submission. Essential text remains readable over a controlled photographic scrim.

## Facts still needed from the business

No confirmed rates, exact equipment/bait/transport inclusions, weather-change/cancellation policy, credential details, or definitively identified portrait were present in the repository. These should be supplied before making those specific claims. A business inbox, verified sender, and delivery API key are still required to open live online enquiries; the existing unavailable state remains honest until configured.

The redesign does not invent low prices, reviews, credentials, catch guarantees, seasonal openings, live appointments, or instantly confirmed reservations. `VERIFICATION.md` records the actual checks. `npm run verify:visuals` reproduces the final 59-capture comparison under `.work/visual/conversion-final/`; its booking POSTs are intercepted and do not send email.
