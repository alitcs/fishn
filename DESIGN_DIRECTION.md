# fishn: a quieter, sharper fishing site

Updated 22 November 2026. The latest pass removes repetition and restores a more restrained visual hierarchy. No award or measured conversion improvement is claimed.

## Three chapters

The homepage has three full-height sections: guided fishing, booking, and Good to know. Native CSS scroll snapping settles each section into view. There is no global wheel handler or scripted scroll takeover. Longer contact steps can scroll inside their oversized section. The small section navigator and Book action return visitors to the existing booking state.

The footer sits within the final chapter, so it does not create a fourth page. Reduced motion keeps native scrolling and removes gallery animations.

## Essential copy

The hero keeps the service, Ontario, a beginner welcome, and one booking action. Booking headings are Choose your water, Choose a date, People & hours, and Your details. Repeated promises, introductory paragraphs, decorative coordinates, and duplicated trip lines were removed. Pricing, equipment, and licence answers remain behind three one-word disclosures.

The four-step flow, 2/4/6/8 hour trips, flexible group sizes, live CAD totals, licence acknowledgement, contact validation, delivery adapters, error retention, consent rules, and pending-request confirmation remain.

## Clear, square surfaces

The panes have a 1.8% neutral fill, 13px background blur, fine straight borders, no rounded corners, and no heavy surface shadow. The landscape remains visible through the pane. On the bright ice scene, dark text replaces white so the photograph can remain light. Buttons and fields use square edges throughout the same system.

## A small journal

The quiet Journal action opens a compact filmstrip drawer at the bottom of the screen. The page remains visible. The drawer mixes 23 catch and landscape photographs, excluding the five UI references. It has no oversized title, thumbnail dashboard, captions, or separate landing page.

Frames retain varied proportions, show neighboring photographs, and settle into the center with native horizontal snapping. Arrow controls, keyboard arrows, Home/End, touch swiping, Escape, explicit focus wrapping, and restoration of focus and page position are supported. Images outside the immediate frame load lazily. Originals remain untouched; display crops focus on fish and keep faces outside the selected portraits. Some hands and clothing remain where they overlap the catch.

Five additional photographs use responsive gallery-specific WebPs sized for the drawer. Existing large landscape sources are preserved. Asset preparation avoids rewriting an unchanged manifest.

## Netlify remains prepared

The user requested preparation without publishing. The Netlify static build retains the complete form blueprint and URL-encoded submission. Notification activation and the temporary recipient stay in the Netlify dashboard; the email is not embedded in frontend code. Instagram remains an optional alternate contact path. See NETLIFY_SETUP.md.

## More faithful cartography

Geography was researched using OpenStreetMap's full geometry APIs, Nominatim's geographic search output, the Ontario Hydro Network catalogue, and the Lake Simcoe Region Conservation Authority's East/West Holland references. The implemented coordinates come from OpenStreetMap and remain subject to its [ODbL attribution](https://www.openstreetmap.org/copyright).

| Motif             | Recorded source                                                                                                                                          | Result                                                                                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lake Simcoe       | [OSM relation 9984807](https://www.openstreetmap.org/relation/9984807), 7,178 source vertices                                                            | Source ways stitched at matching endpoints into one shoreline contour and 20 island contours, preserving bays and inlets.                                                               |
| Holland River     | Main-channel ways, named East Holland ways, and [West Holland relation 10579849](https://www.openstreetmap.org/relation/10579849), 1,135 source vertices | A river network with the mapped East/West branches, replacing the previous short, sparsely sampled main-channel drawing. Historical features explicitly labelled `(old)` were excluded. |
| Nottawasaga River | [OSM relation 20952468](https://www.openstreetmap.org/relation/20952468), 2,644 source vertices                                                          | Joined mapped channel sections with source meanders retained, rather than skipping two of every three vertices.                                                                         |

`data/geography-source.json` retains the retrieved WGS84 coordinates, source IDs, references, scope, and retrieval provenance outside the public bundle. `scripts/build-geography.mjs` projects to north-up Web Mercator and fits each motif to the same 500×500 drawing space. Distance-bounded simplification uses a 0.12px tolerance in that viewBox. It retains 2,283 display vertices for the lake including islands, 602 for Holland, and 999 for Nottawasaga. This is a common visual frame, not a shared geographic distance scale.

Only actual matching endpoints are stitched. Lake rings close only when their source endpoints meet. River centerlines remain open. Gaps are preserved rather than bridged with invented coordinates. Source coverage is documented and does not claim a complete watershed or guarantee map completeness. Coordinates remain geographic reference points, not access or meeting points.

The same paths are used in the atlas, location details, and booking. White strokes, rounded joins, understated island opacity, and reduced-motion-aware drawing retain the established aesthetic. Existing OpenStreetMap attribution stays visible. Offline regeneration requires only `node scripts/build-geography.mjs`; `node scripts/fetch-geography.mjs` deliberately refreshes the network sources and respects the search rate limit.

## Full-screen booking backdrop mapping

| Destination       | Experience | Photograph          |
| ----------------- | ---------- | ------------------- |
| Lake Simcoe       | Shoreline  | `lake-simcoe`       |
| Lake Simcoe       | Ice        | `Lake-simcoe-ice`   |
| Holland River     | Shoreline  | `HollandRiver`      |
| Nottawasaga River | Shoreline  | `Nottawasaga-River` |

The four choices are valid pairs rather than independent controls that can create an invalid river/ice combination. The selected photograph, outline, and coordinates remain through the remaining questions and confirmation. The shared backend still independently rejects invalid combinations. Conditions and dates continue to be reviewed manually.

## Verification and owner information

See VERIFICATION.md for the builds, tests, native scroll checks, all-image loading checks, and visual captures. The sourced outlines and attribution are unchanged. Rates follow the owner-supplied tables: $50/hour shoreline plus $20/hour per additional person, or $75/hour ice plus $25/hour per additional person. Each base rate covers the first person. All fishing gear and equipment is included. No reviews, guarantees, credentials, or confirmed availability were invented.
