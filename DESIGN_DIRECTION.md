# fishn — design direction

## Reference study

All 32 supplied JPGs were inspected in a labelled contact sheet; all five references were also opened at full size, as were the principal landscape, equipment, and winter photographs. References are excluded from public assets.

- `UIinspo.jpg`: one dominant photograph, white typography, optical texture and a tightly controlled editorial grid. Borrow the image authority and alignment; avoid its deliberately obscured text.
- `UIinspo1.jpg`: extreme restraint, a fine framing rectangle and small crosshair. Borrow the fine lines and quiet photographic framing, not artificial blur.
- `UIinspo2.jpg`: large atmospheric image, a small field-journal composition and human scale. Borrow the immersive image and the idea of a day outside; simplify the floating UI.
- `UIinspo3.jpg`: muted lake greens, generous space, fine white rules and factual field-note typography. This is the principal palette and composition reference.
- `mapUIinspo.jpg`: landscape behind a spare white geographical outline, coordinates/data in aligned small groups. The atlas uses actual sourced water geometry, white strokes, a photographic backdrop and an adjacent editorial location panel. No invented GPS measurements or decorative telemetry.

## Visual identity

“A little further from the everyday.” Quiet anticipation, like a field trip remembered as an adult. Photography leads; typography gives it a clear voice. Forest `#213a32`, ink `#202b25`, paper `#f3f2eb`, mist `#dbe1d7`, pale citron `#e7edc7`. The natural paper tone is supported by the green, hazy references. No template cards, shadows, gradients as decoration, or artificial photo filters. A restrained image scrim protects text contrast.

## Typography and composition

Locally hosted Manrope variable sans: open, direct, unusually large, with tight display tracking. System monospace only for secondary coordinates and field notes. A fluid twelve-column layout with broad margins, full-bleed hero, asymmetrical experience pair, image-led atlas, and editorial guide introduction. Compact labels at readable sizes. Generous vertical rhythm. A simple custom lowercase wordmark and line-drawn horizon mark.

## Photography

`waterlandscape1` is the primary hero: pine silhouettes, reflected clouds, and a waterway leading the eye out. `closeupreelandmug` is the shore experience and personal guide detail; `Lake-simcoe-ice` gives the winter experience an expansive landscape. `lake-simcoe`, `HollandRiver`, `Nottawasaga-River` are geographically labelled and reserved for their locations. Unlabelled landscapes are never assigned a specific location. Fish and ice details form a curated journal on experience pages. Portraits are shown as supplied trip photography without asserting a person's identity: the brief does not establish which subject is Nikita. Similar catch images are edited down rather than padded onto the homepage. See `ASSET_INVENTORY.md` for the complete audit.

Generate 480/960/1600px WebP variants, preserve originals, never upscale or stretch. Hero loads eagerly; other images lazy load and have explicit aspect ratios. No inspiration screenshot enters the public build.

## Motion

Short opacity and 1.025-scale image changes, understated navigation underlines, clear pressed states. No scroll interception, loading gate, cursor replacement or background autoplay. Reduced motion removes transitions and smooth scrolling. Content stays visible without JavaScript and without animation.

## Atlas

Source lake outline and river centre lines from OpenStreetMap via Overpass; project longitude/latitude into SVG with latitude correction. Preserve source IDs and attribution. One location selected at a time through accessible text buttons. Geography is contextual, not a meeting point, access guarantee or navigation/ice safety map. Coordinates are derived from the source geometry and explicitly labelled geographic reference points. Detail routes include sources and general Google Maps feature searches.

## Booking

One lightweight page, with experience/location preselection in query parameters. Experience changes remove ineligible locations. 1–4 hour durations and availability policy live in shared configuration used on both client and server. Custom small calendar labels every selectable day as request-only, supports keyboard arrow navigation, disables past/blocked dates, and never claims live slots. Ice requests always carry conditions/seasons/permission/guide review language. Local storage preserves only non-contact selections; personal contact data stays in memory. Licence acknowledgement is informational, not legal verification. Server validates every field and sends through Resend using an idempotency key. No configured delivery means an honest unavailable state, never a fake confirmation. Consent precedes optional attribution/analytics; Lead fires only after server acceptance.

## Mobile and accessibility

Purposeful stacked composition, independently cropped hero, readily available booking link, 44px controls, no hover-only actions. Map switches to image/outline above text controls. Real links and headings, skip navigation, visible focus, native form semantics and inline validation. Static pre-rendered route HTML supplies SEO and readable content before hydration.
